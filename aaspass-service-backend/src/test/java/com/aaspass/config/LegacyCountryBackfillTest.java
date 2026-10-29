package com.aaspass.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LegacyCountryBackfillTest {

    @Autowired
    private LegacyCountryBackfill backfill;
    @Autowired
    private JdbcTemplate jdbc;

    private void insertUser(String username, String country) {
        jdbc.update("INSERT INTO users (name, username, email, password, has_store, country,"
                + " creation_date_time, last_updated_date_time) VALUES (?,?,?,?,?,?,?,?)",
                "Legacy", username, username + "@example.com", "x", false, country,
                LocalDateTime.now(), LocalDateTime.now());
    }

    private String country(String username) {
        return jdbc.queryForObject("SELECT country FROM users WHERE username = ?", String.class, username);
    }

    @Test
    @DisplayName("backfill() sets India on null/blank countries only, and is idempotent")
    void fillsMissingCountries() {
        insertUser("legacy_null", null);
        insertUser("legacy_blank", "  ");
        insertUser("legacy_nepal", "Nepal");

        assertThat(backfill.backfill()).isEqualTo(2);
        assertThat(country("legacy_null")).isEqualTo("India");
        assertThat(country("legacy_blank")).isEqualTo("India");
        assertThat(country("legacy_nepal")).isEqualTo("Nepal");

        assertThat(backfill.backfill()).isZero();
    }
}
