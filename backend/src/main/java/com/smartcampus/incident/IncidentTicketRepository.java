package com.smartcampus.incident;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, UUID>,
        JpaSpecificationExecutor<IncidentTicket> {

    // User's own tickets — ordered newest first
    Page<IncidentTicket> findByReportedByIdOrderByCreatedAtDesc(UUID reportedById, Pageable pageable);

    // User's own tickets filtered by status
    Page<IncidentTicket> findByReportedByIdAndStatusOrderByCreatedAtDesc(
            UUID reportedById, TicketStatus status, Pageable pageable);
}
