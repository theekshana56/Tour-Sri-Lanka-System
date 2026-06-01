package com.tsl.dto.response;

import java.time.LocalDate;

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
public class PublicBookingTrackResponse {
    private String bookingNumber;
    private BookingStatus status;
    private String customerName;
    private String fromDistrict;
    private String toDistrict;
    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;
    private int passengerCount;
    private VehicleType vehicleType;
    private String assignedDriverName;
    private String vehicleName;
    private String pdfUrl;
    private String rejectionReason;

    public static PublicBookingTrackResponse from(Booking booking) {
        return PublicBookingTrackResponse.builder()
                .bookingNumber(booking.getBookingNumber())
                .status(booking.getStatus())
                .customerName(booking.getCustomerName())
                .fromDistrict(booking.getFromDistrict())
                .toDistrict(booking.getToDistrict())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .numberOfDays(booking.getNumberOfDays())
                .passengerCount(booking.getPassengerCount())
                .vehicleType(booking.getVehicleType())
                .assignedDriverName(booking.getAssignedDriverName())
                .vehicleName(booking.getVehicleName())
                .pdfUrl(booking.getPdfUrl())
                .rejectionReason(booking.getRejectionReason())
                .build();
    }
}
