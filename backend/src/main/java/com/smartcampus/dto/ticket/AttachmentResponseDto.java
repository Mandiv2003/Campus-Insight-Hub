package com.smartcampus.dto.ticket;

import java.time.LocalDateTime;

public record AttachmentResponseDto(
        String id,
        String ticketId,
        String uploadedById,
        String uploadedByName,
        String fileName,
        Long fileSize,
        String contentType,
        String fileUrl,             // served at: /api/v1/files/{ticketId}/{fileName}
        LocalDateTime createdAt
) {}
