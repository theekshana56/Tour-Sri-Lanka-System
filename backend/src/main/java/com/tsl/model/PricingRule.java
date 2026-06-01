package com.tsl.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
@Document(collection = "pricing_rules")
public class PricingRule {

    @Id
    private String id;

    @Indexed(unique = true)
    private VehicleType vehicleType;

    private BigDecimal basePricePerDayLKR;
    private BigDecimal pricePerExtraPassengerLKR;

    @Builder.Default
    private List<ZoneMultiplier> zoneMultipliers = new ArrayList<>();

    @Builder.Default
    private double seasonalMultiplier = 1.0;

    @Builder.Default
    private boolean isActive = true;

    private String lastUpdatedByUserId;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
