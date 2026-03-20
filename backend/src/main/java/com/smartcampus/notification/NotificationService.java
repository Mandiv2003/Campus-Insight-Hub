package com.smartcampus.notification;

import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.notification.dto.NotificationDto;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ── Called by M2 (BookingService) ──────────────────────────────────────────
    // Pass: recipientUserId, bookingTitle, new status name, bookingId
    public void notifyBookingDecision(UUID recipientId, String bookingTitle,
                                      NotificationType type, UUID bookingId) {
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
    public void notifyTicketStatusChange(UUID reportedById, String ticketTitle,
                                         String newStatus, UUID ticketId) {
        String message = "Your ticket \"" + ticketTitle + "\" status changed to " + newStatus;
        save(reportedById, NotificationType.TICKET_STATUS_CHANGED,
            "Ticket Status Updated", message, "TICKET", ticketId);
    }

    public void notifyNewComment(UUID ticketReporterId, UUID commentAuthorId,
                                  String ticketTitle, UUID ticketId) {
        if (ticketReporterId.equals(commentAuthorId)) return; // skip self-notification
        String message = "A new comment was added on your ticket \"" + ticketTitle + "\"";
        save(ticketReporterId, NotificationType.TICKET_COMMENT_ADDED,
            "New Comment", message, "TICKET", ticketId);
    }

    public void notifyTechnicianAssigned(UUID technicianId, String ticketTitle, UUID ticketId) {
        String message = "You have been assigned to ticket \"" + ticketTitle + "\"";
        save(technicianId, NotificationType.TICKET_ASSIGNED,
            "Ticket Assigned", message, "TICKET", ticketId);
    }

    // ── Internal helper ────────────────────────────────────────────────────────
    private void save(UUID recipientId, NotificationType type, String title,
                      String message, String entityType, UUID entityId) {
        User recipient = userRepository.findById(recipientId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Notification n = Notification.builder()
            .recipient(recipient)
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
    public Page<NotificationDto> getForUser(UUID userId, Boolean isRead, Pageable pageable) {
        if (isRead != null) {
            return notificationRepository.findByRecipientIdAndRead(userId, isRead, pageable)
                .map(NotificationDto::from);
        }
        return notificationRepository.findByRecipientId(userId, pageable).map(NotificationDto::from);
    }

    public long countUnread(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationDto markRead(UUID notificationId, UUID userId) {
        Notification n = notificationRepository.findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setRead(true);
        return NotificationDto.from(notificationRepository.save(n));
    }

    @Transactional
    public int markAllRead(UUID userId) {
        return notificationRepository.markAllReadByRecipient(userId);
    }

    @Transactional
    public void delete(UUID notificationId, UUID userId) {
        Notification n = notificationRepository.findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(n);
    }
}
