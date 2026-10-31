package com.aaspass.config.security;

import static org.springframework.security.config.Customizer.withDefaults;

import com.aaspass.security.session.SessionService;
import com.aaspass.security.token.AuthCookieService;
import com.aaspass.security.token.JwtTokenService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.util.Map;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.ObjectPostProcessor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.MappedJwtClaimSetConverter;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.authentication.session.NullAuthenticatedSessionStrategy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.AndRequestMatcher;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Spring Security configuration: stateless JWT resource server reading the access token from the
 * HttpOnly {@code _sid} cookie, cookie-based CSRF ({@code XSRF-TOKEN} / {@code X-XSRF-TOKEN}),
 * CORS from the MVC {@code CorsConfigurationSource} bean, and the endpoint rules of spec §5.1.
 * Also provides the shared {@link PasswordEncoder} (BCrypt, cost 12) and {@link Clock} beans.
 */
@Configuration
public class SecurityConfig {

    private static final String CSRF_COOKIE_PATH = "/";

    /** BCrypt with cost 12. Static so it can be created without instantiating this configuration. */
    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /** Shared clock so time-dependent security code is testable. */
    @Bean
    public static Clock clock() {
        return Clock.systemUTC();
    }

    /**
     * HS256 decoder for the access JWT. {@code iss} is kept as a plain string (Spring's default
     * converter would try to parse it as a URL and fail on "aaspass"); validation covers issuer,
     * expiry/not-before (zero skew; expiry → {@code token_expired}) and live session ({@code session_revoked}).
     */
    @Bean
    @Primary
    public JwtDecoder jwtDecoder(SecurityProperties properties, Clock clock, SessionService sessionService) {
        return hs256Decoder(properties.jwtSecretBytes(),
                new JwtIssuerValidator(JwtTokenService.ISSUER),
                new ExpiryValidator(clock),
                new ActiveSessionValidator(sessionService));
    }

    /**
     * Builds an HS256 decoder for {@code secret} that keeps {@code iss} as a plain string and applies
     * exactly {@code validators}. Shared by the user and admin decoders (each with its own secret).
     */
    @SafeVarargs
    public static NimbusJwtDecoder hs256Decoder(byte[] secret, OAuth2TokenValidator<Jwt>... validators) {
        SecretKey key = new SecretKeySpec(secret, "HmacSHA256");
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        Converter<Object, ?> issuerAsString = value -> value == null ? null : value.toString();
        decoder.setClaimSetConverter(MappedJwtClaimSetConverter.withDefaults(Map.of(JwtClaimNames.ISS, issuerAsString)));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(validators));
        return decoder;
    }

    /**
     * CSRF cookie repository: {@code XSRF-TOKEN} readable by JS, path {@code /}, SameSite=Strict,
     * with the same host-based Secure/Domain rules as the auth cookies.
     */
    @Bean
    public CookieCsrfTokenRepository csrfTokenRepository(AuthCookieService authCookieService) {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookiePath(CSRF_COOKIE_PATH);
        repository.setCookieCustomizer(builder -> customizeCsrfCookie(builder, authCookieService));
        return repository;
    }

    /**
     * The repository's customizer receives no request, so the current one is taken from
     * {@link RequestContextHolder} (Boot's RequestContextFilter runs before the security chain).
     * Without a bound request the cookie falls back to Secure and host-only.
     */
    static void customizeCsrfCookie(ResponseCookie.ResponseCookieBuilder builder, AuthCookieService authCookieService) {
        builder.sameSite("Strict").path(CSRF_COOKIE_PATH);
        HttpServletRequest request = currentRequest();
        if (request != null) {
            authCookieService.applyHostRules(builder, request);
        } else {
            builder.secure(true);
        }
    }

    private static HttpServletRequest currentRequest() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            return servletAttributes.getRequest();
        }
        return null;
    }

    /**
     * Cookie-based CSRF for a stateless cookie-JWT chain: the shared {@code XSRF-TOKEN} repository,
     * no token clearing on authentication, and protection on every unsafe method except
     * {@code csrfExempt}. Shared by the user and admin chains.
     */
    public static Customizer<CsrfConfigurer<HttpSecurity>> cookieCsrf(CookieCsrfTokenRepository csrfTokenRepository,
                                                                     RequestMatcher csrfExempt) {
        RequestMatcher requiresCsrf = new AndRequestMatcher(
                CsrfFilter.DEFAULT_CSRF_MATCHER, new NegatedRequestMatcher(csrfExempt));
        return csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository)
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                // The default CsrfAuthenticationStrategy clears the token on every authentication.
                // Sessions are stateless, so each cookie-JWT request counts as a fresh authentication
                // and every response would expire XSRF-TOKEN, failing the page's next write.
                .sessionAuthenticationStrategy(new NullAuthenticatedSessionStrategy())
                // CSRF exemptions live only in the post-processor's matcher below (single source).
                // The resource server registers a CSRF exemption for every request carrying a
                // bearer token, assuming header-borne tokens. Ours is a cookie the browser sends
                // automatically, so pin the matcher to exempt only the given endpoints.
                .withObjectPostProcessor(new ObjectPostProcessor<CsrfFilter>() {
                    @Override
                    public <O extends CsrfFilter> O postProcess(O filter) {
                        filter.setRequireCsrfProtectionMatcher(requiresCsrf);
                        return filter;
                    }
                });
    }

    /**
     * The user chain. Ordered after the admin chain ({@code /api/admin/**}), so it serves every other
     * request. The decoder is named explicitly because a second (admin) {@link JwtDecoder} exists.
     */
    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   CookieCsrfTokenRepository csrfTokenRepository,
                                                   ApiAuthErrorHandlers errorHandlers,
                                                   @Qualifier("jwtDecoder") JwtDecoder jwtDecoder) throws Exception {
        PathPatternRequestMatcher.Builder paths = PathPatternRequestMatcher.withDefaults();
        RequestMatcher csrfExempt = new OrRequestMatcher(
                paths.matcher(HttpMethod.POST, "/api/auth/login"),
                paths.matcher(HttpMethod.POST, "/api/auth/register"),
                paths.matcher(HttpMethod.POST, "/api/auth/refresh"));

        http
                // CSRF exempts only login/register/refresh.
                .csrf(cookieCsrf(csrfTokenRepository, csrfExempt))
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(withDefaults())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(errorHandlers)
                        .accessDeniedHandler(errorHandlers))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(new CookieBearerTokenResolver())
                        .jwt(jwt -> jwt.decoder(jwtDecoder))
                        .authenticationEntryPoint(errorHandlers)
                        .accessDeniedHandler(errorHandlers))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/logout")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/check-username", "/api/auth/check-email")
                        .permitAll()
                        // Public booking reads covered by this matcher: GET /api/stores/{id}/slots and /api/stores/{id}/availability
                        .requestMatchers(HttpMethod.GET, "/api/stores/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/stores/*/views").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/stores/*/funnel-events").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/*/profile-picture").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }
}
