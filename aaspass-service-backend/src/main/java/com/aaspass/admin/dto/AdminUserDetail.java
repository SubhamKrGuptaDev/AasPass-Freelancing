package com.aaspass.admin.dto;

import com.aaspass.dto.response.VerificationView;
import java.util.List;

/** Full admin view of a user. Phone, PAN and Aadhaar are intentionally unmasked; viewing is audited. */
public record AdminUserDetail(AdminUserSummary summary, String phone, String aadharNumber, String panNumber,
                              VerificationView verification, String suspensionReason, String bio, String area,
                              List<AdminStoreSummary> stores) {
}
