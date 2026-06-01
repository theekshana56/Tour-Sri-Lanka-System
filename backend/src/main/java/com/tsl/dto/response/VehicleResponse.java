package com.tsl.dto.response;

import java.time.LocalDateTime;

import com.tsl.model.Vehicle;
import com.tsl.model.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private String id;
    private String name;
    private VehicleType type;
    private int capacity;
    private String description;
    private String imageUrl;
    private String registrationNumber;
    private String assignedDriverId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VehicleResponse from(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .name(vehicle.getName())
                .type(vehicle.getType())
                .capacity(vehicle.getCapacity())
                .description(vehicle.getDescription())
                .imageUrl(vehicle.getImageUrl())
                .registrationNumber(vehicle.getRegistrationNumber())
                .assignedDriverId(vehicle.getAssignedDriverId())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
