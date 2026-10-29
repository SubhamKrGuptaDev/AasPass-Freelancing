package com.aaspass.entity;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class UserVerificationTest {

    private User verifiedUser() {
        User u = User.builder().name("A").username("a").email("a@x").password("p")
                .phone("+91 98765 43210").aadharNumber("123412341234").panNumber("ABCDE1234F").build();
        u.getPhoneVerification().decide(VerificationStatus.VERIFIED, null, 1L, Instant.now());
        u.getPanVerification().decide(VerificationStatus.VERIFIED, null, 1L, Instant.now());
        u.getAadharVerification().decide(VerificationStatus.VERIFIED, null, 1L, Instant.now());
        return u;
    }

    @Test
    void newUserDefaultsToUnverified() {
        User u = User.builder().name("A").username("a").email("a@x").password("p").build();
        assertEquals(VerificationStatus.UNVERIFIED, u.getPhoneVerification().getStatus());
        assertEquals(VerificationStatus.UNVERIFIED, u.getPanVerification().getStatus());
        assertEquals(VerificationStatus.UNVERIFIED, u.getAadharVerification().getStatus());
        assertFalse(u.isFullyVerified());
    }

    @Test
    void nullEmbeddedCheckIsTreatedAsUnverified() {
        User u = new User();
        u.setPhoneVerification(null);
        u.setPanVerification(null);
        u.setAadharVerification(null);
        assertEquals(VerificationStatus.UNVERIFIED, u.getPhoneVerification().getStatus());
        assertEquals(VerificationStatus.UNVERIFIED, u.getPanVerification().getStatus());
        assertEquals(VerificationStatus.UNVERIFIED, u.getAadharVerification().getStatus());
    }

    @Test
    void fullyVerifiedWhenAllThreeVerified() {
        assertTrue(verifiedUser().isFullyVerified());
    }

    @Test
    void changingPhoneResetsOnlyPhoneCheck() {
        User u = verifiedUser();
        u.updatePhone("+91 90000 00000");
        assertEquals(VerificationStatus.UNVERIFIED, u.getPhoneVerification().getStatus());
        assertNull(u.getPhoneVerification().getDecidedAt());
        assertEquals(VerificationStatus.VERIFIED, u.getPanVerification().getStatus());
    }

    @Test
    void samePhoneKeepsVerification() {
        User u = verifiedUser();
        u.updatePhone(u.getPhone());
        assertEquals(VerificationStatus.VERIFIED, u.getPhoneVerification().getStatus());
    }

    @Test
    void changingPanAndAadharResetsOwnChecksOnly() {
        User u = verifiedUser();
        u.updatePanNumber("ZZZZZ9999Z");
        assertEquals(VerificationStatus.UNVERIFIED, u.getPanVerification().getStatus());
        assertEquals(VerificationStatus.VERIFIED, u.getAadharVerification().getStatus());
        u.updateAadharNumber("999999999999");
        assertEquals(VerificationStatus.UNVERIFIED, u.getAadharVerification().getStatus());
        assertEquals(VerificationStatus.VERIFIED, u.getPhoneVerification().getStatus());
    }

    @Test
    void suspensionIsTimeBound() {
        Instant now = Instant.parse("2026-10-29T10:00:00Z");
        User u = new User();
        u.setSuspendedUntil(now.plusSeconds(60));
        assertTrue(u.isSuspended(now));
        assertFalse(u.isSuspended(now.plusSeconds(61)));
        u.setSuspendedUntil(null);
        assertFalse(u.isSuspended(now));
    }

    @Test
    void storeHiddenWhenBlockedOrOwnerSuspended() {
        Instant now = Instant.parse("2026-10-29T10:00:00Z");
        User owner = new User();
        Store s = new Store();
        s.setUser(owner);
        assertFalse(s.isAdminHidden(now));
        s.setAdminBlocked(true);
        assertTrue(s.isAdminHidden(now));
        s.setAdminBlocked(false);
        owner.setSuspendedUntil(now.plusSeconds(60));
        assertTrue(s.isAdminHidden(now));
        s.setAdminBlocked(null);
        s.setUser(null);
        assertFalse(s.isAdminHidden(now));
    }
}
