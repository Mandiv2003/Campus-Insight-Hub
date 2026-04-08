package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

    Page<Booking> findByRequestedByIdOrderByCreatedAtDesc(String requestedById, Pageable pageable);

    Page<Booking> findByRequestedByIdAndStatusOrderByCreatedAtDesc(
            String requestedById, BookingStatus status, Pageable pageable);

    // Conflict checks, availability, and admin filtering use MongoTemplate in BookingService
}
