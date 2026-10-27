package com.aaspass.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Request payload for updating the caller's KYC identifiers. A {@code null} field is left unchanged.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record KycUpdateRequest(
    String aadharNumber,
    String panNumber
) {}
