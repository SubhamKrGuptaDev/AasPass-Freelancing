package com.aaspass.admin.config;

import com.aaspass.admin.entity.AdminUser;
import com.aaspass.admin.repository.AdminUserRepository;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Seeds the first administrator from configuration when no admin exists yet. */
@Component
@Slf4j
public class AdminBootstrap implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final AdminProperties properties;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(AdminUserRepository adminUserRepository, AdminProperties properties,
                          PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.properties = properties;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            return;
        }
        String email = properties.bootstrapEmail();
        String password = properties.bootstrapPassword();
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.warn("No admin account exists and aaspass.admin.bootstrap-email/-password are not set; "
                    + "skipping admin bootstrap");
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setName(properties.bootstrapName());
        admin.setEmail(email.trim().toLowerCase(Locale.ROOT));
        admin.setPassword(passwordEncoder.encode(password));
        admin.setActive(true);
        adminUserRepository.save(admin);
        log.info("Bootstrapped initial admin account {}", admin.getEmail());
    }
}
