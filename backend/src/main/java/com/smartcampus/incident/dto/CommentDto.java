package com.smartcampus.incident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentDto(
    @NotBlank @Size(max = 2000) String body
) {}
