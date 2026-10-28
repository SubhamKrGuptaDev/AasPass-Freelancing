package com.aaspass.exception;

/** Thrown when a session is revoked, expired, or a rotated refresh token is replayed. */
public class SessionRevokedException extends UnauthorizedException {

    public SessionRevokedException(String message) {
        super(message, ErrorCode.SESSION_REVOKED);
    }
}
