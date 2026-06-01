package com.tsl.dto.request;

import com.tsl.model.VehicleType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVehicleRequest {
    @NotBlank
    private String name;

    @NotNull
    private VehicleType type;

    @Positive
    private int capacity;

    private String description;

    @NotBlank
    private String registrationNumber;

    private String assignedDriverId;
}
