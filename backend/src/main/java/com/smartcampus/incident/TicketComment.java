package com.smartcampus.incident;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "ticket_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketComment {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Field("ticket_id")
    @Indexed
    private String ticketId;

    @Field("author_id")
    private String authorId;

    @Field("author_name")
    private String authorName;

    @Field("author_avatar_url")
    private String authorAvatarUrl;

    private String body;

    @Field("is_edited")
    @Builder.Default
    private boolean edited = false;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
