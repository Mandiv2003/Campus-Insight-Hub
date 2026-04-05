package com.smartcampus.dto.resource;

import com.smartcampus.model.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public record ResourceStatusUpdateDto(@NotNull ResourceStatus status) {}
