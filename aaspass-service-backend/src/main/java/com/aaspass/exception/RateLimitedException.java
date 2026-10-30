package com.aaspass.exception;

/** Thrown when a caller exceeds a submission throttle (HTTP 429). */
public class RateLimitedException extends RuntimeException {

    public RateLimitedException(String message) {
        super(message);
    }

    public ErrorCode getCode() {
        return ErrorCode.CONTACT_RATE_LIMITED;
    }
}
