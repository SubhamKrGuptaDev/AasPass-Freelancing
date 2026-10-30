package com.aaspass.admin.service;

import com.aaspass.entity.ContactRequest;
import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.entity.ContactRequestType;
import com.aaspass.exception.BadRequestException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/** Composable filters for the admin contact inbox. */
public final class AdminContactRequestSpecs {

    private static final char LIKE_ESCAPE = '\\';

    private AdminContactRequestSpecs() {
    }

    /**
     * Builds the combined filter.
     *
     * @param q      contains-match (case-insensitive) on name, email, phone or subject; blank = any
     * @param status all, NEW, IN_PROGRESS or RESOLVED; blank means all
     * @param type   all, QUERY, FEEDBACK or COMPLAINT; blank means all
     * @throws BadRequestException for an unknown status or type
     */
    public static Specification<ContactRequest> filter(String q, String status, String type) {
        List<Specification<ContactRequest>> specs = new ArrayList<>();
        if (!isAll(status)) {
            ContactRequestStatus parsed = parse(ContactRequestStatus.class, status, "status");
            specs.add((root, query, cb) -> cb.equal(root.get("status"), parsed));
        }
        if (!isAll(type)) {
            ContactRequestType parsed = parse(ContactRequestType.class, type, "type");
            specs.add((root, query, cb) -> cb.equal(root.get("type"), parsed));
        }
        if (q != null && !q.isBlank()) {
            String pattern = "%" + escapeLike(q.trim().toLowerCase(Locale.ROOT)) + "%";
            specs.add((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern, LIKE_ESCAPE),
                    cb.like(cb.lower(root.get("email")), pattern, LIKE_ESCAPE),
                    cb.like(cb.lower(root.get("phone")), pattern, LIKE_ESCAPE),
                    cb.like(cb.lower(root.get("subject")), pattern, LIKE_ESCAPE)));
        }
        return Specification.allOf(specs);
    }

    private static boolean isAll(String value) {
        return value == null || value.isBlank() || "all".equalsIgnoreCase(value.trim());
    }

    private static <E extends Enum<E>> E parse(Class<E> enumType, String value, String label) {
        try {
            return Enum.valueOf(enumType, value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unknown " + label + " filter: " + value);
        }
    }

    private static String escapeLike(String value) {
        String esc = String.valueOf(LIKE_ESCAPE);
        return value.replace(esc, esc + esc).replace("%", esc + "%").replace("_", esc + "_");
    }
}
