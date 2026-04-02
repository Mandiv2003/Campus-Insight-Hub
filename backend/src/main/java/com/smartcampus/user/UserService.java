package com.smartcampus.user;

import com.smartcampus.common.exception.ConflictException;
import com.smartcampus.common.exception.ForbiddenException;
import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.common.exception.UnauthorizedException;
import com.smartcampus.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerLocalUser(String fullName, String email, String username, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("An account with this email already exists");
        }
        String trimmedUsername = (username != null && !username.isBlank()) ? username.trim() : null;
        if (trimmedUsername != null && userRepository.findByUsername(trimmedUsername).isPresent()) {
            throw new ConflictException("Username is already taken");
        }
        User user = User.builder()
            .email(email)
            .fullName(fullName)
            .username(trimmedUsername)
            .passwordHash(passwordEncoder.encode(rawPassword))
            .provider("local")
            .role(Role.USER)
            .active(true)
            .build();
        return userRepository.save(user);
    }

    public User loginLocalUser(String identifier, String rawPassword) {
        User user = userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByUsername(identifier))
            .orElseThrow(() -> new UnauthorizedException("Invalid email/username or password"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email/username or password");
        }
        if (!user.isActive()) {
            throw new ForbiddenException("This account has been deactivated");
        }
        return user;
    }

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
