package com.pharmacy.backend.mapper;

import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "profilePicUrl", ignore = true)
    @Mapping(target = "fileMetaDataList", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "profiles", ignore = true)
    User toUser (UserRequest request);

    UserResponse toUserResponse(User user);
}
