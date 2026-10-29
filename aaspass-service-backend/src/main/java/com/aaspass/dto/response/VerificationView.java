package com.aaspass.dto.response;

import com.aaspass.entity.User;
import com.aaspass.entity.VerificationCheck;
import com.aaspass.entity.VerificationStatus;

/** Per-identifier verification state, shown only to the user themself. */
public record VerificationView(ItemView phone, ItemView pan, ItemView aadhar) {

    public record ItemView(VerificationStatus status, String reason) {

        static ItemView of(VerificationCheck check) {
            if (check == null) {
                return new ItemView(VerificationStatus.UNVERIFIED, null);
            }
            return new ItemView(
                    check.getStatus() != null ? check.getStatus() : VerificationStatus.UNVERIFIED,
                    check.getReason());
        }
    }

    public static VerificationView of(User u) {
        if (u == null) {
            return null;
        }
        return new VerificationView(
                ItemView.of(u.getPhoneVerification()),
                ItemView.of(u.getPanVerification()),
                ItemView.of(u.getAadharVerification()));
    }
}
