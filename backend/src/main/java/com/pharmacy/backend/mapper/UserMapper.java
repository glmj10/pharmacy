package com.pharmacy.backend.mapper;

import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.dto.response.UserResponse;
import com.pharmacy.backend.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toUser (UserRequest request);

    UserResponse toUserResponse(User user);
}
