package com.smartcampus.resource;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ResourceSpecification {

    public static Specification<Resource> withFilters(
            ResourceType type,
            String location,
            Integer minCapacity,
            ResourceStatus status) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always exclude archived resources from listings
            predicates.add(cb.notEqual(root.get("status"), ResourceStatus.ARCHIVED));

            if (type != null)
                predicates.add(cb.equal(root.get("type"), type));

            if (location != null && !location.isBlank())
                predicates.add(cb.like(
                    cb.lower(root.get("location")),
                    "%" + location.toLowerCase() + "%"
                ));

            if (minCapacity != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));

            if (status != null)
                predicates.add(cb.equal(root.get("status"), status));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
