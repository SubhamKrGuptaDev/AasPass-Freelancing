package com.aaspass.admin.entity;

/** Actions recorded in the admin audit log. */
public enum AdminAuditAction {
    LOGIN,
    VIEW_USER_KYC,
    VERIFY_ITEM,
    REJECT_ITEM,
    SUSPEND_USER,
    LIFT_SUSPENSION,
    BLOCK_STORE,
    UNBLOCK_STORE,
    REVIEW_STORE,
    UPDATE_CONTACT_REQUEST
}
