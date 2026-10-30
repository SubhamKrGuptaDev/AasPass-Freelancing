package com.aaspass.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ContactRequestServiceMaskEmailTest {

    @Test
    void masksLocalPartKeepingFirstCharAndDomain() {
        assertEquals("a***@x.com", ContactRequestService.maskEmail("asha@x.com"));
    }

    @Test
    void handlesNullEmptyAndMalformed() {
        assertEquals("***", ContactRequestService.maskEmail(null));
        assertEquals("***", ContactRequestService.maskEmail(""));
        assertEquals("a***", ContactRequestService.maskEmail("abc"));
        assertEquals("***@x.com", ContactRequestService.maskEmail("@x.com"));
    }
}
