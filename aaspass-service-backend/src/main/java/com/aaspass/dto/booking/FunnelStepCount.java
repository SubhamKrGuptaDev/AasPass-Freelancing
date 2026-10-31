package com.aaspass.dto.booking;

import com.aaspass.entity.booking.FunnelStep;

/** Distinct visitors reaching a funnel step; percent is relative to the previous step. */
public record FunnelStepCount(FunnelStep step, long visitors, double conversionPercent) {
}
