package com.aaspass.admin.service;

import com.aaspass.admin.dto.ActivityPeriod;
import com.aaspass.admin.dto.AdminChartsResponse;
import com.aaspass.admin.dto.CityCount;
import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import com.aaspass.entity.VerificationStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds the admin Charts screen: sign-ups, new stores and admin verification decisions bucketed
 * by day (last 30 days), week (last 12 weeks, Monday start) or month (last 12 months), optionally
 * narrowed to a country/city. Buckets use the server zone, matching how {@code creationDateTime}
 * is stored (see BaseAuditEntity).
 */
@Service
public class AdminChartService {

    static final int DAILY_BUCKETS = 30;
    static final int WEEKLY_BUCKETS = 12;
    static final int MONTHLY_BUCKETS = 12;
    static final int TOP_CITIES = 8;

    private static final List<String> USER_CHECKS = List.of("phoneVerification", "panVerification", "aadharVerification");

    private final EntityManager entityManager;
    private final Clock clock;

    public AdminChartService(EntityManager entityManager, Clock clock) {
        this.entityManager = entityManager;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AdminChartsResponse charts(ActivityPeriod period, String country, String city) {
        ActivityPeriod resolved = period == null ? ActivityPeriod.DAILY : period;
        ZoneId zone = ZoneId.systemDefault();
        List<LocalDate> buckets = buckets(resolved, LocalDate.ofInstant(clock.instant(), zone));
        LocalDateTime sinceLocal = buckets.get(0).atStartOfDay();
        Instant sinceInstant = sinceLocal.atZone(zone).toInstant();

        Specification<User> userLocation = Specification.allOf(AdminLocationSpecs.<User>of(country, city));
        Specification<Store> storeLocation = Specification.allOf(AdminLocationSpecs.<Store>of(country, city));

        long[] newUsers = new long[buckets.size()];
        for (LocalDateTime at : since(User.class, userLocation, "creationDateTime", LocalDateTime.class, sinceLocal)) {
            increment(newUsers, buckets, resolved, at.toLocalDate());
        }
        long[] newStores = new long[buckets.size()];
        for (LocalDateTime at : since(Store.class, storeLocation, "creationDateTime", LocalDateTime.class, sinceLocal)) {
            increment(newStores, buckets, resolved, at.toLocalDate());
        }

        long[] verified = new long[buckets.size()];
        long[] rejected = new long[buckets.size()];
        for (String check : USER_CHECKS) {
            for (Tuple row : decisions(userLocation, check, sinceInstant)) {
                VerificationStatus status = row.get(0, VerificationStatus.class);
                Instant at = row.get(1, Instant.class);
                if (at == null) {
                    continue;
                }
                LocalDate day = LocalDate.ofInstant(at, zone);
                if (status == VerificationStatus.VERIFIED) {
                    increment(verified, buckets, resolved, day);
                } else if (status == VerificationStatus.REJECTED) {
                    increment(rejected, buckets, resolved, day);
                }
            }
        }

        long[] reviewed = new long[buckets.size()];
        for (Instant at : since(Store.class, storeLocation, "adminReviewedAt", Instant.class, sinceInstant)) {
            increment(reviewed, buckets, resolved, LocalDate.ofInstant(at, zone));
        }

        return new AdminChartsResponse(
                resolved,
                buckets,
                boxed(newUsers),
                boxed(newStores),
                boxed(verified),
                boxed(rejected),
                boxed(reviewed),
                topCities(User.class, userLocation, sinceLocal),
                topCities(Store.class, storeLocation, sinceLocal));
    }

    /** Bucket start dates, oldest first, ending with the bucket that contains {@code today}. */
    static List<LocalDate> buckets(ActivityPeriod period, LocalDate today) {
        List<LocalDate> out = new ArrayList<>();
        switch (period) {
            case WEEKLY -> {
                LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                for (int i = WEEKLY_BUCKETS - 1; i >= 0; i--) {
                    out.add(monday.minusWeeks(i));
                }
            }
            case MONTHLY -> {
                LocalDate firstOfMonth = today.withDayOfMonth(1);
                for (int i = MONTHLY_BUCKETS - 1; i >= 0; i--) {
                    out.add(firstOfMonth.minusMonths(i));
                }
            }
            default -> {
                for (int i = DAILY_BUCKETS - 1; i >= 0; i--) {
                    out.add(today.minusDays(i));
                }
            }
        }
        return out;
    }

    /** Index of the bucket holding {@code day}, or -1 when it falls outside the charted range. */
    static int bucketIndex(List<LocalDate> buckets, ActivityPeriod period, LocalDate day) {
        if (buckets.isEmpty() || day == null || day.isBefore(buckets.get(0))) {
            return -1;
        }
        LocalDate first = buckets.get(0);
        long index = switch (period) {
            case WEEKLY -> ChronoUnit.WEEKS.between(first, day);
            case MONTHLY -> ChronoUnit.MONTHS.between(first, day.withDayOfMonth(1));
            default -> ChronoUnit.DAYS.between(first, day);
        };
        return index < buckets.size() ? (int) index : -1;
    }

    private static void increment(long[] series, List<LocalDate> buckets, ActivityPeriod period, LocalDate day) {
        int i = bucketIndex(buckets, period, day);
        if (i >= 0) {
            series[i]++;
        }
    }

    private static List<Long> boxed(long[] values) {
        return Arrays.stream(values).boxed().toList();
    }

    /** One timestamp attribute of every row matching {@code filter} with that attribute on or after {@code from}. */
    private <T, V extends Comparable<? super V>> List<V> since(Class<T> type, Specification<T> filter, String attr,
                                                              Class<V> valueType, V from) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<V> query = cb.createQuery(valueType);
        Root<T> root = query.from(type);
        Path<V> path = root.get(attr);
        query.select(path).where(and(cb, cb.greaterThanOrEqualTo(path, from), filter.toPredicate(root, query, cb)));
        return entityManager.createQuery(query).getResultList();
    }

