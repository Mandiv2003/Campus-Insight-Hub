package com.smartcampus.dto.ticket;

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
) {}
