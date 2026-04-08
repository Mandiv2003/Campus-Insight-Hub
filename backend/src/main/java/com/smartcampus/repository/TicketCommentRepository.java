package com.smartcampus.repository;

import com.smartcampus.model.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    Optional<TicketComment> findByIdAndTicketId(String id, String ticketId);
}
