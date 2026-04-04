package com.smartcampus.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

    // User's own bookings
    Page<Booking> findByRequestedByIdOrderByCreatedAtDesc(String requestedById, Pageable pageable);

    Page<Booking> findByRequestedByIdAndStatusOrderByCreatedAtDesc(
            String requestedById, BookingStatus status, Pageable pageable);

    // Conflict check, availability, and admin filtering are done via MongoTemplate in the service layer
}
