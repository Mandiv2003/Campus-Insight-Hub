package com.smartcampus.resource;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.common.dto.PagedResponse;
import com.smartcampus.common.util.AuthUtils;
import com.smartcampus.resource.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final AuthUtils authUtils;

    // GET /api/v1/resources?type=LAB&location=Block+A&minCapacity=30&status=ACTIVE&page=0&size=10
    // Public — no auth required (SecurityConfig permits all GET /api/v1/resources/**)
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ResourceResponseDto>>> list(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(resourceService.listResources(type, location, minCapacity, status, pageable))
        ));
    }

    // GET /api/v1/resources/{id}  — Public
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getById(id)));
    }

    // POST /api/v1/resources  — ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> create(
            @Valid @RequestBody ResourceRequestDto dto) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201)
            .body(ApiResponse.success(resourceService.create(dto, currentUserId)));
    }

    // PUT /api/v1/resources/{id}  — ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ResourceRequestDto dto) {

        return ResponseEntity.ok(ApiResponse.success(resourceService.update(id, dto)));
    }

    // PATCH /api/v1/resources/{id}/status  — ADMIN only
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ResourceStatusUpdateDto dto) {

        return ResponseEntity.ok(ApiResponse.success(resourceService.updateStatus(id, dto.status())));
    }

    // DELETE /api/v1/resources/{id}  — ADMIN only (soft delete → ARCHIVED)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/v1/resources/{id}/availability  — ADMIN only
    @PostMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AvailabilityWindowDto>> addAvailability(
            @PathVariable UUID id,
            @Valid @RequestBody AvailabilityWindowDto dto) {

        return ResponseEntity.status(201)
            .body(ApiResponse.success(resourceService.addAvailabilityWindow(id, dto)));
    }

    // DELETE /api/v1/resources/{id}/availability/{windowId}  — ADMIN only
    @DeleteMapping("/{id}/availability/{windowId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable UUID id,
            @PathVariable UUID windowId) {

        resourceService.deleteAvailabilityWindow(id, windowId);
        return ResponseEntity.noContent().build();
    }
}
