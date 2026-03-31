package com.smartcampus.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID>,
        JpaSpecificationExecutor<Booking> {

    // User's own bookings (all statuses)
    Page<Booking> findByRequestedByIdOrderByCreatedAtDesc(UUID requestedById, Pageable pageable);

    // User's own bookings filtered by status
    Page<Booking> findByRequestedByIdAndStatusOrderByCreatedAtDesc(
            UUID requestedById, BookingStatus status, Pageable pageable);

    // Overlap conflict check — returns count of APPROVED bookings that overlap the proposed time window.
    // The overlap condition is: existing.start < proposed.end AND existing.end > proposed.start
    // excludeId allows re-checking at approve time while excluding the booking being approved.
    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.resource.id = :resourceId " +
           "AND b.status = :status " +
           "AND (:excludeId IS NULL OR b.id <> :excludeId) " +
           "AND b.startDatetime < :endDatetime " +
           "AND b.endDatetime > :startDatetime")
    long countConflicts(
            @Param("resourceId") UUID resourceId,
            @Param("startDatetime") LocalDateTime startDatetime,
            @Param("endDatetime") LocalDateTime endDatetime,
            @Param("excludeId") UUID excludeId,
            @Param("status") BookingStatus status);

    // Availability endpoint: approved bookings that overlap a calendar day
    @Query("SELECT b FROM Booking b " +
           "WHERE b.resource.id = :resourceId " +
           "AND b.status = :status " +
           "AND b.startDatetime < :endOfDay " +
           "AND b.endDatetime > :startOfDay " +
           "ORDER BY b.startDatetime")
    List<Booking> findApprovedByResourceOnDay(
            @Param("resourceId") UUID resourceId,
            @Param("status") BookingStatus status,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    // Used by M1's ResourceService.delete() conflict guard
    boolean existsByResourceIdAndStatusIn(UUID resourceId, List<BookingStatus> statuses);
}
