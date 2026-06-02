package com.tsl.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.VehicleType;

import lombok.Builder;
import lombok.Data;

/**
 * Driver-facing booking view — excludes customer email and WhatsApp so trips stay on-platform.
 */
@Data
@Builder
public class DriverBookingResponse {
    private String id;
    private String bookingNumber;
    private String customerName;
    private List<String> selectedPlaceIds;
    private List<String> selectedPlaceNames;
    private String fromDistrict;
    private String toDistrict;
    private String pickupLocation;
    private String dropLocation;
    private LocalTime pickupTime;
    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;
    private int passengerCount;
    private VehicleType vehicleType;
    private String vehicleId;
    private String vehicleName;
    private String assignedDriverId;
    private String assignedDriverName;
    private BookingStatus status;
    private BigDecimal totalPriceLKR;
    private String customerNotes;
    private LocalDateTime createdAt;
    /** Secure in-app chat for this trip */
    private String conversationId;

    public static DriverBookingResponse from(Booking booking, String conversationId) {
        return DriverBookingResponse.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .customerName(booking.getCustomerName())
                .selectedPlaceIds(booking.getSelectedPlaceIds())
                .selectedPlaceNames(booking.getSelectedPlaceNames())
                .fromDistrict(booking.getFromDistrict())
                .toDistrict(booking.getToDistrict())
                .pickupLocation(booking.getPickupLocation())
                .dropLocation(booking.getDropLocation())
                .pickupTime(booking.getPickupTime())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .numberOfDays(booking.getNumberOfDays())
                .passengerCount(booking.getPassengerCount())
                .vehicleType(booking.getVehicleType())
                .vehicleId(booking.getVehicleId())
                .vehicleName(booking.getVehicleName())
                .assignedDriverId(booking.getAssignedDriverId())
                .assignedDriverName(booking.getAssignedDriverName())
                .status(booking.getStatus())
                .totalPriceLKR(booking.getTotalPriceLKR())
                .customerNotes(booking.getCustomerNotes())
                .createdAt(booking.getCreatedAt())
                .conversationId(conversationId)
                .build();
    }
}
