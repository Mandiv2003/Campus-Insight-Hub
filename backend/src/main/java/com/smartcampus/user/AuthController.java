package com.smartcampus.user;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.common.util.AuthUtils;
import com.smartcampus.config.JwtTokenProvider;
import com.smartcampus.user.dto.AuthResponse;
import com.smartcampus.user.dto.LoginRequest;
import com.smartcampus.user.dto.RegisterRequest;
import com.smartcampus.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUtils authUtils;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        User user = userService.registerLocalUser(req.fullName(), req.email(), req.username(), req.password());
        String token = jwtTokenProvider.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(new AuthResponse(token, UserDto.from(user))));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        User user = userService.loginLocalUser(req.identifier(), req.password());
        String token = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(ApiResponse.success(new AuthResponse(token, UserDto.from(user))));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> me() {
        return ResponseEntity.ok(ApiResponse.success(UserDto.from(authUtils.getCurrentUser())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless — client removes the token
        return ResponseEntity.noContent().build();
    }
}
