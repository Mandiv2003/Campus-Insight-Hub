package com.smartcampus.booking;

import com.smartcampus.booking.dto.*;
import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.common.dto.PagedResponse;
import com.smartcampus.common.util.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthUtils authUtils;

    // POST /api/v1/bookings — authenticated users + admins
    @PostMapping("/api/v1/bookings")
    public ResponseEntity<ApiResponse<BookingResponseDto>> create(
            @Valid @RequestBody BookingRequestDto dto) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201)
            .body(ApiResponse.success(bookingService.create(dto, currentUserId)));
    }

    // GET /api/v1/bookings/my?status=PENDING&page=0&size=10
    @GetMapping("/api/v1/bookings/my")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponseDto>>> getMyBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        UUID currentUserId = authUtils.getCurrentUser().getId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(bookingService.getMyBookings(currentUserId, status, pageable))
        ));
    }

    // GET /api/v1/bookings/{id}
    @GetMapping("/api/v1/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDto>> getById(@PathVariable UUID id) {
        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getById(id, currentUser.getId(), isAdmin)
        ));
    }

    // PATCH /api/v1/bookings/{id}/cancel
    @PatchMapping("/api/v1/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancel(
            @PathVariable UUID id,
            @RequestBody(required = false) BookingDecisionDto dto) {

        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.cancel(id, dto, currentUser.getId(), isAdmin)
        ));
    }

    // GET /api/v1/admin/bookings?resourceId=&status=&from=&to=&page=0&size=10
    @GetMapping("/api/v1/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponseDto>>> listAll(
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(bookingService.listAll(resourceId, status, from, to, pageable))
        ));
    }

    // PATCH /api/v1/admin/bookings/{id}/approve
    @PatchMapping("/api/v1/admin/bookings/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDto>> approve(@PathVariable UUID id) {
        UUID reviewerId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(bookingService.approve(id, reviewerId)));
    }

    // PATCH /api/v1/admin/bookings/{id}/reject
    @PatchMapping("/api/v1/admin/bookings/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDto>> reject(
            @PathVariable UUID id,
            @RequestBody BookingDecisionDto dto) {

        UUID reviewerId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(bookingService.reject(id, dto, reviewerId)));
    }

    // GET /api/v1/resources/{resourceId}/bookings/availability?date=2026-04-10 — Public
    @GetMapping("/api/v1/resources/{resourceId}/bookings/availability")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getAvailability(
            @PathVariable UUID resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getAvailability(resourceId, date)
        ));
    }
}
