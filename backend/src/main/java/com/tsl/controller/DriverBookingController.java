package com.tsl.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.response.DriverBookingResponse;
import com.tsl.service.BookingService;
import com.tsl.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/driver/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DRIVER')")
public class DriverBookingController {

    private final BookingService bookingService;

    @GetMapping
    public Page<DriverBookingResponse> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        return bookingService.getDriverBookings(authentication.getName(), page, size);
    }

    @GetMapping("/today")
    public List<DriverBookingResponse> getTodayBookings(Authentication authentication) {
        return bookingService.getDriverBookingsToday(authentication.getName());
    }

    @PutMapping("/{id}/complete")
    public DriverBookingResponse complete(
            @PathVariable String id,
            Authentication authentication) {
        return bookingService.completeDriverBooking(id, authentication.getName());
    }
}
