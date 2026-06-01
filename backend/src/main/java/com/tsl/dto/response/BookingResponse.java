package com.tsl.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String bookingNumber;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerWhatsapp;
    private List<String> selectedPlaceIds;
    private List<String> selectedPlaceNames;
    private String fromDistrict;
    private String toDistrict;
    private String pickupLocation;
    private String dropLocation;
    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;
    private int passengerCount;
    private VehicleType vehicleType;
    private String vehicleId;
    private String vehicleName;
    private String assignedDriverId;
    private String assignedDriverName;
    private String assignedDriverPhone;
    private BookingStatus status;
    private String rejectionReason;
    private BigDecimal totalPriceLKR;
    private BigDecimal totalPriceForeign;
    private String preferredCurrency;
    private BigDecimal exchangeRateUsed;
    private String pdfUrl;
    private String customerNotes;
    private String reviewedByUserId;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingResponse from(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .customerId(booking.getCustomerId())
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                .customerWhatsapp(booking.getCustomerWhatsapp())
                .selectedPlaceIds(booking.getSelectedPlaceIds())
                .selectedPlaceNames(booking.getSelectedPlaceNames())
                .fromDistrict(booking.getFromDistrict())
                .toDistrict(booking.getToDistrict())
                .pickupLocation(booking.getPickupLocation())
                .dropLocation(booking.getDropLocation())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .numberOfDays(booking.getNumberOfDays())
                .passengerCount(booking.getPassengerCount())
                .vehicleType(booking.getVehicleType())
                .vehicleId(booking.getVehicleId())
                .vehicleName(booking.getVehicleName())
                .assignedDriverId(booking.getAssignedDriverId())
                .assignedDriverName(booking.getAssignedDriverName())
                .assignedDriverPhone(booking.getAssignedDriverPhone())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .totalPriceLKR(booking.getTotalPriceLKR())
                .totalPriceForeign(booking.getTotalPriceForeign())
                .preferredCurrency(booking.getPreferredCurrency())
                .exchangeRateUsed(booking.getExchangeRateUsed())
                .pdfUrl(booking.getPdfUrl())
                .customerNotes(booking.getCustomerNotes())
                .reviewedByUserId(booking.getReviewedByUserId())
                .reviewedByName(booking.getReviewedByName())
                .reviewedAt(booking.getReviewedAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
