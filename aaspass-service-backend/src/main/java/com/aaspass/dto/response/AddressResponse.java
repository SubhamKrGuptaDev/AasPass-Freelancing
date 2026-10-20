package com.aaspass.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response DTO representing an Address entity.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private Long id;
    private Long userId;
    private String addressType;
    private String addressLine;
    private String area;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
    private LocalDateTime creationDateTime;
    private LocalDateTime lastUpdateDateTime;
}
