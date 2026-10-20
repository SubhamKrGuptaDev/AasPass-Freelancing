package com.aaspass.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for creating or updating a user address.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {

    private String addressType; // HOME, WORK, OTHER

    private String addressLine;

    @NotBlank(message = "Area / neighborhood is required")
    private String area;

    @NotBlank(message = "City is required")
    private String city;

    private String state;
    private String pincode;
    private String landmark;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
}
