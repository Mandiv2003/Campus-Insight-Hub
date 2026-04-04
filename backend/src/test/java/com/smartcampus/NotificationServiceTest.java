package com.smartcampus;

import com.smartcampus.notification.NotificationRepository;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.notification.NotificationType;
import com.smartcampus.user.Role;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class NotificationServiceTest {

    @Autowired NotificationService notificationService;
    @Autowired NotificationRepository notificationRepository;
    @Autowired UserRepository userRepository;

    @Test
    void notifyBookingDecisionCreatesNotification() {
        User user = userRepository.save(User.builder()
            .email("test@test.com").fullName("Test User")
            .providerId("test-sub-1").provider("google").role(Role.USER).active(true)
            .build());

        notificationService.notifyBookingDecision(
            user.getId(), "Lab Booking", NotificationType.BOOKING_APPROVED, java.util.UUID.randomUUID().toString()
        );

        long count = notificationRepository.countByRecipientIdAndReadFalse(user.getId());
        assertThat(count).isEqualTo(1);
    }

    @Test
    void notifyNewCommentSkipsSelfNotification() {
        User user = userRepository.save(User.builder()
            .email("self@test.com").fullName("Self User")
            .providerId("test-sub-2").provider("google").role(Role.USER).active(true)
            .build());

        notificationService.notifyNewComment(
            user.getId(), user.getId(), "My Ticket", java.util.UUID.randomUUID().toString()
        );

        long count = notificationRepository.countByRecipientIdAndReadFalse(user.getId());
        assertThat(count).isEqualTo(0); // skipped because reporter == commenter
    }
}
