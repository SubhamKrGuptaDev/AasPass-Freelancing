package com.aaspass.admin.service;

import com.aaspass.admin.dto.AdminOwnerSummary;
import com.aaspass.admin.dto.AdminStoreSummary;
import com.aaspass.admin.dto.AdminUserSummary;
import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import org.springframework.stereotype.Component;

/** Entity-to-DTO mapping for admin views. Call inside a transaction, as the store's user is lazy. */
@Component
public class AdminMapper {

    public AdminStoreSummary toStoreSummary(Store store) {
        if (store == null) {
            return null;
        }
        User owner = store.getUser();
        String ownerName = owner != null && owner.getName() != null ? owner.getName() : store.getOwnerName();
        return new AdminStoreSummary(
                store.getId(),
                store.getStoreName(),
                store.getCategory(),
                owner != null ? owner.getId() : null,
                ownerName,
                owner != null ? owner.getUsername() : null,
                store.getCity(),
                store.getCountry(),
                store.getArea(),
                Boolean.TRUE.equals(store.getIsActive()),
                Boolean.TRUE.equals(store.getAdminBlocked()),
                store.getAdminReviewedAt() != null,
                store.getCreationDateTime());
    }

    /** Maps a user to a list row; touches the lazy {@code stores} collection, so call inside a transaction. */
    public AdminUserSummary toUserSummary(User user) {
        if (user == null) {
            return null;
        }
        return new AdminUserSummary(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getCity(),
                user.getCountry(),
                user.getPhoneVerification().getStatus(),
                user.getPanVerification().getStatus(),
                user.getAadharVerification().getStatus(),
                user.getSuspendedUntil(),
                user.getStores() == null ? 0 : user.getStores().size(),
                user.getCreationDateTime());
    }

    public AdminOwnerSummary toOwnerSummary(User user) {
        if (user == null) {
            return null;
        }
        return new AdminOwnerSummary(user.getId(), user.getName(), user.getUsername(), user.getEmail(),
                user.isFullyVerified(), user.getSuspendedUntil());
    }
}
