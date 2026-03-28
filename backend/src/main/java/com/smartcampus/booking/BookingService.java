package com.smartcampus.booking;

import com.smartcampus.booking.dto.*;
import com.smartcampus.common.dto.PagedResponse;
import com.smartcampus.common.exception.ConflictException;
import com.smartcampus.common.exception.ForbiddenException;
import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.notification.NotificationType;
import com.smartcampus.resource.Resource;
import com.smartcampus.resource.ResourceRepository;
import com.smartcampus.resource.ResourceStatus;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final ConflictCheckService conflictCheckService;
    private final NotificationService notificationService;

    // ── Create booking ────────────────────────────────────────────────────
    @Transactional
    public BookingResponseDto create(BookingRequestDto dto, UUID requestedById) {
        User requester = findUserOrThrow(requestedById);
        Resource resource = resourceRepository.findById(dto.resourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + dto.resourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ConflictException("Resource is not available for booking");
        }

        conflictCheckService.assertNoConflict(
            resource.getId(), dto.startDatetime(), dto.endDatetime(), null
        );

        Booking booking = Booking.builder()
            .resource(resource)
            .requestedBy(requester)
            .title(dto.title())
            .purpose(dto.purpose())
            .expectedAttendees(dto.expectedAttendees())
            .startDatetime(dto.startDatetime())
            .endDatetime(dto.endDatetime())
            .status(BookingStatus.PENDING)
            .build();

        return BookingResponseDto.from(bookingRepository.save(booking));
    }

    // ── Get user's own bookings ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<BookingResponseDto> getMyBookings(UUID userId, BookingStatus status, Pageable pageable) {
        Page<Booking> page = (status != null)
            ? bookingRepository.findByRequestedByIdAndStatusOrderByCreatedAtDesc(userId, status, pageable)
            : bookingRepository.findByRequestedByIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(BookingResponseDto::from);
    }

    // ── Get single booking ────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BookingResponseDto getById(UUID bookingId, UUID requestingUserId, boolean isAdmin) {
        Booking booking = findOrThrow(bookingId);
        if (!isAdmin && !booking.getRequestedBy().getId().equals(requestingUserId)) {
            throw new ForbiddenException("Access denied");
        }
        return BookingResponseDto.from(booking);
    }

    // ── Cancel booking ────────────────────────────────────────────────────
    @Transactional
    public BookingResponseDto cancel(UUID bookingId, BookingDecisionDto dto,
                                     UUID requestingUserId, boolean isAdmin) {
        Booking booking = findOrThrow(bookingId);

        if (!isAdmin && !booking.getRequestedBy().getId().equals(requestingUserId)) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationNote(dto != null ? dto.cancellationNote() : null);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify the requester if an admin cancelled their booking
        if (isAdmin && !booking.getRequestedBy().getId().equals(requestingUserId)) {
            notificationService.notifyBookingDecision(
                booking.getRequestedBy().getId(),
                booking.getTitle(),
                NotificationType.BOOKING_CANCELLED,
                booking.getId()
            );
        }

        return BookingResponseDto.from(saved);
    }

    // ── Admin: list all bookings ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<BookingResponseDto> listAll(UUID resourceId, BookingStatus status,
                                            LocalDateTime from, LocalDateTime to,
                                            Pageable pageable) {
        return bookingRepository
            .findAll(BookingSpecification.withFilters(resourceId, status, from, to), pageable)
            .map(BookingResponseDto::from);
    }

    // ── Admin: approve booking ────────────────────────────────────────────
    @Transactional
    public BookingResponseDto approve(UUID bookingId, UUID reviewerId) {
        Booking booking = findOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only PENDING bookings can be approved");
        }

        // Re-check conflict at approval time — another booking may have been approved since submission
        conflictCheckService.assertNoConflict(
            booking.getResource().getId(),
            booking.getStartDatetime(),
            booking.getEndDatetime(),
            booking.getId()             // exclude this booking itself
        );

        User reviewer = findUserOrThrow(reviewerId);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(reviewer);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingDecision(
            booking.getRequestedBy().getId(),
            booking.getTitle(),
            NotificationType.BOOKING_APPROVED,
            booking.getId()
        );

        return BookingResponseDto.from(saved);
    }

    // ── Admin: reject booking ─────────────────────────────────────────────
    @Transactional
    public BookingResponseDto reject(UUID bookingId, BookingDecisionDto dto, UUID reviewerId) {
        if (dto.rejectionReason() == null || dto.rejectionReason().isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        Booking booking = findOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only PENDING bookings can be rejected");
        }

        User reviewer = findUserOrThrow(reviewerId);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(dto.rejectionReason());
        booking.setReviewedBy(reviewer);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingDecision(
            booking.getRequestedBy().getId(),
            booking.getTitle(),
            NotificationType.BOOKING_REJECTED,
            booking.getId()
        );

        return BookingResponseDto.from(saved);
    }

    // ── Public: approved time slots for a resource on a given date ────────
    @Transactional(readOnly = true)
    public List<TimeSlotDto> getAvailability(UUID resourceId, LocalDate date) {
        resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay   = date.plusDays(1).atStartOfDay();

        return bookingRepository
            .findApprovedByResourceOnDay(resourceId, BookingStatus.APPROVED, startOfDay, endOfDay)
            .stream()
            .map(TimeSlotDto::from)
            .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private Booking findOrThrow(UUID id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
