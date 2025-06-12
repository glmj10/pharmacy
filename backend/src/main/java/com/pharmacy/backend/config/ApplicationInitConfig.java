package com.pharmacy.backend.config;

import com.pharmacy.backend.entity.Role;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.enums.RoleCodeEnum;
import com.pharmacy.backend.repository.RoleRepository;
import com.pharmacy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    @Bean
    ApplicationRunner applicationRunner(UserRepository repository) {
        return args -> {
            String email = "admin@gmail.com";
            String password = "admin123";
            if(!repository.existsByEmail(email)) {
                User user = new User();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(password));
                Role role = roleRepository.findByCode(RoleCodeEnum.ADMIN)
                        .orElseThrow(() -> new RuntimeException("Admin role not found"));
                user.getRoles().add(role);
                repository.save(user);
            }
            System.out.println("Application has started successfully!");
        };
    }
}
