package com.smartcampus.mapper;

import com.smartcampus.dto.booking.BookingResponseDto;
import com.smartcampus.dto.booking.TimeSlotDto;
import com.smartcampus.model.Booking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    BookingResponseDto toDto(Booking booking);

    TimeSlotDto toTimeSlotDto(Booking booking);
}
