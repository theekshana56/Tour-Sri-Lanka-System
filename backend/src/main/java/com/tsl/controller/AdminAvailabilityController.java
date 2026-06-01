package com.tsl.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.BlockDateRequest;
import com.tsl.dto.response.BlockedDatesResponse;
import com.tsl.dto.response.VehicleUnavailableDatesResponse;
import com.tsl.service.AvailabilityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/api/admin/drivers/{driverId}/availability")
    public BlockedDatesResponse getDriverAvailability(@PathVariable String driverId) {
        return availabilityService.getDriverBlockedDates(driverId);
    }

    @PostMapping("/api/admin/drivers/{driverId}/availability/block")
    public BlockedDatesResponse blockDriverDate(
            @PathVariable String driverId,
            @Valid @RequestBody BlockDateRequest request) {
        return availabilityService.blockDriverDate(driverId, request.getDate());
    }

    @DeleteMapping("/api/admin/drivers/{driverId}/availability/unblock")
    public BlockedDatesResponse unblockDriverDate(
            @PathVariable String driverId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return availabilityService.unblockDriverDate(driverId, date);
    }

    @PostMapping("/api/admin/vehicles/{vehicleId}/unavailability/block")
    public VehicleUnavailableDatesResponse blockVehicleDate(
            @PathVariable String vehicleId,
            @Valid @RequestBody BlockDateRequest request) {
        return availabilityService.blockVehicleDate(vehicleId, request.getDate());
    }

    @DeleteMapping("/api/admin/vehicles/{vehicleId}/unavailability/unblock")
    public VehicleUnavailableDatesResponse unblockVehicleDate(
            @PathVariable String vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return availabilityService.unblockVehicleDate(vehicleId, date);
    }
}
