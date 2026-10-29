package com.aaspass.admin.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/** Case-insensitive country/city filters shared by every entity that carries both columns. */
final class AdminLocationSpecs {

    private AdminLocationSpecs() {
    }

    /** Exact (case-insensitive) country and city matches; blank values are ignored. */
    static <T> List<Specification<T>> of(String country, String city) {
        List<Specification<T>> specs = new ArrayList<>();
        if (country != null && !country.isBlank()) {
            String c = country.trim().toLowerCase(Locale.ROOT);
            specs.add((root, q, cb) -> cb.equal(cb.lower(root.get("country")), c));
        }
        if (city != null && !city.isBlank()) {
            String c = city.trim().toLowerCase(Locale.ROOT);
            specs.add((root, q, cb) -> cb.equal(cb.lower(root.get("city")), c));
        }
        return specs;
    }
}
