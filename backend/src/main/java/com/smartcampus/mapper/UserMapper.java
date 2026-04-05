package com.smartcampus.mapper;

import com.smartcampus.dto.user.UserDto;
import com.smartcampus.model.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User user);

    List<UserDto> toDtoList(List<User> users);
}
