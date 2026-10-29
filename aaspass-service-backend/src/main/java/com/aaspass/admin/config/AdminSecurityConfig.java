package com.aaspass.admin.config;

import static org.springframework.security.config.Customizer.withDefaults;

import com.aaspass.admin.security.AdminActiveSessionValidator;
import com.aaspass.admin.security.AdminCookieBearerTokenResolver;
import com.aaspass.admin.security.AdminJwtTokenService;
import com.aaspass.admin.security.AdminSessionService;
import com.aaspass.config.security.ApiAuthErrorHandlers;
import com.aaspass.config.security.CsrfCookieFilter;
import com.aaspass.config.security.ExpiryValidator;
import com.aaspass.config.security.SecurityConfig;
import java.time.Clock;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * The admin security chain for {@code /api/admin/**}, ordered before the user chain. It has its own
 * HS256 decoder (admin secret, issuer {@code aaspass-admin}, {@code typ=admin}, live admin session)
 * and reads only the {@code _asid} cookie, so user tokens never authenticate here and admin tokens
 * never authenticate on the user chain. CSRF uses the shared {@code XSRF-TOKEN} repository and
 * exempts only admin login and refresh.
 */
@Configuration
public class AdminSecurityConfig {

    public static final String ADMIN_JWT_DECODER = "adminJwtDecoder";

    @Bean(name = ADMIN_JWT_DECODER)
    public JwtDecoder adminJwtDecoder(AdminProperties properties, Clock clock, AdminSessionService sessionService) {
        return SecurityConfig.hs256Decoder(properties.jwtSecretBytes(),
                new JwtIssuerValidator(AdminJwtTokenService.ISSUER),
                new ExpiryValidator(clock),
                new AdminActiveSessionValidator(sessionService));
    }

    @Bean
    @Order(1)
    public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http,
                                                        CookieCsrfTokenRepository csrfTokenRepository,
                                                        ApiAuthErrorHandlers errorHandlers,
                                                        @Qualifier(ADMIN_JWT_DECODER) JwtDecoder adminJwtDecoder)
            throws Exception {
        PathPatternRequestMatcher.Builder paths = PathPatternRequestMatcher.withDefaults();
        RequestMatcher csrfExempt = new OrRequestMatcher(
                paths.matcher(HttpMethod.POST, "/api/admin/auth/login"),
                paths.matcher(HttpMethod.POST, "/api/admin/auth/refresh"));

        http
                .securityMatcher("/api/admin/**")
                // CSRF exempts only admin login/refresh; logout and every other write need X-XSRF-TOKEN.
                .csrf(SecurityConfig.cookieCsrf(csrfTokenRepository, csrfExempt))
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
                        .bearerTokenResolver(new AdminCookieBearerTokenResolver())
                        .jwt(jwt -> jwt.decoder(adminJwtDecoder))
                        .authenticationEntryPoint(errorHandlers)
                        .accessDeniedHandler(errorHandlers))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST,
                                "/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/logout")
                        .permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }
}
