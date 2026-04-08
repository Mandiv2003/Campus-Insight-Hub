package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {

    List<TicketAttachment> findByTicketId(String ticketId);

    long countByTicketId(String ticketId);

    Optional<TicketAttachment> findByIdAndTicketId(String id, String ticketId);
}
