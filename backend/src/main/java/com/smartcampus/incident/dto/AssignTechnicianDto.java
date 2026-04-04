package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotNull;

public record AssignTechnicianDto(
    @NotNull String technicianId
) {}
