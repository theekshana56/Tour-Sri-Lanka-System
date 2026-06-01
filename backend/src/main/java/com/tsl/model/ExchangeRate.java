package com.tsl.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "exchange_rates")
public class ExchangeRate {

    @Id
    private String id;

    @Builder.Default
    private String baseCurrency = "LKR";

    @Builder.Default
    private Map<String, BigDecimal> rates = new HashMap<>();

    private LocalDateTime lastUpdated;
    private String updatedByUserId;
}
