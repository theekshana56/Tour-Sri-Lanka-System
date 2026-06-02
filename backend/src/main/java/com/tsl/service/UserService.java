package com.tsl.service;

import java.io.IOException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tsl.dto.request.AdminCreateUserRequest;
import com.tsl.dto.request.AdminUpdateUserRequest;
import com.tsl.dto.request.UpdateProfileRequest;
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
    private final CloudinaryService cloudinaryService;

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

    public User updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone().trim());
        user.setPreferredCurrency(request.getPreferredCurrency().toUpperCase());
        if (request.getIsAvailable() != null && user.getRole() == Role.DRIVER) {
            user.setAvailable(request.getIsAvailable());
        }
        return userRepository.save(user);
    }

    public User updateProfileImage(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select an image to upload");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        try {
            if (user.getProfileImageUrl() != null) {
                String publicId = cloudinaryService.extractPublicId(user.getProfileImageUrl());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            }
            String imageUrl = cloudinaryService.uploadImage(file, "tsl/profiles");
            user.setProfileImageUrl(imageUrl);
            return userRepository.save(user);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to upload profile image");
        } catch (IllegalArgumentException | IllegalStateException ex) {
            throw new BadRequestException(ex.getMessage());
        }
    }
}
