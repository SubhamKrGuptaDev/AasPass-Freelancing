package com.aaspass.admin.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.aaspass.admin.entity.AdminUser;
import com.aaspass.admin.repository.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AdminBootstrapTest {

    @Autowired AdminUserRepository adminUserRepository;
    @Autowired AdminBootstrap bootstrap;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void bootstrapsAdminOnceWithHashedPassword() {
        AdminUser admin = adminUserRepository.findByEmailIgnoreCase("ADMIN@test.local").orElseThrow();
        assertTrue(passwordEncoder.matches("admin12345", admin.getPassword()));
        assertTrue(Boolean.TRUE.equals(admin.getActive()));

        bootstrap.run();
        assertEquals(1, adminUserRepository.count());
    }
}
