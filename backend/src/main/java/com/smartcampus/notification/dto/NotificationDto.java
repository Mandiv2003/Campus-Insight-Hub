package com.smartcampus.notification.dto;

import com.smartcampus.notification.Notification;
import com.smartcampus.notification.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    NotificationType type,
    String title,
    String message,
    String entityType,
    UUID entityId,
    boolean read,
    LocalDateTime createdAt
) {
    public static NotificationDto from(Notification n) {
        return new NotificationDto(
            n.getId(), n.getType(), n.getTitle(), n.getMessage(),
            n.getEntityType(), n.getEntityId(), n.isRead(), n.getCreatedAt()
        );
    }
}
