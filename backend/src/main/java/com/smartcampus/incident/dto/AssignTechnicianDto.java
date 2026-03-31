package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignTechnicianDto(
    @NotNull UUID technicianId
) {}
