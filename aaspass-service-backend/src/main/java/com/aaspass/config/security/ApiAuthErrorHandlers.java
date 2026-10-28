package com.aaspass.config.security;

import com.aaspass.dto.response.ApiResponse;
import com.aaspass.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/**
 * Writes Spring Security's 401/403 failures in the standard {@link ApiResponse} envelope with a
 * machine-readable {@code code}: expired access token → {@code TOKEN_EXPIRED}, revoked/expired
 * session → {@code SESSION_REVOKED}, anything else → {@code UNAUTHENTICATED}; CSRF failures →
 * {@code 403 CSRF_INVALID}, other denials → {@code 403 FORBIDDEN}. Tokens are never logged.
 */
@Component
public class ApiAuthErrorHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiAuthErrorHandlers.class);

    private final ObjectMapper objectMapper;

    public ApiAuthErrorHandlers(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        ErrorCode code = classify(authException);
        String message = switch (code) {
            case TOKEN_EXPIRED -> "Access token expired";
            case SESSION_REVOKED -> "Session revoked";
            default -> "Authentication required";
        };
        log.warn("[API UNAUTHORIZED] Path: {} {}, Code: {}", request.getMethod(), request.getRequestURI(), code);
        write(response, HttpStatus.UNAUTHORIZED, message, code);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        boolean csrf = accessDeniedException instanceof CsrfException;
        ErrorCode code = csrf ? ErrorCode.CSRF_INVALID : ErrorCode.FORBIDDEN;
        String message = csrf ? "Invalid or missing CSRF token" : "Access denied";
        log.warn("[API FORBIDDEN] Path: {} {}, Code: {}", request.getMethod(), request.getRequestURI(), code);
        write(response, HttpStatus.FORBIDDEN, message, code);
    }

    /** Walks the cause chain for the JWT validation failure and maps its OAuth2 error codes. */
    static ErrorCode classify(Throwable exception) {
        Throwable current = exception;
        int depth = 0;
        while (current != null && depth++ < 16) {
            if (current instanceof JwtValidationException validation) {
                Collection<OAuth2Error> errors = validation.getErrors();
                if (hasError(errors, ActiveSessionValidator.SESSION_REVOKED)) {
                    return ErrorCode.SESSION_REVOKED;
                }
                if (hasError(errors, ExpiryValidator.TOKEN_EXPIRED)) {
                    return ErrorCode.TOKEN_EXPIRED;
                }
                return ErrorCode.UNAUTHENTICATED;
            }
            current = current.getCause();
        }
        return ErrorCode.UNAUTHENTICATED;
    }

    private static boolean hasError(Collection<OAuth2Error> errors, String errorCode) {
        if (errors == null) {
            return false;
        }
        for (OAuth2Error error : errors) {
            if (error != null && errorCode.equals(error.getErrorCode())) {
                return true;
            }
        }
        return false;
    }

    private void write(HttpServletResponse response, HttpStatus status, String message, ErrorCode code)
            throws IOException {
        if (response.isCommitted()) {
            return;
        }
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(message, code)));
    }
}
