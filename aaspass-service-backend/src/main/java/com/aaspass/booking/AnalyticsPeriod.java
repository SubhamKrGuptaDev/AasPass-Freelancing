package com.aaspass.booking;

import com.aaspass.exception.BadRequestException;

import java.time.LocalDate;
import java.util.Locale;

/** Analytics look-back window. Pure; dates are store-local. */
public enum AnalyticsPeriod {
    D7("7D", 6L),
    D30("30D", 29L),
    ALL("ALL", null);

    /** Number of daily trend buckets for ALL. */
    public static final int ALL_TREND_DAYS = 90;

    private final String param;
    private final Long daysBack;

    AnalyticsPeriod(String param, Long daysBack) {
        this.param = param;
        this.daysBack = daysBack;
    }

    public String param() {
        return param;
    }

    /** Parses 7D / 30D / ALL (case-insensitive); anything else is a 400. */
    public static AnalyticsPeriod fromParam(String value) {
        String v = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        for (AnalyticsPeriod period : values()) {
            if (period.param.equals(v)) {
                return period;
            }
        }
        throw new BadRequestException("Unknown analytics period: " + value);
    }

    /** First day of the period, or null for ALL (no lower bound). */
    public LocalDate start(LocalDate today) {
        return daysBack == null ? null : today.minusDays(daysBack);
    }

    /** First day of the daily trend (ALL = last 90 days). */
    public LocalDate trendStart(LocalDate today) {
        return daysBack == null ? today.minusDays(ALL_TREND_DAYS - 1L) : today.minusDays(daysBack);
    }
}
