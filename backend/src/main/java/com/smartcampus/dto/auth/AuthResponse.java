package com.smartcampus.dto.auth;

import com.smartcampus.dto.user.UserDto;

public record AuthResponse(String token, UserDto user) {}
