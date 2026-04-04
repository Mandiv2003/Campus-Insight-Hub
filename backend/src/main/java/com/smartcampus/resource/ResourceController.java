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

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final AuthUtils authUtils;

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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> create(
            @Valid @RequestBody ResourceRequestDto dto) {

        String currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201)
            .body(ApiResponse.success(resourceService.create(dto, currentUserId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> update(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequestDto dto) {

        return ResponseEntity.ok(ApiResponse.success(resourceService.update(id, dto)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDto>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody ResourceStatusUpdateDto dto) {

        return ResponseEntity.ok(ApiResponse.success(resourceService.updateStatus(id, dto.status())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AvailabilityWindowDto>> addAvailability(
            @PathVariable String id,
            @Valid @RequestBody AvailabilityWindowDto dto) {

        return ResponseEntity.status(201)
            .body(ApiResponse.success(resourceService.addAvailabilityWindow(id, dto)));
    }

    @DeleteMapping("/{id}/availability/{windowId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable String id,
            @PathVariable String windowId) {

        resourceService.deleteAvailabilityWindow(id, windowId);
        return ResponseEntity.noContent().build();
    }
}
