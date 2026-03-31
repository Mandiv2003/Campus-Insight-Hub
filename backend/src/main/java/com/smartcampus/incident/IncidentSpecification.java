package com.smartcampus.incident;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class IncidentSpecification {

    public static Specification<IncidentTicket> withFilters(
            TicketStatus status,
            TicketPriority priority,
            TicketCategory category,
            UUID assignedTo) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null)
                predicates.add(cb.equal(root.get("status"), status));

            if (priority != null)
                predicates.add(cb.equal(root.get("priority"), priority));

            if (category != null)
                predicates.add(cb.equal(root.get("category"), category));

            if (assignedTo != null)
                predicates.add(cb.equal(root.get("assignedTo").get("id"), assignedTo));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
