package com.tsl.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingNumber;

    @Indexed
    private String customerId;

    private String customerName;
    private String customerEmail;
    private String customerWhatsapp;

    @Builder.Default
    private List<String> selectedPlaceIds = new ArrayList<>();

    @Builder.Default
    private List<String> selectedPlaceNames = new ArrayList<>();

    private String fromDistrict;
    private String toDistrict;
    private String pickupLocation;
    private String dropLocation;

    @Indexed
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

    @Indexed
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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
