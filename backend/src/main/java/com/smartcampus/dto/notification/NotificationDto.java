package com.smartcampus.dto.notification;

import com.smartcampus.model.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationDto(
        String id,
        NotificationType type,
        String title,
        String message,
        String entityType,
        String entityId,
        boolean read,
        LocalDateTime createdAt
) {}
