package com.smartcampus.incident.dto;

import com.smartcampus.incident.TicketAttachment;

import java.time.LocalDateTime;

public record AttachmentResponseDto(
    String id,
    String ticketId,
    String uploadedById,
    String uploadedByName,
    String fileName,
    Long fileSize,
    String contentType,
    String fileUrl,             // served path: /api/v1/files/{ticketId}/{fileName}
    LocalDateTime createdAt
) {
    public static AttachmentResponseDto from(TicketAttachment a) {
        return new AttachmentResponseDto(
            a.getId(),
            a.getTicketId(),
            a.getUploadedById(),
            a.getUploadedByName(),
            a.getFileName(),
            a.getFileSize(),
            a.getContentType(),
            "/api/v1/files/" + a.getTicketId() + "/" + a.getFileName(),
            a.getCreatedAt()
        );
    }
}
