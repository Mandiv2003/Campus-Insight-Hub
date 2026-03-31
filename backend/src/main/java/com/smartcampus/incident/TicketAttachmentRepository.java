package com.smartcampus.incident;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, UUID> {

    List<TicketAttachment> findByTicketId(UUID ticketId);

    long countByTicketId(UUID ticketId);

    Optional<TicketAttachment> findByIdAndTicketId(UUID id, UUID ticketId);
}
