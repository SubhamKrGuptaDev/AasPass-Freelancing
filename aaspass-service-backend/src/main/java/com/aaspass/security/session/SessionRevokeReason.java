package com.aaspass.security.session;

/** Why a {@link UserSession} was permanently revoked. */
public enum SessionRevokeReason {
    LOGOUT,
    REUSE_DETECTED,
    PASSWORD_CHANGED,
    SUSPENDED
}
