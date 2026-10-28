package com.aaspass.config.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.mock.env.MockEnvironment;

@ExtendWith(OutputCaptureExtension.class)
class DevKeysWarningTest {

    private static MockEnvironment env(String... profiles) {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(profiles);
        return env;
    }

    @Test
    void warnsWhenDevProfileUsesFallbackKeys(CapturedOutput output) {
        DevKeysWarning warning = new DevKeysWarning(env("dev"), Map.<String, String>of()::get);
        assertTrue(warning.devKeysInEffect());
        warning.warnIfDevKeys();
        assertTrue(output.getAll().contains("AASPASS_JWT_SECRET"), "startup must warn about dev keys");
    }

    @Test
    void warnsWhenOnlyOneKeyComesFromTheEnvironment() {
        assertTrue(new DevKeysWarning(env("dev"), Map.of("AASPASS_JWT_SECRET", "x")::get).devKeysInEffect());
        assertTrue(new DevKeysWarning(env("dev"), Map.of("AASPASS_KYC_KEY", "x")::get).devKeysInEffect());
    }

    @Test
    void silentWhenBothKeysComeFromTheEnvironment(CapturedOutput output) {
        DevKeysWarning warning = new DevKeysWarning(env("dev"),
                Map.of("AASPASS_JWT_SECRET", "x", "AASPASS_KYC_KEY", "y")::get);
        assertFalse(warning.devKeysInEffect());
        warning.warnIfDevKeys();
        assertFalse(output.getAll().contains("AASPASS_JWT_SECRET"));
    }

    @Test
    void silentOutsideTheDevProfile() {
        assertFalse(new DevKeysWarning(env("prod"), Map.<String, String>of()::get).devKeysInEffect());
        assertFalse(new DevKeysWarning(env("test"), Map.<String, String>of()::get).devKeysInEffect());
    }
}
