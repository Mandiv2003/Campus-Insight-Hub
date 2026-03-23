package com.smartcampus.user;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.common.util.AuthUtils;
import com.smartcampus.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUtils authUtils;

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
