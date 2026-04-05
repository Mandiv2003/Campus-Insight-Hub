package com.smartcampus.model;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "incident_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentTicket {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Field("resource_id")
    private String resourceId;              // nullable

    @Field("resource_name")
    private String resourceName;            // nullable

    @Field("reported_by_id")
    @Indexed
    private String reportedById;

    @Field("reported_by_name")
    private String reportedByName;

    @Field("assigned_to_id")
    @Indexed
    private String assignedToId;            // nullable

    @Field("assigned_to_name")
    private String assignedToName;          // nullable

    private String title;

    private String description;

    private TicketCategory category;

    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM;

    @Field("location_detail")
    private String locationDetail;

    @Field("contact_phone")
    private String contactPhone;

    @Field("contact_email")
    private String contactEmail;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Field("resolution_notes")
    private String resolutionNotes;

    @Field("rejection_reason")
    private String rejectionReason;

    @Field("resolved_at")
    private LocalDateTime resolvedAt;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
