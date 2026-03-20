package com.smartcampus.user.dto;

import com.smartcampus.user.Role;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateDto(@NotNull Role role) {}
