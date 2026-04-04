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

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthUtils authUtils;

    @PostMapping("/api/v1/bookings")
    public ResponseEntity<ApiResponse<BookingResponseDto>> create(
            @Valid @RequestBody BookingRequestDto dto) {

        String currentUserId = authUtils.getCurrentUser().getId();
        return ResponseEntity.status(201)
            .body(ApiResponse.success(bookingService.create(dto, currentUserId)));
    }

    @GetMapping("/api/v1/bookings/my")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponseDto>>> getMyBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String currentUserId = authUtils.getCurrentUser().getId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(bookingService.getMyBookings(currentUserId, status, pageable))
        ));
    }

    @GetMapping("/api/v1/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDto>> getById(@PathVariable String id) {
        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getById(id, currentUser.getId(), isAdmin)
        ));
    }

    @PatchMapping("/api/v1/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancel(
            @PathVariable String id,
            @RequestBody(required = false) BookingDecisionDto dto) {

        var currentUser = authUtils.getCurrentUser();
        boolean isAdmin = authUtils.isAdmin();
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.cancel(id, dto, currentUser.getId(), isAdmin)
        ));
    }

    @GetMapping("/api/v1/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponseDto>>> listAll(
            @RequestParam(required = false) String resourceId,
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

    @PatchMapping("/api/v1/admin/bookings/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDto>> approve(@PathVariable String id) {
        String reviewerId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(bookingService.approve(id, reviewerId)));
    }

    @PatchMapping("/api/v1/admin/bookings/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDto>> reject(
            @PathVariable String id,
            @RequestBody BookingDecisionDto dto) {

        String reviewerId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(bookingService.reject(id, dto, reviewerId)));
    }

    @GetMapping("/api/v1/resources/{resourceId}/bookings/availability")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getAvailability(
            @PathVariable String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getAvailability(resourceId, date)
        ));
    }
}
