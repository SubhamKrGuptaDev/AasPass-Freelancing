package com.aaspass.exception;

/** Machine-readable codes carried by authentication/authorization errors. */
public enum ErrorCode {
    TOKEN_EXPIRED,
    UNAUTHENTICATED,
    SESSION_REVOKED,
    INVALID_CREDENTIALS,
    FORBIDDEN,
    CSRF_INVALID,
    ACCOUNT_SUSPENDED,
    STORE_BLOCKED_BY_ADMIN,
    CONTACT_RATE_LIMITED
}
