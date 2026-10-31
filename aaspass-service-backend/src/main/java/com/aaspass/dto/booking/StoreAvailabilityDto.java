package com.aaspass.dto.booking;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** Weekly availability plus slot settings; used as request body and response. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record StoreAvailabilityDto(Integer slotMinutes, Integer maxBookingMinutes, List<AvailabilityRangeDto> ranges) {
    public StoreAvailabilityDto {
        ranges = (ranges != null) ? ranges : List.of();
    }
}
