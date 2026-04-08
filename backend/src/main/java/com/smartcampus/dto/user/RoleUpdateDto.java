package com.smartcampus.dto.user;

import com.smartcampus.model.enums.Role;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateDto(@NotNull Role role) {}
