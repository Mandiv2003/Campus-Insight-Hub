package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    Page<Notification> findByRecipientId(String recipientId, Pageable pageable);

    Page<Notification> findByRecipientIdAndRead(String recipientId, boolean read, Pageable pageable);

    long countByRecipientIdAndReadFalse(String recipientId);

    Optional<Notification> findByIdAndRecipientId(String id, String recipientId);

    // markAllRead uses MongoTemplate in NotificationService
}
