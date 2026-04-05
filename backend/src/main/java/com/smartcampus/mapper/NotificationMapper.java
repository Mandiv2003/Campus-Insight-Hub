package com.smartcampus.mapper;

import com.smartcampus.dto.notification.NotificationDto;
import com.smartcampus.model.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationDto toDto(Notification notification);
}
