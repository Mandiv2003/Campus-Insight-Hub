package com.smartcampus.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Strongly-typed configuration properties bound from the "app.*" namespace in application.yml.
 * Validated at startup — a misconfigured secret or redirect URI causes an immediate fail-fast.
 */
@ConfigurationProperties(prefix = "app")
@Validated
public record AppProperties(
        @Valid JwtProperties jwt,
        @NotBlank String uploadDir,
        @Valid OAuth2Properties oauth2
) {

    public record JwtProperties(
            @NotBlank String secret,
            @Positive long expirationMs
    ) {}

    public record OAuth2Properties(
            @NotBlank String redirectUri
    ) {}
}
