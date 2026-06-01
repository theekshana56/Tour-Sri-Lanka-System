package com.tsl.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.response.BookingResponse;
import com.tsl.model.BookingStatus;
import com.tsl.service.BookingService;
import com.tsl.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerBookingController {

    private final BookingService bookingService;

    @GetMapping("/my")
    public Page<BookingResponse> getMyBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return bookingService.getCustomerBookings(authentication.getName(), status, page, size);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancel(
            @PathVariable String id,
            Authentication authentication) {
        return bookingService.cancelBooking(
                id,
                authentication.getName(),
                SecurityUtils.extractRole(authentication));
    }
}