    /** (status, decidedAt) of one user verification item decided on or after {@code from}. */
    private List<Tuple> decisions(Specification<User> filter, String check, Instant from) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Tuple> query = cb.createTupleQuery();
        Root<User> root = query.from(User.class);
        Path<Object> embedded = root.get(check);
        Path<VerificationStatus> status = embedded.get("status");
        Path<Instant> decidedAt = embedded.get("decidedAt");
        query.multiselect(status, decidedAt)
                .where(and(cb, cb.greaterThanOrEqualTo(decidedAt, from), filter.toPredicate(root, query, cb)));
        return entityManager.createQuery(query).getResultList();
    }

    /** The cities with the most rows created on or after {@code from}, busiest first. */
    private <T> List<CityCount> topCities(Class<T> type, Specification<T> filter, LocalDateTime from) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Tuple> query = cb.createTupleQuery();
        Root<T> root = query.from(type);
        Path<String> city = root.get("city");
        Path<String> country = root.get("country");
        Expression<Long> count = cb.count(root);
        Predicate created = cb.and(
                cb.greaterThanOrEqualTo(root.<LocalDateTime>get("creationDateTime"), from),
                cb.isNotNull(city),
                cb.notEqual(cb.trim(city), ""));
        query.multiselect(city, country, count)
                .where(and(cb, created, filter.toPredicate(root, query, cb)))
                .groupBy(city, country)
                .orderBy(cb.desc(count), cb.asc(city));
        return entityManager.createQuery(query).setMaxResults(TOP_CITIES).getResultList().stream()
                .map(r -> new CityCount(r.get(0, String.class), r.get(1, String.class), r.get(2, Long.class)))
                .toList();
    }

    private static Predicate and(CriteriaBuilder cb, Predicate required, Predicate optional) {
        return optional == null ? required : cb.and(required, optional);
    }
}
