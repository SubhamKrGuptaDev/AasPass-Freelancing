package com.aaspass.admin.service;

import com.aaspass.entity.User;
import com.aaspass.entity.VerificationStatus;
import com.aaspass.exception.BadRequestException;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/**
 * Composable filters for the admin user search. PAN and Aadhaar are stored encrypted, so they are
 * never matched by text and are only tested for presence.
 */
public final class AdminUserSpecs {

    private static final char LIKE_ESCAPE = '\\';

    private AdminUserSpecs() {
    }

    /**
     * Builds the combined filter.
     *
     * @param q            contains-match (case-insensitive) on name, username, email or phone; blank = any
     * @param verification all, pending, verified or rejected; blank means all
     * @param suspended    true = currently suspended, false = not suspended, null = any
     * @param now          the reference instant for the suspension test
     * @throws BadRequestException for an unknown verification filter
     */
    public static Specification<User> filter(String q, String verification, Boolean suspended, Instant now) {
        String normalized = verification == null || verification.isBlank()
                ? "all" : verification.trim().toLowerCase(Locale.ROOT);
        Specification<User> verificationSpec = switch (normalized) {
            case "all" -> null;
            case "pending" -> (root, query, cb) -> cb.or(
                    pendingItem(cb, root, "phone", "phoneVerification", true),
                    pendingItem(cb, root, "panNumber", "panVerification", false),
                    pendingItem(cb, root, "aadharNumber", "aadharVerification", false));
            case "verified" -> (root, query, cb) -> cb.and(
                    cb.equal(status(root, "phoneVerification"), VerificationStatus.VERIFIED),
                    cb.equal(status(root, "panVerification"), VerificationStatus.VERIFIED),
                    cb.equal(status(root, "aadharVerification"), VerificationStatus.VERIFIED));
            case "rejected" -> (root, query, cb) -> cb.or(
                    cb.equal(status(root, "phoneVerification"), VerificationStatus.REJECTED),
                    cb.equal(status(root, "panVerification"), VerificationStatus.REJECTED),
                    cb.equal(status(root, "aadharVerification"), VerificationStatus.REJECTED));
            default -> throw new BadRequestException("Unknown verification filter: " + verification);
        };

        List<Specification<User>> specs = new ArrayList<>();
        if (verificationSpec != null) {
            specs.add(verificationSpec);
        }
        if (q != null && !q.isBlank()) {
            String pattern = "%" + escapeLike(q.trim().toLowerCase(Locale.ROOT)) + "%";
            specs.add((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern, LIKE_ESCAPE),
                    cb.like(cb.lower(root.get("username")), pattern, LIKE_ESCAPE),
                    cb.like(cb.lower(root.get("email")), pattern, LIKE_ESCAPE),
                    cb.like(cb.lower(root.get("phone")), pattern, LIKE_ESCAPE)));
        }
        if (suspended != null && now != null) {
            if (suspended) {
                specs.add((root, query, cb) -> cb.greaterThan(root.<Instant>get("suspendedUntil"), now));
            } else {
                specs.add((root, query, cb) -> cb.or(
                        cb.isNull(root.get("suspendedUntil")),
                        cb.lessThanOrEqualTo(root.<Instant>get("suspendedUntil"), now)));
            }
        }
        return Specification.allOf(specs);
    }

    private static Path<VerificationStatus> status(Root<User> root, String embedded) {
        return root.get(embedded).get("status");
    }

    /** A value is present and still awaiting a decision. */
    private static Predicate pendingItem(CriteriaBuilder cb, Root<User> root, String valueAttr, String embedded,
                                         boolean plainText) {
        Predicate present = cb.isNotNull(root.get(valueAttr));
        if (plainText) {
            present = cb.and(present, cb.notEqual(cb.trim(root.<String>get(valueAttr)), ""));
        }
        return cb.and(present, cb.equal(status(root, embedded), VerificationStatus.UNVERIFIED));
    }

    private static String escapeLike(String value) {
        String esc = String.valueOf(LIKE_ESCAPE);
        return value.replace(esc, esc + esc).replace("%", esc + "%").replace("_", esc + "_");
    }
}
