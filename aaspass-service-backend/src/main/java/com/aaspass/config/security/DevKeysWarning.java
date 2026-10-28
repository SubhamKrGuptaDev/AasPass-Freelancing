package com.aaspass.config.security;

import java.util.function.Function;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/**
 * Warns at startup when the committed dev-profile fallback keys are in effect, i.e. the {@code dev}
 * profile is active and {@code AASPASS_JWT_SECRET} or {@code AASPASS_KYC_KEY} is not set. Never logs
 * key values.
 */
@Component
public class DevKeysWarning {

    private static final Logger log = LoggerFactory.getLogger(DevKeysWarning.class);
    static final String JWT_SECRET_ENV = "AASPASS_JWT_SECRET";
    static final String KYC_KEY_ENV = "AASPASS_KYC_KEY";

    private final Environment environment;
    private final Function<String, String> envVars;

    @Autowired
    public DevKeysWarning(Environment environment) {
        this(environment, System::getenv);
    }

    DevKeysWarning(Environment environment, Function<String, String> envVars) {
        this.environment = environment;
        this.envVars = envVars;
    }

    /** @return true when the dev profile is active and at least one key falls back to the dev value */
    boolean devKeysInEffect() {
        return environment.acceptsProfiles(Profiles.of("dev"))
                && (isBlank(envVars.apply(JWT_SECRET_ENV)) || isBlank(envVars.apply(KYC_KEY_ENV)));
    }

    @EventListener(ApplicationReadyEvent.class)
    public void warnIfDevKeys() {
        if (devKeysInEffect()) {
            log.warn("[SECURITY] Running with dev profile keys; set {}/{} and SPRING_PROFILES_ACTIVE in production",
                    JWT_SECRET_ENV, KYC_KEY_ENV);
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
