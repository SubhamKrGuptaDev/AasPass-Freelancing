package com.aaspass.config;

import com.aaspass.security.crypto.KycCryptoService;
import com.aaspass.security.crypto.KycFormat;
import java.util.List;
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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * One-time, idempotent migration of legacy rows: widens the legacy narrow KYC columns, hashes
 * plaintext passwords with BCrypt, encrypts plaintext Aadhaar/PAN values that have a valid format
 * and nulls everything else (legacy pre-masked or malformed values cannot be recovered).
 * Works on raw column values through JDBC so the KYC converter is bypassed. The row updates run in
 * one transaction, so a failure part-way leaves no row half-migrated. Logs counts only.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityDataMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SecurityDataMigration.class);

    /** Ciphertext ({@code enc:v1:} + base64) needs more than the original VARCHAR(20)/VARCHAR(15). */
    private static final int KYC_COLUMN_LENGTH = 255;
    private static final List<String> KYC_COLUMNS = List.of("aadhar_number", "pan_number");

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final KycCryptoService kycCrypto;
    private final TransactionTemplate transactionTemplate;

    public SecurityDataMigration(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, KycCryptoService kycCrypto,
                                 PlatformTransactionManager transactionManager) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.kycCrypto = kycCrypto;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Override
    public void run(ApplicationArguments args) {
        int changed = migrate();
        log.info("[SECURITY MIGRATION] Migrated {} legacy user row(s)", changed);
    }

    /**
     * Widens the KYC columns if needed (DDL, outside the transaction because MySQL commits DDL
     * implicitly), then migrates all rows in a single transaction.
     *
     * @return the number of user rows that were changed
     */
    public int migrate() {
        widenKycColumns();
        Integer changed = transactionTemplate.execute(status -> migrateRows());
        return changed != null ? changed : 0;
    }

    /** {@code ddl-auto=update} never widens columns, so pre-encryption databases keep VARCHAR(20)/(15). */
    private void widenKycColumns() {
        for (String column : KYC_COLUMNS) {
            List<Long> lengths = jdbc.queryForList(
                    "SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS"
                            + " WHERE TABLE_SCHEMA = SCHEMA() AND LOWER(TABLE_NAME) = 'users'"
                            + " AND LOWER(COLUMN_NAME) = ?",
                    Long.class, column);
            Long length = lengths.isEmpty() ? null : lengths.get(0);
            if (length != null && length < KYC_COLUMN_LENGTH) {
                // Column names come from the fixed list above, never from input.
                jdbc.execute("ALTER TABLE users MODIFY COLUMN " + column + " VARCHAR(" + KYC_COLUMN_LENGTH + ") NULL");
                log.info("[SECURITY MIGRATION] Widened users.{} from {} to {}", column, length, KYC_COLUMN_LENGTH);
            }
        }
    }

    private int migrateRows() {
        List<RawRow> rows = jdbc.query(
                "SELECT id, password, aadhar_number, pan_number FROM users ORDER BY id",
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

    /** Keeps (encrypted) only values with a valid format after normalisation; anything else becomes null. */
    private String migrateKyc(String raw, boolean aadhaar) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        if (KycCryptoService.isEncrypted(raw)) {
            return raw;
        }
        String normalised = aadhaar ? KycFormat.normaliseAadhaar(raw) : KycFormat.normalisePan(raw);
        boolean valid = aadhaar ? KycFormat.isValidAadhaar(normalised) : KycFormat.isValidPan(normalised);
        return valid ? kycCrypto.encrypt(normalised) : null;
    }

    private static boolean isBcrypt(String value) {
        return value.startsWith("$2") && value.length() == 60;
    }

    private record RawRow(long id, String password, String aadhar, String pan) {
    }
}
