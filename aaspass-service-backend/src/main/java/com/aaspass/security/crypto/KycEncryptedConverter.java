package com.aaspass.security.crypto;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter that transparently encrypts KYC columns (Aadhaar, PAN) on write and decrypts on read.
 * Hibernate instantiates converters itself, so the {@link KycCryptoService} is supplied through a
 * static holder populated by {@link KycCryptoService} at startup. Using the converter before that
 * fails loudly rather than silently persisting plaintext.
 */
@Converter
public class KycEncryptedConverter implements AttributeConverter<String, String> {

    private static volatile KycCryptoService cryptoService;

    /** Registers the crypto service used by all converter instances. */
    public static void init(KycCryptoService service) {
        cryptoService = service;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isBlank()) {
            return null;
        }
        // Never double-encrypt a value that is already in stored form.
        if (KycCryptoService.isEncrypted(attribute)) {
            return attribute;
        }
        return requireService().encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        // Legacy plaintext rows (pre-migration) are returned unchanged.
        if (!KycCryptoService.isEncrypted(dbData)) {
            return dbData;
        }
        return requireService().decrypt(dbData);
    }

    private static KycCryptoService requireService() {
        KycCryptoService service = cryptoService;
        if (service == null) {
            throw new IllegalStateException("KycEncryptedConverter used before KycCryptoService was initialised");
        }
        return service;
    }
}
