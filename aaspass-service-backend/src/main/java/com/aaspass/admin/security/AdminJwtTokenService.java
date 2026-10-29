package com.aaspass.admin.security;

import com.aaspass.admin.config.AdminProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.time.Instant;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

/**
 * Issues short-lived HS256 admin access JWTs, signed with the admin-only secret and issuer
 * {@value #ISSUER}, carrying {@code sub} (admin id), {@code sid}, {@code email} and
 * {@code typ=admin}. User tokens use a different secret and issuer, so neither validates as the other.
 */
@Service
public class AdminJwtTokenService {

    public static final String ISSUER = "aaspass-admin";
    public static final String TYPE_CLAIM = "typ";
    public static final String ADMIN_TYPE = "admin";

    private final JwtEncoder encoder;
    private final AdminProperties properties;

    public AdminJwtTokenService(AdminProperties properties) {
        this.properties = properties;
        SecretKey key = new SecretKeySpec(properties.jwtSecretBytes(), "HmacSHA256");
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }

    public String issueAccessToken(Long adminId, String email, String sessionId, Instant issuedAt) {
        if (adminId == null) {
            throw new IllegalArgumentException("adminId is required");
        }
        if (issuedAt == null) {
            throw new IllegalArgumentException("issuedAt is required");
        }
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(adminId))
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(properties.accessTokenTtl()))
                .claim("sid", sessionId)
                .claim("email", email)
                .claim(TYPE_CLAIM, ADMIN_TYPE)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
