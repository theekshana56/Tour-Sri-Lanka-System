package com.tsl.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import com.tsl.model.ExchangeRate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateResponse {
    private String id;
    private String baseCurrency;
    private Map<String, BigDecimal> rates;
    private LocalDateTime lastUpdated;
    private String updatedByUserId;

    public static ExchangeRateResponse from(ExchangeRate exchangeRate) {
        return ExchangeRateResponse.builder()
                .id(exchangeRate.getId())
                .baseCurrency(exchangeRate.getBaseCurrency())
                .rates(exchangeRate.getRates())
                .lastUpdated(exchangeRate.getLastUpdated())
                .updatedByUserId(exchangeRate.getUpdatedByUserId())
                .build();
    }
}
