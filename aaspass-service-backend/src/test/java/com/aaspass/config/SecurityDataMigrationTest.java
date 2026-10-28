package com.aaspass.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.aaspass.security.crypto.KycCryptoService;
import java.time.LocalDateTime;
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
    @Autowired
    private KycCryptoService kycCrypto;

    private void insertLegacy(String username, String password, String aadhaar, String pan) {
        jdbc.update("INSERT INTO users (name, username, email, password, aadhar_number, pan_number, has_store,"
                + " creation_date_time, last_updated_date_time) VALUES (?,?,?,?,?,?,?,?,?)",
                "Legacy", username, username + "@example.com", password, aadhaar, pan,
                false, LocalDateTime.now(), LocalDateTime.now());
    }

    private Map<String, Object> row(String username) {
        return jdbc.queryForMap("SELECT password, aadhar_number, pan_number FROM users WHERE username = ?", username);
    }

    @Test
    @DisplayName("migrate() hashes legacy passwords, encrypts valid KYC by format, nulls invalid/masked KYC, is idempotent")
    void migratesLegacyRows() {
        insertLegacy("legacy_one", "plain123", "9999-1111-2222", "XXXXXX234F");
        insertLegacy("legacy_two", "plain456", "XXXX-XXXX-8921", " axxpk1234l ");

        int changed = migration.migrate();

        assertThat(changed).isEqualTo(2);

        Map<String, Object> one = row("legacy_one");
        String password = (String) one.get("PASSWORD");
        assertThat(password).startsWith("$2");
        assertThat(passwordEncoder.matches("plain123", password)).isTrue();
        String aadhaar = (String) one.get("AADHAR_NUMBER");
        assertThat(aadhaar).startsWith("enc:v1:");
        assertThat(kycCrypto.decrypt(aadhaar)).isEqualTo("999911112222");
        assertThat(one.get("PAN_NUMBER")).isNull();

        Map<String, Object> two = row("legacy_two");
        assertThat(passwordEncoder.matches("plain456", (String) two.get("PASSWORD"))).isTrue();
        assertThat(two.get("AADHAR_NUMBER")).isNull();
        String pan = (String) two.get("PAN_NUMBER");
        assertThat(pan).startsWith("enc:v1:");
        assertThat(kycCrypto.decrypt(pan)).isEqualTo("AXXPK1234L");

        assertThat(migration.migrate()).isZero();
    }
}
