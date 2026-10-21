package com.aaspass.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Standardized generic API response envelope for all REST endpoints.
 *
 * @param <T> Payload data type
 */
@Builder
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    LocalDateTime timestamp
) {

    public ApiResponse {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(String message, T errorDetails) {
        return new ApiResponse<>(false, message, errorDetails, LocalDateTime.now());
    }
}
