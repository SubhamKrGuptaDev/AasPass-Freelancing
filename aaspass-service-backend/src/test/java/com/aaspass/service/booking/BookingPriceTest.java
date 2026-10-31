package com.aaspass.service.booking;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class BookingPriceTest {

    @Test
    void chargesHourlyRateForBookedMinutes() {
        assertThat(BookingService.totalPrice(new BigDecimal("350"), 60)).isEqualByComparingTo("350");
        assertThat(BookingService.totalPrice(new BigDecimal("350"), 90)).isEqualByComparingTo("525");
        assertThat(BookingService.totalPrice(new BigDecimal("350"), 30)).isEqualByComparingTo("175");
        assertThat(BookingService.totalPrice(new BigDecimal("100"), 20)).isEqualByComparingTo("33.33");
    }

    @Test
    void missingRateStaysNull() {
        assertThat(BookingService.totalPrice(null, 90)).isNull();
    }
}
