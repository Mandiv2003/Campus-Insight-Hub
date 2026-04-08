package com.smartcampus.service;

import com.smartcampus.dto.ticket.*;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.TicketMapper;
import com.smartcampus.model.*;
import com.smartcampus.model.enums.Role;
import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private static final int MAX_ATTACHMENTS = 3;

    private final IncidentTicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final TicketMapper ticketMapper;
    private final MongoTemplate mongoTemplate;

    // ── Create ticket ─────────────────────────────────────────────────────
    public TicketResponseDto create(TicketRequestDto dto, String reportedById) {
        User reporter = findUserOrThrow(reportedById);

        String resourceId = null, resourceName = null;
        if (dto.resourceId() != null) {
            Resource resource = resourceRepository.findById(dto.resourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.resourceId()));
            resourceId   = resource.getId();
            resourceName = resource.getName();
        }

        IncidentTicket ticket = IncidentTicket.builder()
                .reportedById(reporter.getId())
                .reportedByName(reporter.getFullName())
                .resourceId(resourceId)
                .resourceName(resourceName)
                .title(dto.title())
                .description(dto.description())
                .category(dto.category())
                .priority(dto.priority())
                .locationDetail(dto.locationDetail())
                .contactPhone(dto.contactPhone())
                .contactEmail(dto.contactEmail())
                .status(TicketStatus.OPEN)
                .build();

        return toSummary(ticketRepository.save(ticket));
    }

    // ── Get user's own tickets ────────────────────────────────────────────
    public Page<TicketResponseDto> getMyTickets(String userId, TicketStatus status, Pageable pageable) {
        Page<IncidentTicket> page = (status != null)
                ? ticketRepository.findByReportedByIdAndStatusOrderByCreatedAtDesc(userId, status, pageable)
                : ticketRepository.findByReportedByIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(this::toSummary);
    }

    // ── Get single ticket (with attachments + comments) ───────────────────
    public TicketResponseDto getById(String ticketId, String requestingUserId,
                                     boolean isAdmin, boolean isTechnician) {
        IncidentTicket ticket = findOrThrow(ticketId);
        if (!isAdmin && !isTechnician && !ticket.getReportedById().equals(requestingUserId)) {
            throw new ForbiddenException("Access denied");
        }
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        List<TicketComment>    comments    = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return toFull(ticket, attachments, comments);
    }

    // ── Update ticket (OPEN only, owner only) ─────────────────────────────
    public TicketResponseDto update(String ticketId, TicketRequestDto dto, String requestingUserId) {
        IncidentTicket ticket = findOrThrow(ticketId);

        if (!ticket.getReportedById().equals(requestingUserId)) {
            throw new ForbiddenException("You can only edit your own tickets");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new ConflictException("Only OPEN tickets can be edited");
        }

        String resourceId = null, resourceName = null;
        if (dto.resourceId() != null) {
            Resource resource = resourceRepository.findById(dto.resourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.resourceId()));
            resourceId   = resource.getId();
            resourceName = resource.getName();
        }

        ticket.setResourceId(resourceId);
        ticket.setResourceName(resourceName);
        ticket.setTitle(dto.title());
        ticket.setDescription(dto.description());
        ticket.setCategory(dto.category());
        ticket.setPriority(dto.priority());
        ticket.setLocationDetail(dto.locationDetail());
        ticket.setContactPhone(dto.contactPhone());
        ticket.setContactEmail(dto.contactEmail());
        ticket.setUpdatedAt(LocalDateTime.now());

        return toSummary(ticketRepository.save(ticket));
    }

    // ── Delete ticket ─────────────────────────────────────────────────────
    public void delete(String ticketId, String requestingUserId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);

        if (!isAdmin && !ticket.getReportedById().equals(requestingUserId)) {
            throw new ForbiddenException("You can only delete your own tickets");
        }
        if (!isAdmin && ticket.getStatus() != TicketStatus.OPEN) {
            throw new ConflictException("You can only delete OPEN tickets");
        }

        // Clean up attachment files from disk before deleting records
        attachmentRepository.findByTicketId(ticketId)
                .forEach(a -> fileStorageService.delete(a.getFilePath()));

        commentRepository.deleteAll(commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId));
        attachmentRepository.deleteAll(attachmentRepository.findByTicketId(ticketId));
        ticketRepository.delete(ticket);
    }

    // ── Admin/Tech: list all tickets ──────────────────────────────────────
    public Page<TicketResponseDto> listAll(String statusStr, String priorityStr,
                                           String categoryStr, String assignedTo,
                                           Pageable pageable) {
        TicketStatus   status   = (statusStr   != null && !statusStr.isBlank())   ? TicketStatus.valueOf(statusStr.toUpperCase())   : null;
        TicketPriority priority = (priorityStr != null && !priorityStr.isBlank()) ? TicketPriority.valueOf(priorityStr.toUpperCase()) : null;
        TicketCategory category = (categoryStr != null && !categoryStr.isBlank()) ? TicketCategory.valueOf(categoryStr.toUpperCase()) : null;

        List<Criteria> parts = new ArrayList<>();
        if (status != null)     parts.add(Criteria.where("status").is(status.name()));
        if (priority != null)   parts.add(Criteria.where("priority").is(priority.name()));
        if (category != null)   parts.add(Criteria.where("category").is(category.name()));
        if (assignedTo != null) parts.add(Criteria.where("assigned_to_id").is(assignedTo));

        Criteria criteria = parts.isEmpty()
                ? new Criteria()
                : new Criteria().andOperator(parts.toArray(new Criteria[0]));

        Query query = new Query(criteria).with(pageable);
        List<IncidentTicket> tickets = mongoTemplate.find(query, IncidentTicket.class);
        long total = mongoTemplate.count(new Query(criteria), IncidentTicket.class);

        return PageableExecutionUtils.getPage(tickets, pageable, () -> total)
                .map(this::toSummary);
    }

    // ── Admin/Tech: update ticket status ──────────────────────────────────
    public TicketResponseDto updateStatus(String ticketId, TicketStatusUpdateDto dto,
                                          String updatingUserId) {
        IncidentTicket ticket = findOrThrow(ticketId);

        if (dto.status() == TicketStatus.RESOLVED
                && (dto.resolutionNotes() == null || dto.resolutionNotes().isBlank())) {
            throw new IllegalArgumentException("Resolution notes are required when resolving a ticket");
        }
        if (dto.status() == TicketStatus.REJECTED
                && (dto.rejectionReason() == null || dto.rejectionReason().isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when rejecting a ticket");
        }

        ticket.setStatus(dto.status());
        if (dto.resolutionNotes() != null) ticket.setResolutionNotes(dto.resolutionNotes());
        if (dto.rejectionReason() != null) ticket.setRejectionReason(dto.rejectionReason());
        if (dto.status() == TicketStatus.RESOLVED) ticket.setResolvedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        IncidentTicket saved = ticketRepository.save(ticket);

        if (!ticket.getReportedById().equals(updatingUserId)) {
            notificationService.notifyTicketStatusChange(
                    ticket.getReportedById(), ticket.getTitle(),
                    dto.status().name(), ticket.getId());
        }

        return toSummary(saved);
    }

    // ── Admin: assign technician ──────────────────────────────────────────
    public TicketResponseDto assignTechnician(String ticketId, AssignTechnicianDto dto) {
        IncidentTicket ticket = findOrThrow(ticketId);

        User technician = userRepository.findById(dto.technicianId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.technicianId()));
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new ConflictException("Assigned user must have the TECHNICIAN role");
        }

        ticket.setAssignedToId(technician.getId());
        ticket.setAssignedToName(technician.getFullName());
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        IncidentTicket saved = ticketRepository.save(ticket);

        notificationService.notifyTechnicianAssigned(
                technician.getId(), ticket.getTitle(), ticket.getId());

        return toSummary(saved);
    }

    // ── Upload attachment ─────────────────────────────────────────────────
    public AttachmentResponseDto addAttachment(String ticketId, MultipartFile file,
                                               String uploaderId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);

        if (!isAdmin && !ticket.getReportedById().equals(uploaderId)) {
            throw new ForbiddenException("You can only add attachments to your own tickets");
        }
        if (attachmentRepository.countByTicketId(ticketId) >= MAX_ATTACHMENTS) {
            throw new ConflictException("Maximum of " + MAX_ATTACHMENTS + " attachments allowed per ticket");
        }

        String storedPath = fileStorageService.store(file, ticketId);
        String storedFileName = fileStorageService.extractFileName(storedPath);
        User uploader = findUserOrThrow(uploaderId);

        TicketAttachment attachment = TicketAttachment.builder()
                .ticketId(ticketId)
                .uploadedById(uploader.getId())
                .uploadedByName(uploader.getFullName())
                .fileName(storedFileName)
                .filePath(storedPath)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();

        return ticketMapper.toAttachmentDto(attachmentRepository.save(attachment));
    }

    // ── Delete attachment ─────────────────────────────────────────────────
    public void deleteAttachment(String ticketId, String attachmentId,
                                  String requestingUserId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);
        TicketAttachment attachment = attachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));

        if (!isAdmin && !ticket.getReportedById().equals(requestingUserId)) {
            throw new ForbiddenException("You can only delete attachments from your own tickets");
        }

        fileStorageService.delete(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

    // ── Package-visible for TicketCommentService ──────────────────────────
    public IncidentTicket findOrThrow(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    // ── Private assembly helpers ──────────────────────────────────────────

    /** Full DTO with attachments + comments loaded (used for single-ticket GET). */
    private TicketResponseDto toFull(IncidentTicket t,
                                     List<TicketAttachment> attachments,
                                     List<TicketComment> comments) {
        return new TicketResponseDto(
                t.getId(), t.getResourceId(), t.getResourceName(),
                t.getReportedById(), t.getReportedByName(),
                t.getAssignedToId(), t.getAssignedToName(),
                t.getTitle(), t.getDescription(),
                t.getCategory(), t.getPriority(),
                t.getLocationDetail(), t.getContactPhone(), t.getContactEmail(),
                t.getStatus(), t.getResolutionNotes(), t.getRejectionReason(), t.getResolvedAt(),
                ticketMapper.toAttachmentDtoList(attachments),
                ticketMapper.toCommentDtoList(comments),
                t.getCreatedAt(), t.getUpdatedAt()
        );
    }

    /** Lightweight DTO for list views — no attachments or comments loaded. */
    private TicketResponseDto toSummary(IncidentTicket t) {
        return new TicketResponseDto(
                t.getId(), t.getResourceId(), t.getResourceName(),
                t.getReportedById(), t.getReportedByName(),
                t.getAssignedToId(), t.getAssignedToName(),
                t.getTitle(), t.getDescription(),
                t.getCategory(), t.getPriority(),
                t.getLocationDetail(), t.getContactPhone(), t.getContactEmail(),
                t.getStatus(), t.getResolutionNotes(), t.getRejectionReason(), t.getResolvedAt(),
                List.of(), List.of(),
                t.getCreatedAt(), t.getUpdatedAt()
        );
    }

    private User findUserOrThrow(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
