package com.smartcampus.notification;

import com.smartcampus.common.dto.ApiResponse;
import com.smartcampus.common.dto.PagedResponse;
import com.smartcampus.common.util.AuthUtils;
import com.smartcampus.notification.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthUtils authUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDto>>> list(
        @RequestParam(required = false) Boolean isRead,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        String userId = authUtils.getCurrentUser().getId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(
            PagedResponse.of(notificationService.getForUser(userId, isRead, pageable))
        ));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markRead(@PathVariable String id) {
        String userId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(notificationService.markRead(id, userId)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllRead() {
        String userId = authUtils.getCurrentUser().getId();
        int count = notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("updated", count)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        String userId = authUtils.getCurrentUser().getId();
        notificationService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        String userId = authUtils.getCurrentUser().getId();
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("count", notificationService.countUnread(userId))
        ));
    }
}
