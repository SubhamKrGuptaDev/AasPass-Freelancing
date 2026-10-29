package com.aaspass.admin.dto;

/** Number of users or stores in one city over the charted range. */
public record CityCount(String city, String country, long count) {
}
