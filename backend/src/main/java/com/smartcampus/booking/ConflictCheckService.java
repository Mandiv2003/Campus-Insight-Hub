package com.smartcampus.booking;

import com.smartcampus.common.exception.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConflictCheckService {

    private final BookingRepository bookingRepository;

    /**
     * Throws ConflictException if an APPROVED booking already overlaps the proposed time window.
     *
     * @param resourceId     the resource being booked
     * @param startDatetime  proposed start
     * @param endDatetime    proposed end
     * @param excludeBookingId pass null for new bookings; pass the booking's own ID when
     *                        re-checking at approval time so the booking doesn't conflict with itself
     */
    public void assertNoConflict(UUID resourceId,
                                 LocalDateTime startDatetime,
                                 LocalDateTime endDatetime,
                                 UUID excludeBookingId) {

        if (!startDatetime.isBefore(endDatetime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        long conflicts = bookingRepository.countConflicts(
            resourceId, startDatetime, endDatetime, excludeBookingId, BookingStatus.APPROVED
        );

        if (conflicts > 0) {
            throw new ConflictException(
                "This resource already has an approved booking that overlaps the requested time"
            );
        }
    }
}
