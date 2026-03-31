package com.smartcampus.incident.dto;

import com.smartcampus.incident.IncidentTicket;
import com.smartcampus.incident.TicketCategory;
import com.smartcampus.incident.TicketPriority;
import com.smartcampus.incident.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TicketResponseDto(
    UUID id,
    UUID resourceId,
    String resourceName,
    UUID reportedById,
    String reportedByName,
    UUID assignedToId,
    String assignedToName,
    String title,
    String description,
    TicketCategory category,
    TicketPriority priority,
    String locationDetail,
    String contactPhone,
    String contactEmail,
    TicketStatus status,
    String resolutionNotes,
    String rejectionReason,
    LocalDateTime resolvedAt,
    List<AttachmentResponseDto> attachments,
    List<CommentResponseDto> comments,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TicketResponseDto from(IncidentTicket t) {
        return new TicketResponseDto(
            t.getId(),
            t.getResource() != null ? t.getResource().getId() : null,
            t.getResource() != null ? t.getResource().getName() : null,
            t.getReportedBy().getId(),
            t.getReportedBy().getFullName(),
            t.getAssignedTo() != null ? t.getAssignedTo().getId() : null,
            t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null,
            t.getTitle(),
            t.getDescription(),
            t.getCategory(),
            t.getPriority(),
            t.getLocationDetail(),
            t.getContactPhone(),
            t.getContactEmail(),
            t.getStatus(),
            t.getResolutionNotes(),
            t.getRejectionReason(),
            t.getResolvedAt(),
            t.getAttachments().stream().map(AttachmentResponseDto::from).toList(),
            t.getComments().stream().map(CommentResponseDto::from).toList(),
            t.getCreatedAt(),
            t.getUpdatedAt()
        );
    }

    // Lightweight version for list views — no attachments/comments
    public static TicketResponseDto summary(IncidentTicket t) {
        return new TicketResponseDto(
            t.getId(),
            t.getResource() != null ? t.getResource().getId() : null,
            t.getResource() != null ? t.getResource().getName() : null,
            t.getReportedBy().getId(),
            t.getReportedBy().getFullName(),
            t.getAssignedTo() != null ? t.getAssignedTo().getId() : null,
            t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null,
            t.getTitle(),
            t.getDescription(),
            t.getCategory(),
            t.getPriority(),
            t.getLocationDetail(),
            t.getContactPhone(),
            t.getContactEmail(),
            t.getStatus(),
            t.getResolutionNotes(),
            t.getRejectionReason(),
            t.getResolvedAt(),
            List.of(),
            List.of(),
            t.getCreatedAt(),
            t.getUpdatedAt()
        );
    }
}
