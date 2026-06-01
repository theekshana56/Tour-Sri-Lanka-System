package com.tsl.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tsl.dto.request.AdminCreateUserRequest;
import com.tsl.dto.request.AdminUpdateUserRequest;
import com.tsl.exception.BadRequestException;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.model.Role;
import com.tsl.model.User;
import com.tsl.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public User createAdminUser(AdminCreateUserRequest request) {
        if (request.getRole() == null || request.getRole() == Role.CUSTOMER) {
            throw new BadRequestException("Role must be ADMIN, MANAGER, FINANCE_MANAGER, or DRIVER");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getTemporaryPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .licenseNumber(request.getRole() == Role.DRIVER ? request.getLicenseNumber() : null)
                .isAvailable(request.getRole() == Role.DRIVER)
                .isActive(true)
                .build();
        user = userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName(), request.getTemporaryPassword());
        return user;
    }

    public Page<User> listUsers(Role role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (role != null) {
            return userRepository.findByRole(role, pageable);
        }
        return userRepository.findAll(pageable);
    }

    public User updateUser(String id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setLicenseNumber(request.getLicenseNumber());
        user.setAssignedVehicleId(request.getAssignedVehicleId());
        if (request.getIsAvailable() != null) {
            user.setAvailable(request.getIsAvailable());
        }
        return userRepository.save(user);
    }

    public User toggleStatus(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }
}
