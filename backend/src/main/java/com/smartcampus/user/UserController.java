package com.smartcampus.user;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.common.dto.PagedResponse;
import com.smartcampus.user.dto.RoleUpdateDto;
import com.smartcampus.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/v1/admin/users?role=TECHNICIAN&isActive=true&page=0&size=10
    @GetMapping("/api/v1/admin/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> listUsers(
        @RequestParam(required = false) Role role,
        @RequestParam(required = false) Boolean isActive,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(userService.getAllUsers(role, isActive, pageable))
        ));
    }

    // GET /api/v1/admin/users/{id}
    @GetMapping("/api/v1/admin/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    // PATCH /api/v1/admin/users/{id}/role
    @PatchMapping("/api/v1/admin/users/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateRole(
        @PathVariable UUID id,
        @Valid @RequestBody RoleUpdateDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateRole(id, dto.role())));
    }

    // PATCH /api/v1/admin/users/{id}/deactivate
    @PatchMapping("/api/v1/admin/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserDto>> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.deactivate(id)));
    }

    // GET /api/v1/users/technicians
    @GetMapping("/api/v1/users/technicians")
    public ResponseEntity<ApiResponse<List<UserDto>>> getTechnicians() {
        return ResponseEntity.ok(ApiResponse.success(userService.getTechnicians()));
    }

    // GET /api/v1/admin/stats  (Innovation feature — admin dashboard counts)
    @GetMapping("/api/v1/admin/stats")
    public ResponseEntity<ApiResponse<Object>> getStats() {
        // Returns a simple map; actual counts come from each module's repository
        // M4 provides the endpoint; stats populated once other modules exist
        return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("message", "stats endpoint ready")));
    }
}
