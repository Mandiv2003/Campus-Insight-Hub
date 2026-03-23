package com.smartcampus.resource.dto;

import com.smartcampus.resource.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public record ResourceStatusUpdateDto(@NotNull ResourceStatus status) {}
