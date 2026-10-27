package com.aaspass.security.token;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.aaspass.config.security.SecurityProperties;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.MappedJwtClaimSetConverter;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

class JwtTokenServiceTest {

    private static final byte[] SECRET = new byte[32];

    @Test
    void issuedTokenCarriesExactlyTheDocumentedClaims() {
        String b64 = Base64.getEncoder().encodeToString(SECRET);
        SecurityProperties props = new SecurityProperties(b64, b64, "", Duration.ofMinutes(15), Duration.ofDays(30));
        JwtTokenService service = new JwtTokenService(props, Clock.systemUTC());

        String token = service.issueAccessToken(42L, "aman", "sid-123", Instant.now());

        // Spring's default claim converter parses iss as a URL; "aaspass" is a plain string.
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(new SecretKeySpec(SECRET, "HmacSHA256"))
                .macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setClaimSetConverter(MappedJwtClaimSetConverter.withDefaults(Map.of("iss", String::valueOf)));
        Jwt jwt = decoder.decode(token);
        assertEquals("aaspass", jwt.getClaimAsString("iss"));
        assertEquals("42", jwt.getSubject());
        assertEquals("sid-123", jwt.getClaimAsString("sid"));
        assertEquals("aman", jwt.getClaimAsString("username"));
        assertEquals(Duration.ofMinutes(15), Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt()));
        assertEquals(Set.of("iss", "sub", "sid", "username", "iat", "exp"), jwt.getClaims().keySet());
    }
}
