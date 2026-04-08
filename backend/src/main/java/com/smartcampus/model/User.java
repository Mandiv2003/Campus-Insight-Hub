package com.smartcampus.model;

import com.smartcampus.model.enums.Role;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Indexed(unique = true)
    private String email;

    @Field("full_name")
    private String fullName;

    @Field("avatar_url")
    private String avatarUrl;

    @Builder.Default
    private String provider = "local";

    @Field("provider_id")
    @Indexed(unique = true, sparse = true)
    private String providerId;

    @Field("password_hash")
    private String passwordHash;

    @Indexed(unique = true, sparse = true)
    private String username;

    @Builder.Default
    private Role role = Role.USER;

    @Field("is_active")
    @Builder.Default
    private boolean active = true;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
