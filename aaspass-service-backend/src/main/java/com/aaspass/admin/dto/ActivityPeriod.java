package com.aaspass.admin.dto;

import com.aaspass.exception.BadRequestException;
import java.util.Locale;

/** Dashboard look-back window (last 1, 7 or 30 days) and Charts bucket size (day, week or month). */
public enum ActivityPeriod {
    DAILY(1),
    WEEKLY(7),
    MONTHLY(30);

    private final int days;

    ActivityPeriod(int days) {
        this.days = days;
    }

    public int days() {
        return days;
    }

    /**
     * Parses the {@code period} query parameter; blank means {@link #DAILY}.
     *
     * @throws BadRequestException when the value is not daily, weekly or monthly (case-insensitive)
     */
    public static ActivityPeriod fromParam(String value) {
        if (value == null || value.isBlank()) {
            return DAILY;
        }
        String v = value.trim().toUpperCase(Locale.ROOT);
        for (ActivityPeriod period : values()) {
            if (period.name().equals(v)) {
                return period;
            }
        }
        throw new BadRequestException("Unknown activity period: " + value);
    }
}
