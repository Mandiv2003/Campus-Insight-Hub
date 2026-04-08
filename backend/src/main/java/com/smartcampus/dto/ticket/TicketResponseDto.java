package com.smartcampus.dto.ticket;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;

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
) {}
