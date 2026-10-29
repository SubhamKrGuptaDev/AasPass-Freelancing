package com.aaspass.admin.dto;

import com.aaspass.admin.entity.AdminUser;

/** The signed-in administrator as returned by the admin auth endpoints. */
public record AdminProfile(Long id, String name, String email) {

    public static AdminProfile from(AdminUser admin) {
        if (admin == null) {
            throw new IllegalArgumentException("admin is required");
        }
        return new AdminProfile(admin.getId(), admin.getName(), admin.getEmail());
    }
}
