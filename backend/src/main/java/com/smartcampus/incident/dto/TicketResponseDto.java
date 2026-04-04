package com.smartcampus.incident.dto;

import com.smartcampus.incident.IncidentTicket;
import com.smartcampus.incident.TicketAttachment;
import com.smartcampus.incident.TicketCategory;
import com.smartcampus.incident.TicketComment;
import com.smartcampus.incident.TicketPriority;
import com.smartcampus.incident.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TicketResponseDto(
    String id,
    String resourceId,
    String resourceName,
    String reportedById,
    String reportedByName,
    String assignedToId,
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
    public static TicketResponseDto from(IncidentTicket t,
                                         List<TicketAttachment> attachments,
                                         List<TicketComment> comments) {
        return new TicketResponseDto(
            t.getId(),
            t.getResourceId(),
            t.getResourceName(),
            t.getReportedById(),
            t.getReportedByName(),
            t.getAssignedToId(),
            t.getAssignedToName(),
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
            attachments.stream().map(AttachmentResponseDto::from).toList(),
            comments.stream().map(CommentResponseDto::from).toList(),
            t.getCreatedAt(),
            t.getUpdatedAt()
        );
    }

    // Lightweight version for list views — no attachments/comments loaded
    public static TicketResponseDto summary(IncidentTicket t) {
        return new TicketResponseDto(
            t.getId(),
            t.getResourceId(),
            t.getResourceName(),
            t.getReportedById(),
            t.getReportedByName(),
            t.getAssignedToId(),
            t.getAssignedToName(),
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
