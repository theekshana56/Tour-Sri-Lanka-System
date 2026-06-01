package com.tsl.dto.request;

import com.tsl.model.Role;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateUserRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    private String phone;

    private Role role;
    private String profileImageUrl;
    private String licenseNumber;
    private String assignedVehicleId;
    private Boolean isAvailable;
}
