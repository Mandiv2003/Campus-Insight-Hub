package com.smartcampus;

import com.smartcampus.dto.resource.AvailabilityWindowDto;
import com.smartcampus.dto.resource.ResourceRequestDto;
import com.smartcampus.dto.resource.ResourceResponseDto;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.model.enums.Role;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.ResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ResourceServiceTest {

    @Autowired ResourceService resourceService;
    @Autowired ResourceRepository resourceRepository;
    @Autowired UserRepository userRepository;

    private User createAdmin(String email, String sub) {
        return userRepository.save(User.builder()
            .email(email).fullName("Admin User").providerId(sub)
            .provider("google").role(Role.ADMIN).active(true).build());
    }

    private ResourceRequestDto basicDto(String name, ResourceType type) {
        return new ResourceRequestDto(name, type, 30, "Block A", null, null, null);
    }

    @Test
    void createResourcePersistsToDatabase() {
        User admin = createAdmin("admin1@test.com", "sub-r1");
        ResourceResponseDto result = resourceService.create(
            new ResourceRequestDto("Main Lab", ResourceType.LAB, 40, "Block A",
                "Primary lab", null, null),
            admin.getId()
        );

        assertThat(result.id()).isNotNull();
        assertThat(result.name()).isEqualTo("Main Lab");
        assertThat(result.type()).isEqualTo(ResourceType.LAB);
        assertThat(result.status()).isEqualTo(ResourceStatus.ACTIVE);
        assertThat(result.capacity()).isEqualTo(40);
    }

    @Test
    void createResourceWithAvailabilityWindowsPersistsWindows() {
        User admin = createAdmin("admin2@test.com", "sub-r2");
        List<AvailabilityWindowDto> windows = List.of(
            new AvailabilityWindowDto(null, DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(17, 0)),
            new AvailabilityWindowDto(null, DayOfWeek.TUESDAY, LocalTime.of(9, 0), LocalTime.of(18, 0))
        );
        ResourceRequestDto dto = new ResourceRequestDto(
            "Conference Room", ResourceType.MEETING_ROOM, 20, "Block B",
            null, null, windows
        );

        ResourceResponseDto result = resourceService.create(dto, admin.getId());

        assertThat(result.availabilityWindows()).hasSize(2);
    }

    @Test
    void updateStatusChangesStatusCorrectly() {
        User admin = createAdmin("admin3@test.com", "sub-r3");
        ResourceResponseDto created = resourceService.create(basicDto("Hall 1", ResourceType.LECTURE_HALL), admin.getId());

        ResourceResponseDto updated = resourceService.updateStatus(created.id(), ResourceStatus.MAINTENANCE);

        assertThat(updated.status()).isEqualTo(ResourceStatus.MAINTENANCE);
    }

    @Test
    void deleteResourceSetsStatusToArchived() {
        User admin = createAdmin("admin4@test.com", "sub-r4");
        ResourceResponseDto created = resourceService.create(
            new ResourceRequestDto("Old Equipment", ResourceType.EQUIPMENT, null, "Storeroom",
                null, null, null),
            admin.getId()
        );

        resourceService.delete(created.id());

        Resource persisted = resourceRepository.findById(created.id()).orElseThrow();
        assertThat(persisted.getStatus()).isEqualTo(ResourceStatus.ARCHIVED);
    }

    @Test
    void getByIdThrowsNotFoundForMissingResource() {
        assertThatThrownBy(() -> resourceService.getById(UUID.randomUUID().toString()))
            .isInstanceOf(com.smartcampus.exception.ResourceNotFoundException.class);
    }

    @Test
    void listResourcesExcludesArchivedByDefault() {
        User admin = createAdmin("admin5@test.com", "sub-r5");

        resourceService.create(basicDto("Active Lab", ResourceType.LAB), admin.getId());

        ResourceResponseDto toArchive = resourceService.create(
            basicDto("Archived Lab", ResourceType.LAB), admin.getId()
        );
        resourceService.delete(toArchive.id());

        Page<ResourceResponseDto> page = resourceService.listResources(
            null, null, null, null, PageRequest.of(0, 100)
        );

        assertThat(page.getContent()).noneMatch(r -> r.status() == ResourceStatus.ARCHIVED);
        assertThat(page.getContent()).anyMatch(r -> r.name().equals("Active Lab"));
    }

    @Test
    void addAvailabilityWindowAddsToExistingResource() {
        User admin = createAdmin("admin6@test.com", "sub-r6");
        ResourceResponseDto created = resourceService.create(
            basicDto("Meeting Room A", ResourceType.MEETING_ROOM), admin.getId()
        );

        AvailabilityWindowDto dto = new AvailabilityWindowDto(
            null, DayOfWeek.WEDNESDAY, LocalTime.of(10, 0), LocalTime.of(16, 0)
        );
        AvailabilityWindowDto result = resourceService.addAvailabilityWindow(created.id(), dto);

        assertThat(result.id()).isNotNull();
        assertThat(result.dayOfWeek()).isEqualTo(DayOfWeek.WEDNESDAY);
    }
}
