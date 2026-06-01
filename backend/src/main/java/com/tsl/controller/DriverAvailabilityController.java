package com.tsl.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.BlockDateRequest;
import com.tsl.dto.response.BlockedDatesResponse;
import com.tsl.service.AvailabilityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/driver/availability")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DRIVER')")
public class DriverAvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public BlockedDatesResponse getMyBlockedDates(Authentication authentication) {
        return availabilityService.getDriverBlockedDates(authentication.getName());
    }

    @PostMapping("/block")
    public BlockedDatesResponse blockDate(
            @Valid @RequestBody BlockDateRequest request,
            Authentication authentication) {
        return availabilityService.blockDriverDate(authentication.getName(), request.getDate());
    }

    @DeleteMapping("/unblock")
    public BlockedDatesResponse unblockDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        return availabilityService.unblockDriverDate(authentication.getName(), date);
    }
}
