package com.aaspass.config;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time, idempotent backfill: rows created before the {@code country} column existed have it
 * null (or blank), which splits them from same-city rows in admin statistics and hides them from
 * country filters. Every such row is set to {@link #DEFAULT_COUNTRY}, the same default new users
 * and stores get. Once no rows match, it does nothing. Logs counts only.
 */
@Component
public class LegacyCountryBackfill implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LegacyCountryBackfill.class);

    static final String DEFAULT_COUNTRY = "India";
    private static final List<String> TABLES = List.of("users", "stores");

    private final JdbcTemplate jdbc;

    public LegacyCountryBackfill(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        int changed = backfill();
        if (changed > 0) {
            log.info("[COUNTRY BACKFILL] Set country to {} on {} legacy row(s)", DEFAULT_COUNTRY, changed);
        }
    }

    /** @return the number of rows whose country was filled in */
    public int backfill() {
        int changed = 0;
        for (String table : TABLES) {
            // Table names come from the fixed list above, never from input.
            changed += jdbc.update("UPDATE " + table + " SET country = ? WHERE country IS NULL OR TRIM(country) = ''",
                    DEFAULT_COUNTRY);
        }
        return changed;
    }
}
