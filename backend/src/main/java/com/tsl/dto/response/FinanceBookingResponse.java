package com.tsl.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
public class FinanceBookingResponse {
    private String id;
    private String bookingNumber;
    private String customerName;
    private String customerEmail;
    private String fromDistrict;
    private String toDistrict;
    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;
    private int passengerCount;
    private VehicleType vehicleType;
    private BookingStatus status;
    private BigDecimal totalPriceLKR;
    private BigDecimal totalPriceForeign;
    private String preferredCurrency;
    private LocalDateTime createdAt;

    public static FinanceBookingResponse from(Booking booking) {
        return FinanceBookingResponse.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                .fromDistrict(booking.getFromDistrict())
                .toDistrict(booking.getToDistrict())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .numberOfDays(booking.getNumberOfDays())
                .passengerCount(booking.getPassengerCount())
                .vehicleType(booking.getVehicleType())
                .status(booking.getStatus())
                .totalPriceLKR(booking.getTotalPriceLKR())
                .totalPriceForeign(booking.getTotalPriceForeign())
                .preferredCurrency(booking.getPreferredCurrency())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
