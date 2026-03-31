package com.smartcampus.incident.dto;

import com.smartcampus.incident.TicketComment;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponseDto(
    UUID id,
    UUID ticketId,
    UUID authorId,
    String authorName,
    String authorAvatarUrl,
    String body,
    boolean edited,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static CommentResponseDto from(TicketComment c) {
        return new CommentResponseDto(
            c.getId(),
            c.getTicket().getId(),
            c.getAuthor().getId(),
            c.getAuthor().getFullName(),
            c.getAuthor().getAvatarUrl(),
            c.getBody(),
            c.isEdited(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }
}
