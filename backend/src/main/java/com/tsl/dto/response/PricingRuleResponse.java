package com.tsl.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.tsl.model.PricingRule;
import com.tsl.model.VehicleType;
import com.tsl.model.ZoneMultiplier;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingRuleResponse {
    private String id;
    private VehicleType vehicleType;
    private BigDecimal basePricePerDayLKR;
    private BigDecimal pricePerExtraPassengerLKR;
    private List<ZoneMultiplier> zoneMultipliers;
    private double seasonalMultiplier;
    private boolean isActive;
    private String lastUpdatedByUserId;
    private LocalDateTime updatedAt;

    public static PricingRuleResponse from(PricingRule rule) {
        return PricingRuleResponse.builder()
                .id(rule.getId())
                .vehicleType(rule.getVehicleType())
                .basePricePerDayLKR(rule.getBasePricePerDayLKR())
                .pricePerExtraPassengerLKR(rule.getPricePerExtraPassengerLKR())
                .zoneMultipliers(rule.getZoneMultipliers())
                .seasonalMultiplier(rule.getSeasonalMultiplier())
                .isActive(rule.isActive())
                .lastUpdatedByUserId(rule.getLastUpdatedByUserId())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }
}
