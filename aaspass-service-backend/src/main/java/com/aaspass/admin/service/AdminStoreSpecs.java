package com.aaspass.admin.service;

import com.aaspass.entity.Store;
import com.aaspass.exception.BadRequestException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/** Composable filters for the admin store search. */
public final class AdminStoreSpecs {

    private static final char LIKE_ESCAPE = '\\';

    private AdminStoreSpecs() {
    }

    /**
     * Builds the combined filter. Blank text filters are ignored; matching is case-insensitive.
     *
     * @param status all, active, inactive, blocked or unreviewed; blank means all
     * @throws BadRequestException for an unknown status
     */
    public static Specification<Store> filter(String country, String city, String name, String status) {
        String normalizedStatus = status == null || status.isBlank() ? "all" : status.trim().toLowerCase(Locale.ROOT);
        Specification<Store> statusSpec = switch (normalizedStatus) {
            case "all" -> null;
            case "active" -> (root, q, cb) -> cb.and(cb.isTrue(root.get("isActive")), cb.isFalse(root.get("adminBlocked")));
            case "inactive" -> (root, q, cb) -> cb.and(cb.isFalse(root.get("isActive")), cb.isFalse(root.get("adminBlocked")));
            case "blocked" -> (root, q, cb) -> cb.isTrue(root.get("adminBlocked"));
            case "unreviewed" -> (root, q, cb) -> cb.isNull(root.get("adminReviewedAt"));
            default -> throw new BadRequestException("Unknown status filter: " + status);
        };

        List<Specification<Store>> specs = new ArrayList<>();
        if (statusSpec != null) {
            specs.add(statusSpec);
        }
        specs.addAll(AdminLocationSpecs.<Store>of(country, city));
        if (name != null && !name.isBlank()) {
            String n = "%" + escapeLike(name.trim().toLowerCase(Locale.ROOT)) + "%";
            specs.add((root, q, cb) -> cb.like(cb.lower(root.get("storeName")), n, LIKE_ESCAPE));
        }
        return Specification.allOf(specs);
    }

    private static String escapeLike(String value) {
        String esc = String.valueOf(LIKE_ESCAPE);
        return value.replace(esc, esc + esc).replace("%", esc + "%").replace("_", esc + "_");
    }
}
