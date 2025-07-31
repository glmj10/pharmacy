package com.pharmacy.backend.config;

import com.pharmacy.backend.dto.request.UserRequest;
import com.pharmacy.backend.entity.FileMetadata;
import com.pharmacy.backend.entity.Role;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.enums.FileCategoryEnum;
import com.pharmacy.backend.enums.RoleCodeEnum;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.UserMapper;
import com.pharmacy.backend.repository.FileMetadataRepository;
import com.pharmacy.backend.repository.RoleRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.service.AuthService;
import com.pharmacy.backend.service.FileMetadataService;
import com.pharmacy.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final UserMapper userMapper;
    @Value("${account.default.email}")
    private String email;
    @Value("${account.default.password}")
    private String password;
    @Bean
    ApplicationRunner applicationRunner(UserRepository repository, AuthService authService) {
        return args -> {
            if(userRepository.count() == 0) {
                for(int i = 0; i < 40; i++ ) {
                    Faker faker = new Faker();
                    UserRequest request = new UserRequest();
                    request.setEmail(faker.internet().emailAddress());
                    request.setUsername(faker.name().fullName());
                    request.setPassword("123456");
                    request.setConfirmPassword(request.getPassword());
                    authService.register(request);
                }
            }

            if(!repository.existsByEmail(email)) {
                User user = new User();
                user.setUsername("Admin");
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(password));
                Role role = roleRepository.findByCode(RoleCodeEnum.ADMIN)
                        .orElseThrow(() -> new RuntimeException("Admin role not found"));
                user.getRoles().add(role);
                FileMetadata fileMetadata = FileMetadata.builder()
                        .originalFileName("default-avatar.jpg")
                        .storedFileName("default-avatar.jpg")
                        .fileExtension("jpg")
                        .fileSize(0L)
                        .contentType("image/jpeg")
                        .fileType(FileCategoryEnum.AVATAR.name())
                        .build();

                fileMetadata = fileMetadataRepository.save(fileMetadata);
                user.setProfilePic(fileMetadata.getUuid().toString());
                repository.save(user);
            }


            System.out.println("Application has started successfully!");
        };
    }
}
