package com.smartcampus.booking;

import com.smartcampus.booking.dto.*;
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
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final ConflictCheckService conflictCheckService;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    // ── Create booking ────────────────────────────────────────────────────
    public BookingResponseDto create(BookingRequestDto dto, String requestedById) {
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
            .resourceId(resource.getId())
            .resourceName(resource.getName())
            .requestedById(requester.getId())
            .requestedByName(requester.getFullName())
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
    public Page<BookingResponseDto> getMyBookings(String userId, BookingStatus status, Pageable pageable) {
        Page<Booking> page = (status != null)
            ? bookingRepository.findByRequestedByIdAndStatusOrderByCreatedAtDesc(userId, status, pageable)
            : bookingRepository.findByRequestedByIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(BookingResponseDto::from);
    }

    // ── Get single booking ────────────────────────────────────────────────
    public BookingResponseDto getById(String bookingId, String requestingUserId, boolean isAdmin) {
        Booking booking = findOrThrow(bookingId);
        if (!isAdmin && !booking.getRequestedById().equals(requestingUserId)) {
            throw new ForbiddenException("Access denied");
        }
        return BookingResponseDto.from(booking);
    }

    // ── Cancel booking ────────────────────────────────────────────────────
    public BookingResponseDto cancel(String bookingId, BookingDecisionDto dto,
                                     String requestingUserId, boolean isAdmin) {
        Booking booking = findOrThrow(bookingId);

        if (!isAdmin && !booking.getRequestedById().equals(requestingUserId)) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationNote(dto != null ? dto.cancellationNote() : null);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        if (isAdmin && !booking.getRequestedById().equals(requestingUserId)) {
            notificationService.notifyBookingDecision(
                booking.getRequestedById(),
                booking.getTitle(),
                NotificationType.BOOKING_CANCELLED,
                booking.getId()
            );
        }

        return BookingResponseDto.from(saved);
    }

    // ── Admin: list all bookings ──────────────────────────────────────────
    public Page<BookingResponseDto> listAll(String resourceId, BookingStatus status,
                                            LocalDateTime from, LocalDateTime to,
                                            Pageable pageable) {
        List<Criteria> parts = new ArrayList<>();

        if (resourceId != null) parts.add(Criteria.where("resource_id").is(resourceId));
        if (status != null)     parts.add(Criteria.where("status").is(status.name()));
        if (from != null)       parts.add(Criteria.where("start_datetime").gte(from));
        if (to != null)         parts.add(Criteria.where("end_datetime").lte(to));

        Criteria criteria = parts.isEmpty()
            ? new Criteria()
            : new Criteria().andOperator(parts.toArray(new Criteria[0]));

        Query query = new Query(criteria).with(pageable);
        List<Booking> bookings = mongoTemplate.find(query, Booking.class);
        long total = mongoTemplate.count(new Query(criteria), Booking.class);

        return PageableExecutionUtils.getPage(bookings, pageable, () -> total)
                .map(BookingResponseDto::from);
    }

    // ── Admin: approve booking ────────────────────────────────────────────
    public BookingResponseDto approve(String bookingId, String reviewerId) {
        Booking booking = findOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only PENDING bookings can be approved");
        }

        conflictCheckService.assertNoConflict(
            booking.getResourceId(),
            booking.getStartDatetime(),
            booking.getEndDatetime(),
            booking.getId()
        );

        User reviewer = findUserOrThrow(reviewerId);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedById(reviewer.getId());
        booking.setReviewedByName(reviewer.getFullName());
        booking.setReviewedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingDecision(
            booking.getRequestedById(),
            booking.getTitle(),
            NotificationType.BOOKING_APPROVED,
            booking.getId()
        );

        return BookingResponseDto.from(saved);
    }

    // ── Admin: reject booking ─────────────────────────────────────────────
    public BookingResponseDto reject(String bookingId, BookingDecisionDto dto, String reviewerId) {
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
        booking.setReviewedById(reviewer.getId());
        booking.setReviewedByName(reviewer.getFullName());
        booking.setReviewedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingDecision(
            booking.getRequestedById(),
            booking.getTitle(),
            NotificationType.BOOKING_REJECTED,
            booking.getId()
        );

        return BookingResponseDto.from(saved);
    }

    // ── Public: approved time slots for a resource on a given date ────────
    public List<TimeSlotDto> getAvailability(String resourceId, LocalDate date) {
        resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay   = date.plusDays(1).atStartOfDay();

        Criteria criteria = Criteria.where("resource_id").is(resourceId)
            .and("status").is(BookingStatus.APPROVED.name())
            .and("start_datetime").lt(endOfDay)
            .and("end_datetime").gt(startOfDay);

        Query query = new Query(criteria)
            .with(org.springframework.data.domain.Sort.by("start_datetime").ascending());

        return mongoTemplate.find(query, Booking.class)
            .stream()
            .map(TimeSlotDto::from)
            .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private Booking findOrThrow(String id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private User findUserOrThrow(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
