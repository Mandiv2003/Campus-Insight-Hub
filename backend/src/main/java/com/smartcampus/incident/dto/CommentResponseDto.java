package com.smartcampus.incident.dto;

import com.smartcampus.incident.TicketComment;

import java.time.LocalDateTime;

public record CommentResponseDto(
    String id,
    String ticketId,
    String authorId,
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
            c.getTicketId(),
            c.getAuthorId(),
            c.getAuthorName(),
            c.getAuthorAvatarUrl(),
            c.getBody(),
            c.isEdited(),
            c.getCreatedAt(),
            c.getUpdatedAt()
        );
    }
}
