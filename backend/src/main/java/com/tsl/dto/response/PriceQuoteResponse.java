package com.tsl.dto.response;

import java.math.BigDecimal;

import com.tsl.model.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceQuoteResponse {
    private VehicleType vehicleType;
    private String fromDistrict;
    private String toDistrict;
    private int numberOfDays;
    private int passengers;
    private BigDecimal totalLKR;
    private BigDecimal totalForeignCurrency;
    private String preferredCurrency;
    private BigDecimal exchangeRateUsed;
    private PriceQuoteBreakdown breakdown;
}
