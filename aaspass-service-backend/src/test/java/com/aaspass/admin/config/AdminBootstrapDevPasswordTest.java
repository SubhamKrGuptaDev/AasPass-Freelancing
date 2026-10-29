package com.aaspass.admin.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aaspass.admin.entity.AdminUser;
import com.aaspass.admin.repository.AdminUserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

/** The well-known dev password must never be seeded silently (e.g. a prod start falling back to dev). */
@ExtendWith(OutputCaptureExtension.class)
class AdminBootstrapDevPasswordTest {

    private static final String SECRET = "AZZCL7iQpv9gatFQY3h2lOGwcLcqHb/jcS1YMHMHRmYIuLGzQr8VOY5+XkpWygvc";

    private final AdminUserRepository repository = mock(AdminUserRepository.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);

    private AdminBootstrap bootstrap(String password) {
        when(repository.count()).thenReturn(0L);
        when(encoder.encode(any())).thenReturn("$2a$hashed");
        return new AdminBootstrap(repository,
                new AdminProperties(SECRET, null, null, "admin@example.com", password, null), encoder);
    }

    @Test
    @DisplayName("seeding with the dev default password logs one ERROR naming the env vars, never the password")
    void devDefaultPasswordLogsError(CapturedOutput output) {
        bootstrap("admin12345").run();

        verify(repository).save(any(AdminUser.class));
        assertThat(output.getAll()).contains("ERROR")
                .contains("AASPASS_ADMIN_PASSWORD")
                .contains("SPRING_PROFILES_ACTIVE")
                .doesNotContain("admin12345");
        assertThat(output.getAll().split("AASPASS_ADMIN_PASSWORD", -1)).hasSize(2);
    }

    @Test
    @DisplayName("seeding with any other password logs no ERROR")
    void customPasswordLogsNoError(CapturedOutput output) {
        bootstrap("s3cure-Prod-Pass!").run();

        verify(repository).save(any(AdminUser.class));
        assertThat(output.getAll()).doesNotContain("ERROR").doesNotContain("s3cure-Prod-Pass!");
    }

    @Test
    @DisplayName("isDevDefaultPassword matches only the dev default")
    void decision() {
        assertThat(AdminBootstrap.isDevDefaultPassword("admin12345")).isTrue();
        assertThat(AdminBootstrap.isDevDefaultPassword("admin123456")).isFalse();
        assertThat(AdminBootstrap.isDevDefaultPassword(null)).isFalse();
    }
}
