package com.aaspass.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SecurityDataMigrationTest {

    @Autowired
    private SecurityDataMigration migration;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("migrate() hashes legacy passwords, encrypts plaintext KYC, nulls pre-masked KYC and is idempotent")
    void migratesLegacyRows() {
        jdbc.update("INSERT INTO users (name, username, email, password, aadhar_number, pan_number, has_store,"
                + " creation_date_time, last_updated_date_time) VALUES (?,?,?,?,?,?,?,?,?)",
                "Legacy", "legacy_user", "legacy@example.com", "plain123", "9999-1111-2222", "XXXX-XXXX-8921",
                false, java.time.LocalDateTime.now(), java.time.LocalDateTime.now());

        int changed = migration.migrate();

        assertThat(changed).isGreaterThanOrEqualTo(1);
        Map<String, Object> row = jdbc.queryForMap(
                "SELECT password, aadhar_number, pan_number FROM users WHERE username = 'legacy_user'");
        String password = (String) row.get("PASSWORD");
        assertThat(password).startsWith("$2");
        assertThat(passwordEncoder.matches("plain123", password)).isTrue();
        assertThat((String) row.get("AADHAR_NUMBER")).startsWith("enc:v1:");
        assertThat(row.get("PAN_NUMBER")).isNull();

        assertThat(migration.migrate()).isZero();
    }
}
