package com.smartcampus.incident;

import com.smartcampus.common.exception.ConflictException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L; // 5 MB
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png");

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Validate and store an attachment. Returns the stored file path.
     *
     * @param file     the multipart file uploaded by the user
     * @param ticketId the ticket this attachment belongs to
     * @return stored relative path: uploads/tickets/{ticketId}/{uuid}_{filename}
     */
    public String store(MultipartFile file, UUID ticketId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum size of 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG and PNG images are allowed");
        }

        String originalName = file.getOriginalFilename() != null
            ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
            : "attachment";
        String storedName = UUID.randomUUID() + "_" + originalName;

        Path ticketDir = Paths.get(uploadDir, "tickets", ticketId.toString());
        try {
            Files.createDirectories(ticketDir);
            Path dest = ticketDir.resolve(storedName);
            file.transferTo(dest.toFile());
        } catch (IOException e) {
            throw new ConflictException("Could not store file: " + e.getMessage());
        }

        return ticketDir.resolve(storedName).toString();
    }

    /**
     * Delete a stored file. Silently ignores missing files.
     */
    public void delete(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException ignored) {
            // Log in production — don't fail the request over orphaned file
        }
    }

    public String extractFileName(String filePath) {
        return Paths.get(filePath).getFileName().toString();
    }
}
