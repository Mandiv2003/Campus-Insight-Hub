package com.smartcampus.booking;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookingSpecification {

    public static Specification<Booking> withFilters(
            UUID resourceId,
            BookingStatus status,
            LocalDateTime from,
            LocalDateTime to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (resourceId != null)
                predicates.add(cb.equal(root.get("resource").get("id"), resourceId));

            if (status != null)
                predicates.add(cb.equal(root.get("status"), status));

            if (from != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDatetime"), from));

            if (to != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("endDatetime"), to));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
