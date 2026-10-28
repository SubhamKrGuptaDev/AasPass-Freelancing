package com.aaspass.dto.response;

import com.aaspass.exception.ErrorCode;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Standardized generic API response envelope for all REST endpoints.
 * {@code code} carries a machine-readable {@link ErrorCode} name on auth errors and is
 * {@code null} otherwise.
 *
 * @param <T> Payload data type
 */
@Builder
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    LocalDateTime timestamp,
    String code
) {

    public ApiResponse {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now(), null);
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now(), null);
    }

    public static <T> ApiResponse<T> error(String message, T errorDetails) {
        return new ApiResponse<>(false, message, errorDetails, LocalDateTime.now(), null);
    }

    /** Error envelope carrying a machine-readable {@link ErrorCode}. */
    public static <T> ApiResponse<T> error(String message, ErrorCode code) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now(), code == null ? null : code.name());
    }
}
