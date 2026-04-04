package com.smartcampus.booking;

import com.smartcampus.common.exception.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConflictCheckService {

    private final MongoTemplate mongoTemplate;

    /**
     * Throws ConflictException if an APPROVED booking already overlaps the proposed time window.
     * Overlap condition: existing.start < proposed.end AND existing.end > proposed.start
     *
     * @param excludeBookingId pass null for new bookings; pass the booking's own id when
     *                         re-checking at approval time so it doesn't conflict with itself
     */
    public void assertNoConflict(String resourceId,
                                  LocalDateTime startDatetime,
                                  LocalDateTime endDatetime,
                                  String excludeBookingId) {

        if (!startDatetime.isBefore(endDatetime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Criteria criteria = Criteria.where("resource_id").is(resourceId)
            .and("status").is(BookingStatus.APPROVED.name())
            .and("start_datetime").lt(endDatetime)
            .and("end_datetime").gt(startDatetime);

        if (excludeBookingId != null) {
            criteria.and("_id").ne(excludeBookingId);
        }

        long conflicts = mongoTemplate.count(new Query(criteria), Booking.class);

        if (conflicts > 0) {
            throw new ConflictException(
                "This resource already has an approved booking that overlaps the requested time"
            );
        }
    }
}
