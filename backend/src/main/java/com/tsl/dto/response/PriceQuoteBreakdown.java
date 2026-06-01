package com.tsl.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceQuoteBreakdown {
    private BigDecimal baseCost;
    private BigDecimal passengerExtra;
    private double zoneMultiplier;
    private double seasonalMultiplier;
}
