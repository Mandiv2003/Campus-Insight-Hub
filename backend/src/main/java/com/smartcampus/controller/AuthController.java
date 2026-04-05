package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.auth.AuthResponse;
import com.smartcampus.dto.auth.LoginRequest;
import com.smartcampus.dto.auth.RegisterRequest;
import com.smartcampus.dto.user.UserDto;
import com.smartcampus.mapper.UserMapper;
import com.smartcampus.model.User;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.service.UserService;
import com.smartcampus.util.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final AuthUtils authUtils;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        User user  = userService.registerLocalUser(req.fullName(), req.email(), req.username(), req.password());
        String jwt = jwtTokenProvider.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(new AuthResponse(jwt, userMapper.toDto(user))));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        User user  = userService.loginLocalUser(req.identifier(), req.password());
        String jwt = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(ApiResponse.success(new AuthResponse(jwt, userMapper.toDto(user))));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> me() {
        return ResponseEntity.ok(ApiResponse.success(userMapper.toDto(authUtils.getCurrentUser())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless — the client discards the token
        return ResponseEntity.noContent().build();
    }
}
