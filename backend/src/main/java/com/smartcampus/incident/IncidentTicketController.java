package com.smartcampus.incident;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.common.dto.PagedResponse;
import com.smartcampus.common.util.AuthUtils;
import com.smartcampus.incident.dto.*;
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
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService ticketService;
    private final TicketCommentService commentService;
    private final FileStorageService fileStorageService;
    private final AuthUtils authUtils;

    // ── 1. POST /api/v1/tickets — create ticket (any authenticated user) ──
    @PostMapping("/api/v1/tickets")
    public ResponseEntity<ApiResponse<TicketResponseDto>> create(
            @Valid @RequestBody TicketRequestDto dto) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201)
            .body(ApiResponse.success(ticketService.create(dto, currentUserId)));
    }

    // ── 2. GET /api/v1/tickets/my?status=OPEN&page=0&size=10 ─────────────
    @GetMapping("/api/v1/tickets/my")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponseDto>>> getMyTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(ticketService.getMyTickets(currentUserId, status, pageable))
        ));
    }

    // ── 3. GET /api/v1/tickets/{id} ───────────────────────────────────────
    @GetMapping("/api/v1/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDto>> getById(@PathVariable UUID id) {
        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        boolean isTech  = currentUser.getRole().name().equals("TECHNICIAN");
        return ResponseEntity.ok(ApiResponse.success(
            ticketService.getById(id, currentUser.getId(), isAdmin, isTech)
        ));
    }

    // ── 4. PUT /api/v1/tickets/{id} — owner edit (OPEN only) ─────────────
    @PutMapping("/api/v1/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody TicketRequestDto dto) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
            ticketService.update(id, dto, currentUserId)
        ));
    }

    // ── 5. DELETE /api/v1/tickets/{id} ───────────────────────────────────
    @DeleteMapping("/api/v1/tickets/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        ticketService.delete(id, currentUser.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    // ── 6. GET /api/v1/admin/tickets (admin + tech) ───────────────────────
    @GetMapping("/api/v1/admin/tickets")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponseDto>>> listAll(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) UUID assignedTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(ticketService.listAll(status, priority, category, assignedTo, pageable))
        ));
    }

    // ── 7. PATCH /api/v1/admin/tickets/{id}/status ────────────────────────
    @PatchMapping("/api/v1/admin/tickets/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponseDto>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TicketStatusUpdateDto dto) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
            ticketService.updateStatus(id, dto, currentUserId)
        ));
    }

    // ── 8. PATCH /api/v1/admin/tickets/{id}/assign (admin only) ──────────
    @PatchMapping("/api/v1/admin/tickets/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponseDto>> assignTechnician(
            @PathVariable UUID id,
            @Valid @RequestBody AssignTechnicianDto dto) {

        return ResponseEntity.ok(ApiResponse.success(
            ticketService.assignTechnician(id, dto)
        ));
    }

    // ── 9. POST /api/v1/tickets/{id}/attachments — upload image ──────────
    @PostMapping(value = "/api/v1/tickets/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponseDto>> uploadAttachment(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {

        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        return ResponseEntity.status(201).body(ApiResponse.success(
            ticketService.addAttachment(id, file, currentUser.getId(), isAdmin)
        ));
    }

    // ── 10. DELETE /api/v1/tickets/{id}/attachments/{attachmentId} ────────
    @DeleteMapping("/api/v1/tickets/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @PathVariable UUID attachmentId) {

        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        ticketService.deleteAttachment(id, attachmentId, currentUser.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    // ── 11. POST /api/v1/tickets/{id}/comments ────────────────────────────
    @PostMapping("/api/v1/tickets/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponseDto>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentDto dto) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201).body(ApiResponse.success(
            commentService.addComment(id, dto, currentUserId)
        ));
    }

    // ── 12. PUT /api/v1/tickets/{id}/comments/{commentId} ────────────────
    @PutMapping("/api/v1/tickets/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponseDto>> editComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            @Valid @RequestBody CommentDto dto) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
            commentService.editComment(id, commentId, dto, currentUserId)
        ));
    }

    // ── 13. DELETE /api/v1/tickets/{id}/comments/{commentId} ─────────────
    @DeleteMapping("/api/v1/tickets/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId) {

        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        commentService.deleteComment(id, commentId, currentUser.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    // ── Bonus: GET /api/v1/files/{ticketId}/{filename} — serve file ───────
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
