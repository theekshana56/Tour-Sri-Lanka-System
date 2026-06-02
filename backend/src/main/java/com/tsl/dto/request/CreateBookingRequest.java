package com.tsl.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.tsl.model.VehicleType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotBlank
    private String customerName;

    @NotBlank
    @Email
    private String customerEmail;

    @NotBlank
    private String customerWhatsapp;

    @NotEmpty
    private List<String> selectedPlaceIds;

    @NotBlank
    private String fromDistrict;

    @NotBlank
    private String toDistrict;

    @NotBlank
    private String pickupLocation;

    @NotBlank
    private String dropLocation;

    @NotNull
    private LocalTime pickupTime;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Min(1)
    private int passengerCount;

    @NotNull
    private VehicleType vehicleType;

    @NotBlank
    private String preferredCurrency;

    private String customerNotes;
}
