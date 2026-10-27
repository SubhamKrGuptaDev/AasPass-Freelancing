package com.aaspass.config;

import com.aaspass.security.crypto.KycCryptoService;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-time, idempotent migration of legacy rows: hashes plaintext passwords with BCrypt,
 * encrypts plaintext Aadhaar/PAN values, and nulls legacy pre-masked values (which cannot be recovered).
 * Works on raw column values through JDBC so the KYC converter is bypassed. Logs counts only.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityDataMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SecurityDataMigration.class);

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final KycCryptoService kycCrypto;

    public SecurityDataMigration(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, KycCryptoService kycCrypto) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.kycCrypto = kycCrypto;
    }

    @Override
    public void run(ApplicationArguments args) {
        int changed = migrate();
        log.info("[SECURITY MIGRATION] Migrated {} legacy user row(s)", changed);
    }

    /** @return the number of user rows that were changed */
    @Transactional
    public int migrate() {
        List<RawRow> rows = jdbc.query(
                "SELECT id, password, aadhar_number, pan_number FROM users",
                (rs, i) -> new RawRow(rs.getLong("id"), rs.getString("password"),
                        rs.getString("aadhar_number"), rs.getString("pan_number")));

        int changed = 0;
        for (RawRow row : rows) {
            String password = row.password() == null || isBcrypt(row.password())
                    ? row.password() : passwordEncoder.encode(row.password());
            String aadhar = migrateKyc(row.aadhar(), true);
            String pan = migrateKyc(row.pan(), false);

            if (!Objects.equals(password, row.password())
                    || !Objects.equals(aadhar, row.aadhar())
                    || !Objects.equals(pan, row.pan())) {
                jdbc.update("UPDATE users SET password = ?, aadhar_number = ?, pan_number = ? WHERE id = ?",
                        password, aadhar, pan, row.id());
                changed++;
            }
        }
        return changed;
    }

    private String migrateKyc(String raw, boolean aadhaar) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        if (KycCryptoService.isEncrypted(raw)) {
            return raw;
        }
        // Legacy pre-masked values contain 'X' and cannot be recovered.
        if (raw.toUpperCase(Locale.ROOT).contains("X")) {
            return null;
        }
        String normalised = aadhaar ? raw.replaceAll("[\\s-]", "") : raw.trim().toUpperCase(Locale.ROOT);
        return normalised.isEmpty() ? null : kycCrypto.encrypt(normalised);
    }

    private static boolean isBcrypt(String value) {
        return value.startsWith("$2") && value.length() == 60;
    }

    private record RawRow(long id, String password, String aadhar, String pan) {
    }
}
