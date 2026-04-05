package com.smartcampus.dto.user;

import com.smartcampus.model.enums.Role;

import java.time.LocalDateTime;

public record UserDto(
        String id,
        String email,
        String fullName,
        String avatarUrl,
        Role role,
        boolean active,
        LocalDateTime createdAt
) {}
