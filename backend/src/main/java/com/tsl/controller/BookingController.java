package com.tsl.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.CreateBookingRequest;
import com.tsl.dto.response.BookingResponse;
import com.tsl.dto.response.PublicBookingTrackResponse;
import com.tsl.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public BookingResponse create(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {
        String customerId = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : null;
        return bookingService.createBooking(request, customerId);
    }

    @GetMapping("/number/{bookingNumber}")
    public PublicBookingTrackResponse track(@PathVariable String bookingNumber) {
        return bookingService.getByBookingNumber(bookingNumber);
    }
}
