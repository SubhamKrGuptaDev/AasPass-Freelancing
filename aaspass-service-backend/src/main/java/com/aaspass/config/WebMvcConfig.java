package com.aaspass.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Web configuration for Cross-Origin Resource Sharing (CORS).
 * The rules are exposed as the single {@link CorsConfigurationSource} bean, which Spring Security
 * applies via {@code http.cors()} ahead of authentication (so preflights are never rejected).
 */
@Configuration
public class WebMvcConfig {

    private static final Logger log = LoggerFactory.getLogger(WebMvcConfig.class);

    /**
     * @param allowedOrigins exact origins from {@code aaspass.cors.allowed-origins} (comma-separated);
     *                       blank entries are dropped
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${aaspass.cors.allowed-origins}") List<String> allowedOrigins) {
        List<String> origins = allowedOrigins == null ? List.of() : allowedOrigins.stream()
                .filter(origin -> origin != null && !origin.isBlank())
                .map(String::trim)
                .toList();
        log.info("[CONFIG] Registering Cross-Origin Resource Sharing (CORS) rules for /api/** ({} origin(s): {})",
                origins.size(), origins);
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
