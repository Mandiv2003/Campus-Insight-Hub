package com.smartcampus.notification;

import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.notification.dto.NotificationDto;
import com.smartcampus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    // ── Called by M2 (BookingService) ──────────────────────────────────────────
    public void notifyBookingDecision(String recipientId, String bookingTitle,
                                      NotificationType type, String bookingId) {
        String title = switch (type) {
            case BOOKING_APPROVED  -> "Booking Approved";
            case BOOKING_REJECTED  -> "Booking Rejected";
            case BOOKING_CANCELLED -> "Booking Cancelled";
            default -> "Booking Update";
        };
        String message = "Your booking \"" + bookingTitle + "\" has been "
            + type.name().toLowerCase().replace("booking_", "");
        save(recipientId, type, title, message, "BOOKING", bookingId);
    }

    // ── Called by M3 (IncidentTicketService) ───────────────────────────────────
    public void notifyTicketStatusChange(String reportedById, String ticketTitle,
                                         String newStatus, String ticketId) {
        String message = "Your ticket \"" + ticketTitle + "\" status changed to " + newStatus;
        save(reportedById, NotificationType.TICKET_STATUS_CHANGED,
            "Ticket Status Updated", message, "TICKET", ticketId);
    }

    public void notifyNewComment(String ticketReporterId, String commentAuthorId,
                                  String ticketTitle, String ticketId) {
        if (ticketReporterId.equals(commentAuthorId)) return;
        String message = "A new comment was added on your ticket \"" + ticketTitle + "\"";
        save(ticketReporterId, NotificationType.TICKET_COMMENT_ADDED,
            "New Comment", message, "TICKET", ticketId);
    }

    public void notifyTechnicianAssigned(String technicianId, String ticketTitle, String ticketId) {
        String message = "You have been assigned to ticket \"" + ticketTitle + "\"";
        save(technicianId, NotificationType.TICKET_ASSIGNED,
            "Ticket Assigned", message, "TICKET", ticketId);
    }

    // ── Internal helper ────────────────────────────────────────────────────────
    private void save(String recipientId, NotificationType type, String title,
                      String message, String entityType, String entityId) {
        userRepository.findById(recipientId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Notification n = Notification.builder()
            .recipientId(recipientId)
            .type(type)
            .title(title)
            .message(message)
            .entityType(entityType)
            .entityId(entityId)
            .read(false)
            .build();
        notificationRepository.save(n);
    }

    // ── Querying ───────────────────────────────────────────────────────────────
    public Page<NotificationDto> getForUser(String userId, Boolean isRead, Pageable pageable) {
        if (isRead != null) {
            return notificationRepository.findByRecipientIdAndRead(userId, isRead, pageable)
                .map(NotificationDto::from);
        }
        return notificationRepository.findByRecipientId(userId, pageable).map(NotificationDto::from);
    }

    public long countUnread(String userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    public NotificationDto markRead(String notificationId, String userId) {
        Notification n = notificationRepository.findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setRead(true);
        return NotificationDto.from(notificationRepository.save(n));
    }

    public int markAllRead(String userId) {
        Query query = new Query(
            Criteria.where("recipient_id").is(userId).and("is_read").is(false)
        );
        Update update = new Update().set("is_read", true);
        long modified = mongoTemplate.updateMulti(query, update, Notification.class).getModifiedCount();
        return (int) modified;
    }

    public void delete(String notificationId, String userId) {
        Notification n = notificationRepository.findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(n);
    }
}
