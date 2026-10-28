package com.aaspass.exception;

/**
 * Thrown when an authenticated caller attempts to act on a resource they do not own (HTTP 403).
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
