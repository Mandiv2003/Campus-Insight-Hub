package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.PagedResponse;
import com.smartcampus.dto.ticket.*;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.service.IncidentTicketService;
import com.smartcampus.service.TicketCommentService;
import com.smartcampus.util.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Paths;

@RestController
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService ticketService;
    private final TicketCommentService commentService;
    private final AuthUtils authUtils;

    @PostMapping("/api/v1/tickets")
    public ResponseEntity<ApiResponse<TicketResponseDto>> create(
            @Valid @RequestBody TicketRequestDto dto) {
        String currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201)
                .body(ApiResponse.success(ticketService.create(dto, currentUserId)));
    }

    @GetMapping("/api/v1/tickets/my")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponseDto>>> getMyTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String currentUserId = authUtils.getCurrentUser().getId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.of(ticketService.getMyTickets(currentUserId, status, pageable))));
    }

    @GetMapping("/api/v1/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDto>> getById(@PathVariable String id) {
        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        boolean isTech  = authUtils.isTechnician();
        return ResponseEntity.ok(ApiResponse.success(
                ticketService.getById(id, currentUser.getId(), isAdmin, isTech)));
    }

    @PutMapping("/api/v1/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDto>> update(
            @PathVariable String id,
            @Valid @RequestBody TicketRequestDto dto) {
        String currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                ticketService.update(id, dto, currentUserId)));
    }

    @DeleteMapping("/api/v1/tickets/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        var currentUser = authUtils.getCurrentUser();
        ticketService.delete(id, currentUser.getId(), authUtils.isAdmin());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/admin/tickets")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponseDto>>> listAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.of(ticketService.listAll(status, priority, category, assignedTo, pageable))));
    }

    @PatchMapping("/api/v1/admin/tickets/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponseDto>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateDto dto) {
        String currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                ticketService.updateStatus(id, dto, currentUserId)));
    }

    @PatchMapping("/api/v1/admin/tickets/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponseDto>> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody AssignTechnicianDto dto) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.assignTechnician(id, dto)));
    }

    @PostMapping(value = "/api/v1/tickets/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponseDto>> uploadAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        var currentUser = authUtils.getCurrentUser();
        return ResponseEntity.status(201).body(ApiResponse.success(
                ticketService.addAttachment(id, file, currentUser.getId(), authUtils.isAdmin())));
    }

    @DeleteMapping("/api/v1/tickets/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId) {
        var currentUser = authUtils.getCurrentUser();
        ticketService.deleteAttachment(id, attachmentId, currentUser.getId(), authUtils.isAdmin());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/v1/tickets/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponseDto>> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentDto dto) {
        String currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201).body(ApiResponse.success(
                commentService.addComment(id, dto, currentUserId)));
    }

    @PutMapping("/api/v1/tickets/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponseDto>> editComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @Valid @RequestBody CommentDto dto) {
        String currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
                commentService.editComment(id, commentId, dto, currentUserId)));
    }

    @DeleteMapping("/api/v1/tickets/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId) {
        var currentUser = authUtils.getCurrentUser();
        commentService.deleteComment(id, commentId, currentUser.getId(), authUtils.isAdmin());
        return ResponseEntity.noContent().build();
    }

    /** Serves uploaded attachment files directly from disk. */
    @GetMapping("/api/v1/files/{ticketId}/{filename}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String ticketId,
            @PathVariable String filename) {
        try {
            java.nio.file.Path filePath = Paths.get("uploads", "tickets", ticketId, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = filename.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
