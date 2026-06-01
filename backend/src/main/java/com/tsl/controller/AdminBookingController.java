package com.tsl.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.ApproveBookingRequest;
import com.tsl.dto.request.RejectBookingRequest;
import com.tsl.dto.response.BookingResponse;
import com.tsl.model.BookingStatus;
import com.tsl.service.BookingService;
import com.tsl.util.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    public Page<BookingResponse> list(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String reviewedBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (reviewedBy != null && !reviewedBy.isBlank()) {
            return bookingService.getBookingsReviewedBy(reviewedBy, page, size);
        }
        return bookingService.getAdminBookings(status, search, page, size);
    }

    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable String id) {
        return bookingService.getById(id);
    }

    @PutMapping("/{id}/approve")
    public BookingResponse approve(
            @PathVariable String id,
            @Valid @RequestBody ApproveBookingRequest request,
            Authentication authentication) {
        return bookingService.approveBooking(id, request, authentication.getName());
    }

    @PutMapping("/{id}/reject")
    public BookingResponse reject(
            @PathVariable String id,
            @Valid @RequestBody RejectBookingRequest request,
            Authentication authentication) {
        return bookingService.rejectBooking(id, request, authentication.getName());
    }

    @PutMapping("/{id}/complete")
    public BookingResponse complete(
            @PathVariable String id,
            Authentication authentication) {
        return bookingService.completeBooking(
                id,
                authentication.getName(),
                SecurityUtils.extractRole(authentication));
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
