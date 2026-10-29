package com.aaspass.exception;

/**
 * Thrown when an authenticated caller attempts to act on a resource they do not own (HTTP 403).
 */
public class ForbiddenException extends RuntimeException {

    private final ErrorCode code;

    public ForbiddenException(String message) {
        this(message, ErrorCode.FORBIDDEN);
    }

    public ForbiddenException(String message, ErrorCode code) {
        super(message);
        this.code = code == null ? ErrorCode.FORBIDDEN : code;
    }

    public ErrorCode code() {
        return code;
    }
}
