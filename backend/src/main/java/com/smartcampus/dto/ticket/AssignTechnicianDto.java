package com.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotNull;

public record AssignTechnicianDto(@NotNull String technicianId) {}
