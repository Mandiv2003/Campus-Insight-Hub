package com.smartcampus.user;

import com.smartcampus.common.exception.ForbiddenException;
import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User upsertGoogleUser(String email, String name, String providerId, String avatarUrl) {
        return userRepository.findByProviderId(providerId)
            .map(existing -> {
                existing.setFullName(name);
                existing.setAvatarUrl(avatarUrl);
                existing.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(existing);
            })
            .orElseGet(() -> {
                User user = User.builder()
                    .email(email)
                    .fullName(name)
                    .providerId(providerId)
                    .avatarUrl(avatarUrl)
                    .provider("google")
                    .role(Role.USER)
                    .active(true)
                    .build();
                return userRepository.save(user);
            });
    }

    public Page<UserDto> getAllUsers(Role role, Boolean isActive, Pageable pageable) {
        Page<User> page;
        if (role != null && isActive != null) {
            page = userRepository.findByRoleAndActive(role, isActive, pageable);
        } else if (role != null) {
            page = userRepository.findByRole(role, pageable);
        } else {
            page = userRepository.findAll(pageable);
        }
        return page.map(UserDto::from);
    }

    public UserDto getUserById(UUID id) {
        return UserDto.from(findOrThrow(id));
    }

    @Transactional
    public UserDto updateRole(UUID id, Role newRole) {
        User user = findOrThrow(id);
        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto deactivate(UUID id) {
        User user = findOrThrow(id);
        if (!user.isActive()) throw new ForbiddenException("User is already deactivated");
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        return UserDto.from(userRepository.save(user));
    }

    public List<UserDto> getTechnicians() {
        return userRepository.findByRoleAndActiveTrue(Role.TECHNICIAN)
            .stream().map(UserDto::from).toList();
    }

    private User findOrThrow(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
