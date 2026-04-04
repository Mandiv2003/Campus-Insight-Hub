package com.smartcampus.notification;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Field("recipient_id")
    @Indexed
    private String recipientId;

    private NotificationType type;

    private String title;

    private String message;

    @Field("entity_type")
    private String entityType;

    @Field("entity_id")
    private String entityId;

    @Field("is_read")
    @Builder.Default
    private boolean read = false;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
