package com.tsl.dto.response;

import com.tsl.model.Role;
import com.tsl.model.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String fullName;
    private String email;
    private Role role;
    private String phone;
    private String preferredCurrency;
    private String profileImageUrl;
    private Boolean isActive;
    private String licenseNumber;
    private String assignedVehicleId;
    private Boolean isAvailable;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .preferredCurrency(user.getPreferredCurrency())
                .profileImageUrl(user.getProfileImageUrl())
                .isActive(user.isActive())
                .licenseNumber(user.getLicenseNumber())
                .assignedVehicleId(user.getAssignedVehicleId())
                .isAvailable(user.isAvailable())
                .build();
    }
}
