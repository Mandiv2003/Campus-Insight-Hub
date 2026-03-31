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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private static final int MAX_ATTACHMENTS = 3;

    private final IncidentTicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    // ── Create ticket ─────────────────────────────────────────────────────
    @Transactional
    public TicketResponseDto create(TicketRequestDto dto, UUID reportedById) {
        User reporter = findUserOrThrow(reportedById);

        Resource resource = null;
        if (dto.resourceId() != null) {
            resource = resourceRepository.findById(dto.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.resourceId()));
        }

        IncidentTicket ticket = IncidentTicket.builder()
            .reportedBy(reporter)
            .resource(resource)
            .title(dto.title())
            .description(dto.description())
            .category(dto.category())
            .priority(dto.priority())
            .locationDetail(dto.locationDetail())
            .contactPhone(dto.contactPhone())
            .contactEmail(dto.contactEmail())
            .status(TicketStatus.OPEN)
            .build();

        return TicketResponseDto.from(ticketRepository.save(ticket));
    }

    // ── Get user's own tickets ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<TicketResponseDto> getMyTickets(UUID userId, TicketStatus status, Pageable pageable) {
        Page<IncidentTicket> page = (status != null)
            ? ticketRepository.findByReportedByIdAndStatusOrderByCreatedAtDesc(userId, status, pageable)
            : ticketRepository.findByReportedByIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(TicketResponseDto::summary);
    }

    // ── Get single ticket ─────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public TicketResponseDto getById(UUID ticketId, UUID requestingUserId, boolean isAdmin, boolean isTechnician) {
        IncidentTicket ticket = findOrThrow(ticketId);
        if (!isAdmin && !isTechnician && !ticket.getReportedBy().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Access denied");
        }
        return TicketResponseDto.from(ticket);
    }

    // ── Update ticket (OPEN only, owner) ─────────────────────────────────
    @Transactional
    public TicketResponseDto update(UUID ticketId, TicketRequestDto dto, UUID requestingUserId) {
        IncidentTicket ticket = findOrThrow(ticketId);

        if (!ticket.getReportedBy().getId().equals(requestingUserId)) {
            throw new ForbiddenException("You can only edit your own tickets");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new ConflictException("Only OPEN tickets can be edited");
        }

        Resource resource = null;
        if (dto.resourceId() != null) {
            resource = resourceRepository.findById(dto.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.resourceId()));
        }

        ticket.setResource(resource);
        ticket.setTitle(dto.title());
        ticket.setDescription(dto.description());
        ticket.setCategory(dto.category());
        ticket.setPriority(dto.priority());
        ticket.setLocationDetail(dto.locationDetail());
        ticket.setContactPhone(dto.contactPhone());
        ticket.setContactEmail(dto.contactEmail());
        ticket.setUpdatedAt(LocalDateTime.now());

        return TicketResponseDto.from(ticketRepository.save(ticket));
    }

    // ── Delete ticket ─────────────────────────────────────────────────────
    @Transactional
    public void delete(UUID ticketId, UUID requestingUserId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);

        boolean isOwner = ticket.getReportedBy().getId().equals(requestingUserId);
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You can only delete your own tickets");
        }
        if (!isAdmin && ticket.getStatus() != TicketStatus.OPEN) {
            throw new ConflictException("You can only delete OPEN tickets");
        }

        // Delete attachment files from disk
        ticket.getAttachments().forEach(a -> fileStorageService.delete(a.getFilePath()));

        ticketRepository.delete(ticket);
    }

    // ── Admin/Tech: list all tickets ──────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<TicketResponseDto> listAll(TicketStatus status, TicketPriority priority,
                                           TicketCategory category, UUID assignedTo,
                                           Pageable pageable) {
        return ticketRepository
            .findAll(IncidentSpecification.withFilters(status, priority, category, assignedTo), pageable)
            .map(TicketResponseDto::summary);
    }

    // ── Admin/Tech: update ticket status ──────────────────────────────────
    @Transactional
    public TicketResponseDto updateStatus(UUID ticketId, TicketStatusUpdateDto dto, UUID updatingUserId) {
        IncidentTicket ticket = findOrThrow(ticketId);

        if (dto.status() == TicketStatus.RESOLVED && (dto.resolutionNotes() == null || dto.resolutionNotes().isBlank())) {
            throw new IllegalArgumentException("Resolution notes are required when resolving a ticket");
        }
        if (dto.status() == TicketStatus.REJECTED && (dto.rejectionReason() == null || dto.rejectionReason().isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when rejecting a ticket");
        }

        ticket.setStatus(dto.status());

        if (dto.resolutionNotes() != null) ticket.setResolutionNotes(dto.resolutionNotes());
        if (dto.rejectionReason() != null) ticket.setRejectionReason(dto.rejectionReason());

        if (dto.status() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        IncidentTicket saved = ticketRepository.save(ticket);

        // Notify reporter if status changed (skip if updater == reporter)
        if (!ticket.getReportedBy().getId().equals(updatingUserId)) {
            notificationService.notifyTicketStatusChange(
                ticket.getReportedBy().getId(),
                ticket.getTitle(),
                dto.status().name(),
                ticket.getId()
            );
        }

        return TicketResponseDto.from(saved);
    }

    // ── Admin: assign technician ──────────────────────────────────────────
    @Transactional
    public TicketResponseDto assignTechnician(UUID ticketId, AssignTechnicianDto dto) {
        IncidentTicket ticket = findOrThrow(ticketId);

        User technician = userRepository.findById(dto.technicianId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.technicianId()));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new ConflictException("Assigned user must have the TECHNICIAN role");
        }

        ticket.setAssignedTo(technician);
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

        return TicketResponseDto.from(saved);
    }

    // ── Upload attachment ─────────────────────────────────────────────────
    @Transactional
    public AttachmentResponseDto addAttachment(UUID ticketId, MultipartFile file,
                                               UUID uploaderId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);

        boolean isOwner = ticket.getReportedBy().getId().equals(uploaderId);
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
            .ticket(ticket)
            .uploadedBy(uploader)
            .fileName(storedFileName)
            .filePath(storedPath)
            .fileSize(file.getSize())
            .contentType(file.getContentType())
            .build();

        return AttachmentResponseDto.from(attachmentRepository.save(attachment));
    }

    // ── Delete attachment ─────────────────────────────────────────────────
    @Transactional
    public void deleteAttachment(UUID ticketId, UUID attachmentId,
                                 UUID requestingUserId, boolean isAdmin) {
        IncidentTicket ticket = findOrThrow(ticketId);
        TicketAttachment attachment = attachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));

        boolean isOwner = ticket.getReportedBy().getId().equals(requestingUserId);
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You can only delete attachments from your own tickets");
        }

        fileStorageService.delete(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    public IncidentTicket findOrThrow(UUID id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
