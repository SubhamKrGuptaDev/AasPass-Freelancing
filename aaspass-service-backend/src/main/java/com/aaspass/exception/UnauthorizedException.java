package com.aaspass.exception;

public class UnauthorizedException extends RuntimeException {

    private final ErrorCode code;

    public UnauthorizedException(String message) {
        this(message, ErrorCode.UNAUTHENTICATED);
    }

    public UnauthorizedException(String message, ErrorCode code) {
        super(message);
        this.code = code == null ? ErrorCode.UNAUTHENTICATED : code;
    }

    /** @return the machine-readable error code (defaults to {@link ErrorCode#UNAUTHENTICATED}). */
    public ErrorCode code() {
        return code;
    }
}
