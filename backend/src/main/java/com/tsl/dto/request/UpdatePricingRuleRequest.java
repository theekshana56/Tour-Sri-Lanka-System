package com.tsl.dto.request;

import java.math.BigDecimal;
import java.util.List;

import com.tsl.model.ZoneMultiplier;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePricingRuleRequest {
    @NotNull
    private BigDecimal basePricePerDayLKR;

    @NotNull
    private BigDecimal pricePerExtraPassengerLKR;

    private List<ZoneMultiplier> zoneMultipliers;

    @Positive
    private double seasonalMultiplier;
}
