package com.aaspass.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doCallRealMethod;
import static org.mockito.Mockito.doThrow;

import com.aaspass.security.crypto.KycCryptoService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

/**
 * Migration behaviour that needs DDL or real commits, so it runs against its own in-memory
 * database (never shared with other test classes) and without a surrounding test transaction.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties =
        "spring.datasource.url=jdbc:h2:mem:aaspass_migration;MODE=MySQL;DB_CLOSE_DELAY=-1")
class SecurityDataMigrationSchemaTest {

    @Autowired
    private SecurityDataMigration migration;
    @Autowired
    private JdbcTemplate jdbc;
    @MockitoSpyBean
    private KycCryptoService kycCrypto;

    @AfterEach
    void cleanUp() {
        doCallRealMethod().when(kycCrypto).encrypt(anyString());
        jdbc.update("DELETE FROM users WHERE username LIKE 'legacy_%'");
    }

    private void insertLegacy(String username, String password, String aadhaar, String pan) {
        jdbc.update("INSERT INTO users (name, username, email, password, aadhar_number, pan_number, has_store,"
                + " creation_date_time, last_updated_date_time) VALUES (?,?,?,?,?,?,?,?,?)",
                "Legacy", username, username + "@example.com", password, aadhaar, pan,
                false, LocalDateTime.now(), LocalDateTime.now());
    }

    private Integer columnLength(String column) {
        return jdbc.queryForObject("SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS"
                + " WHERE LOWER(TABLE_NAME) = 'users' AND LOWER(COLUMN_NAME) = ?", Integer.class, column);
    }

    @Test
    @DisplayName("migrate() widens the legacy narrow KYC columns before encrypting into them")
    void widensNarrowLegacyColumns() {
        // Recreate the original schema: VARCHAR(20)/VARCHAR(15) holding plaintext.
        jdbc.update("UPDATE users SET aadhar_number = NULL, pan_number = NULL");
        jdbc.execute("ALTER TABLE users MODIFY COLUMN aadhar_number VARCHAR(20)");
        jdbc.execute("ALTER TABLE users MODIFY COLUMN pan_number VARCHAR(15)");
        assertThat(columnLength("aadhar_number")).isEqualTo(20);
        insertLegacy("legacy_narrow", "plain123", "1234 5678 9012", "ABCDE1234F");

        assertThat(migration.migrate()).isEqualTo(1);

        assertThat(columnLength("aadhar_number")).isEqualTo(255);
        assertThat(columnLength("pan_number")).isEqualTo(255);
        String aadhaar = jdbc.queryForObject(
                "SELECT aadhar_number FROM users WHERE username = 'legacy_narrow'", String.class);
        assertThat(kycCrypto.decrypt(aadhaar)).isEqualTo("123456789012");
        // Already wide: nothing to alter, nothing to migrate.
        assertThat(migration.migrate()).isZero();
    }

    @Test
    @DisplayName("the startup entry point rolls back every row when a later row fails")
    void midRunFailureRollsBack() {
        insertLegacy("legacy_a", "plainA", null, null);
        insertLegacy("legacy_b", "plainB", "123412341234", null);
        doThrow(new IllegalStateException("boom")).when(kycCrypto).encrypt(anyString());

        // Through run(), the path Spring Boot uses at startup (a self-invocation inside the bean).
        assertThatThrownBy(() -> migration.run(new DefaultApplicationArguments())).isInstanceOf(IllegalStateException.class);

        assertThat(jdbc.queryForObject("SELECT password FROM users WHERE username = 'legacy_a'", String.class))
                .isEqualTo("plainA");
    }
}
