package com.aaspass.exception;

/** Thrown when a request conflicts with the current state of a resource (mapped to HTTP 409). */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
