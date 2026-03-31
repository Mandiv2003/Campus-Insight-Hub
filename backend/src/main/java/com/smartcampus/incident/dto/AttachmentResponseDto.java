package com.smartcampus.incident.dto;

import com.smartcampus.incident.TicketAttachment;

import java.time.LocalDateTime;
import java.util.UUID;

public record AttachmentResponseDto(
    UUID id,
    UUID ticketId,
    UUID uploadedById,
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
            a.getTicket().getId(),
            a.getUploadedBy().getId(),
            a.getUploadedBy().getFullName(),
            a.getFileName(),
            a.getFileSize(),
            a.getContentType(),
            "/api/v1/files/" + a.getTicket().getId() + "/" + a.getFileName(),
            a.getCreatedAt()
        );
    }
}
