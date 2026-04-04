package com.smartcampus.incident;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {

    Page<IncidentTicket> findByReportedByIdOrderByCreatedAtDesc(String reportedById, Pageable pageable);

    Page<IncidentTicket> findByReportedByIdAndStatusOrderByCreatedAtDesc(
            String reportedById, TicketStatus status, Pageable pageable);

    // Admin filtering is done via MongoTemplate in IncidentTicketService
}
