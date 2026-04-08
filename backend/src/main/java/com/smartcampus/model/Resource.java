package com.smartcampus.model;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    private String name;

    private ResourceType type;

    private Integer capacity;

    private String location;

    private String description;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Field("image_url")
    private String imageUrl;

    @Field("created_by_id")
    private String createdById;

    @Field("availability_windows")
    @Builder.Default
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
