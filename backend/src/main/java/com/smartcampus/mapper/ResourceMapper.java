package com.smartcampus.mapper;

import com.smartcampus.dto.resource.AvailabilityWindowDto;
import com.smartcampus.dto.resource.ResourceResponseDto;
import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.Resource;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ResourceMapper {

    AvailabilityWindowDto toWindowDto(AvailabilityWindow window);

    List<AvailabilityWindowDto> toWindowDtoList(List<AvailabilityWindow> windows);

    // MapStruct maps availabilityWindows List<AvailabilityWindow> → List<AvailabilityWindowDto>
    // automatically because toWindowDto is defined in the same mapper.
    ResourceResponseDto toDto(Resource resource);
}
