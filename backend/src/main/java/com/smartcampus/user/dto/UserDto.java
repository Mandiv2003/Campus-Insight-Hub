package com.smartcampus.user.dto;

import com.smartcampus.user.Role;
import com.smartcampus.user.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String fullName,
    String avatarUrl,
    Role role,
    boolean active,
    LocalDateTime createdAt
) {
    public static UserDto from(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getAvatarUrl(),
            user.getRole(),
            user.isActive(),
            user.getCreatedAt()
        );
    }
}
