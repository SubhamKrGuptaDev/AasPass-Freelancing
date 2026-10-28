package com.aaspass.security.crypto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class KycMaskingTest {

    @Test
    void masksAadhaarKeepingLastFour() {
        assertEquals("XXXXXXXX7777", KycMasking.maskAadhaar("999988887777"));
    }

    @Test
    void masksPanKeepingLastFour() {
        assertEquals("XXXXXX234F", KycMasking.maskPan("ABCDE1234F"));
    }

    @Test
    void shortValuesAreFullyMasked() {
        assertEquals("XX", KycMasking.maskAadhaar("12"));
    }

    @Test
    void nullStaysNull() {
        assertNull(KycMasking.maskPan(null));
        assertNull(KycMasking.maskAadhaar(null));
    }
}
