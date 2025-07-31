package com.pharmacy.backend.mapper;

import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.User;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "profiles", ignore = true)
    @Mapping(target = "profilePic", ignore = true)
    @Mapping(target = "tokenVersion", ignore = true)
    @Mapping(target = "roles", ignore = true)
     User toUser(UserRequest request);

    @Mapping(target = "profilePic", ignore = true)
    UserResponse toUserResponse(User user);

}
