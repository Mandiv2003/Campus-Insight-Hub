package com.smartcampus.service;

import com.smartcampus.config.AppProperties;
import com.smartcampus.exception.ConflictException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L;        // 5 MB
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png");

    private final AppProperties appProperties;

    /**
     * Validates and stores an attachment. Returns the stored relative file path.
     *
     * @param file     multipart file from the request
     * @param ticketId ID of the ticket this attachment belongs to
     * @return path: {uploadDir}/tickets/{ticketId}/{uuid}_{filename}
     */
    public String store(MultipartFile file, String ticketId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum allowed size of 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG and PNG images are allowed");
        }

        String originalName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                : "attachment";
        String storedName = UUID.randomUUID() + "_" + originalName;

        Path ticketDir = Paths.get(appProperties.uploadDir(), "tickets", ticketId);
        try {
            Files.createDirectories(ticketDir);
            file.transferTo(ticketDir.resolve(storedName).toFile());
        } catch (IOException e) {
            throw new ConflictException("Could not store file: " + e.getMessage());
        }

        return ticketDir.resolve(storedName).toString();
    }

    /**
     * Deletes a stored file. Silently ignores missing files so a missing
     * file never fails the calling request.
     */
    public void delete(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException ignored) {
            // Log in production — do not fail the request over an orphaned file
        }
    }

    public String extractFileName(String filePath) {
        return Paths.get(filePath).getFileName().toString();
    }
}
