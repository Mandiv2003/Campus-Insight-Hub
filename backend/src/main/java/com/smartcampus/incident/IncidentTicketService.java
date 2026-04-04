package com.smartcampus.incident;

import com.smartcampus.common.exception.ConflictException;
import com.smartcampus.common.exception.ForbiddenException;
import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.incident.dto.*;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.resource.Resource;
import com.smartcampus.resource.ResourceRepository;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
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
    private final MongoTemplate mongoTemplate;

    // ── Create ticket ─────────────────────────────────────────────────────
    public TicketResponseDto create(TicketRequestDto dto, String reportedById) {
        User reporter = findUserOrThrow(reportedById);

        String resourceId = null;
        String resourceName = null;
        if (dto.resourceId() != null) {
            Resource resource = resourceRepository.findById(dto.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.resourceId()));
            resourceId = resource.getId();
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

        IncidentTicket saved = ticketRepository.save(ticket);
        return TicketResponseDto.summary(saved);
    }

    // ── Get user's own tickets ────────────────────────────────────────────
    public Page<TicketResponseDto> getMyTickets(String userId, TicketStatus status, Pageable pageable) {
        Page<IncidentTicket> page = (status != null)
            ? ticketRepository.findByReportedByIdAndStatusOrderByCreatedAtDesc(userId, status, pageable)
            : ticketRepository.findByReportedByIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(TicketResponseDto::summary);
    }

    // ── Get single ticket (with attachments + comments) ───────────────────
    public TicketResponseDto getById(String ticketId, String requestingUserId,
                                     boolean isAdmin, boolean isTechnician) {
        IncidentTicket ticket = findOrThrow(ticketId);
        if (!isAdmin && !isTechnician && !ticket.getReportedById().equals(requestingUserId)) {
            throw new ForbiddenException("Access denied");
        }
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return TicketResponseDto.from(ticket, attachments, comments);
    }

    // ── Update ticket (OPEN only, owner) ─────────────────────────────────
    public TicketResponseDto update(String ticketId, TicketRequestDto dto, String requestingUserId) {
        IncidentTicket ticket = findOrThrow(ticketId);

        if (!ticket.getReportedById().equals(requestingUserId)) {
            throw new ForbiddenException("You can only edit your own tickets");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new ConflictException("Only OPEN tickets can be edited");
        }

        String resourceId = null;
        String resourceName = null;
        if (dto.resourceId() != null) {
            Resource resource = resourceRepository.findById(dto.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.resourceId()));
            resourceId = resource.getId();
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

        return TicketResponseDto.summary(ticketRepository.save(ticket));
    }

    // ── Delete ticket ─────────────────────────────────────────────────────
    public void delete(String ticketId, String requestingUserId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);

        boolean isOwner = ticket.getReportedById().equals(requestingUserId);
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You can only delete your own tickets");
        }
        if (!isAdmin && ticket.getStatus() != TicketStatus.OPEN) {
            throw new ConflictException("You can only delete OPEN tickets");
        }

        // Delete attachment files from disk
        attachmentRepository.findByTicketId(ticketId)
            .forEach(a -> fileStorageService.delete(a.getFilePath()));

        commentRepository.deleteAll(commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId));
        attachmentRepository.deleteAll(attachmentRepository.findByTicketId(ticketId));
        ticketRepository.delete(ticket);
    }

    // ── Admin/Tech: list all tickets ──────────────────────────────────────
    public Page<TicketResponseDto> listAll(TicketStatus status, TicketPriority priority,
                                           TicketCategory category, String assignedTo,
                                           Pageable pageable) {
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
                .map(TicketResponseDto::summary);
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
                ticket.getReportedById(),
                ticket.getTitle(),
                dto.status().name(),
                ticket.getId()
            );
        }

        return TicketResponseDto.summary(saved);
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
            technician.getId(),
            ticket.getTitle(),
            ticket.getId()
        );

        return TicketResponseDto.summary(saved);
    }

    // ── Upload attachment ─────────────────────────────────────────────────
    public AttachmentResponseDto addAttachment(String ticketId, MultipartFile file,
                                               String uploaderId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);

        boolean isOwner = ticket.getReportedById().equals(uploaderId);
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You can only add attachments to your own tickets");
        }

        long existingCount = attachmentRepository.countByTicketId(ticketId);
        if (existingCount >= MAX_ATTACHMENTS) {
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

        return AttachmentResponseDto.from(attachmentRepository.save(attachment));
    }

    // ── Delete attachment ─────────────────────────────────────────────────
    public void deleteAttachment(String ticketId, String attachmentId,
                                  String requestingUserId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);
        TicketAttachment attachment = attachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));

        boolean isOwner = ticket.getReportedById().equals(requestingUserId);
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You can only delete attachments from your own tickets");
        }

        fileStorageService.delete(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

    // ── Public helper (used by TicketCommentService) ──────────────────────
    public IncidentTicket findOrThrow(String id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private User findUserOrThrow(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
