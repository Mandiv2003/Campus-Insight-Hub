package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.PagedResponse;
import com.smartcampus.dto.user.RoleUpdateDto;
import com.smartcampus.dto.user.UserDto;
import com.smartcampus.model.enums.Role;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/api/v1/admin/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> listUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.of(userService.getAllUsers(role, isActive, pageable))));
    }

    @GetMapping("/api/v1/admin/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PatchMapping("/api/v1/admin/users/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateRole(
            @PathVariable String id,
            @Valid @RequestBody RoleUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateRole(id, dto.role())));
    }

    @PatchMapping("/api/v1/admin/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserDto>> deactivate(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(userService.deactivate(id)));
    }

    @DeleteMapping("/api/v1/admin/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/api/v1/users/technicians")
    public ResponseEntity<ApiResponse<List<UserDto>>> getTechnicians() {
        return ResponseEntity.ok(ApiResponse.success(userService.getTechnicians()));
    }

    @GetMapping("/api/v1/admin/stats")
    public ResponseEntity<ApiResponse<Map<String, String>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "stats endpoint ready")));
    }
}
