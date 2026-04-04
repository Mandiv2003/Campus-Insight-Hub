package com.smartcampus.incident;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "ticket_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketAttachment {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Field("ticket_id")
    @Indexed
    private String ticketId;

    @Field("uploaded_by_id")
    private String uploadedById;

    @Field("uploaded_by_name")
    private String uploadedByName;

    @Field("file_name")
    private String fileName;

    @Field("file_path")
    private String filePath;

    @Field("file_size")
    private Long fileSize;

    @Field("content_type")
    private String contentType;

    @Field("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
