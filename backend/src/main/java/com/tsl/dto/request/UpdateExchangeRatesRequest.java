package com.tsl.dto.request;

import java.math.BigDecimal;
import java.util.Map;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExchangeRatesRequest {
    @NotEmpty
    private Map<String, BigDecimal> rates;
}
