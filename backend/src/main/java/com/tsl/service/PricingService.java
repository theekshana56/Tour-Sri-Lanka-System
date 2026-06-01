package com.tsl.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tsl.dto.request.UpdateExchangeRatesRequest;
import com.tsl.dto.request.UpdatePricingRuleRequest;
import com.tsl.dto.response.CurrencyInfoResponse;
import com.tsl.dto.response.ExchangeRateResponse;
import com.tsl.dto.response.PriceQuoteBreakdown;
import com.tsl.dto.response.PriceQuoteResponse;
import com.tsl.dto.response.PricingRuleResponse;
import com.tsl.exception.BadRequestException;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.model.ExchangeRate;
import com.tsl.model.PricingRule;
import com.tsl.model.VehicleType;
import com.tsl.model.ZoneMultiplier;
import com.tsl.repository.ExchangeRateRepository;
import com.tsl.repository.PricingRuleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PricingService {

    private static final String EXCHANGE_RATE_ID = "main";

    private final PricingRuleRepository pricingRuleRepository;
    private final ExchangeRateRepository exchangeRateRepository;

    public PriceQuoteResponse calculatePrice(
            String vehicleType,
            String fromDistrict,
            String toDistrict,
            int numberOfDays,
            int passengers,
            String preferredCurrency) {

        if (numberOfDays < 1) {
            throw new BadRequestException("Number of days must be at least 1");
        }
        if (passengers < 1) {
            throw new BadRequestException("Passenger count must be at least 1");
        }

        VehicleType type = VehicleType.valueOf(vehicleType.toUpperCase());
        PricingRule rule = pricingRuleRepository.findByVehicleTypeAndIsActiveTrue(type)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active pricing rule for vehicle type: " + vehicleType));

        BigDecimal baseCost = rule.getBasePricePerDayLKR()
                .multiply(BigDecimal.valueOf(numberOfDays));

        int extraPassengers = Math.max(0, passengers - 1);
        BigDecimal passengerExtra = rule.getPricePerExtraPassengerLKR()
                .multiply(BigDecimal.valueOf(extraPassengers))
                .multiply(BigDecimal.valueOf(numberOfDays));

        double zoneMultiplier = resolveZoneMultiplier(rule, fromDistrict, toDistrict);

        BigDecimal subtotal = baseCost.add(passengerExtra)
                .multiply(BigDecimal.valueOf(zoneMultiplier));

        BigDecimal totalLKR = subtotal
                .multiply(BigDecimal.valueOf(rule.getSeasonalMultiplier()))
                .setScale(2, RoundingMode.HALF_UP);

        ExchangeRate exchangeRate = getExchangeRateDocument();
        String currency = preferredCurrency.toUpperCase();
        BigDecimal rate = exchangeRate.getRates().get(currency);
        if (rate == null) {
            throw new BadRequestException("Unsupported currency: " + preferredCurrency);
        }

        BigDecimal totalForeign = totalLKR.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        return PriceQuoteResponse.builder()
                .vehicleType(type)
                .fromDistrict(fromDistrict)
                .toDistrict(toDistrict)
                .numberOfDays(numberOfDays)
                .passengers(passengers)
                .totalLKR(totalLKR)
                .totalForeignCurrency(totalForeign)
                .preferredCurrency(currency)
                .exchangeRateUsed(rate)
                .breakdown(PriceQuoteBreakdown.builder()
                        .baseCost(baseCost.setScale(2, RoundingMode.HALF_UP))
                        .passengerExtra(passengerExtra.setScale(2, RoundingMode.HALF_UP))
                        .zoneMultiplier(zoneMultiplier)
                        .seasonalMultiplier(rule.getSeasonalMultiplier())
                        .build())
                .build();
    }

    public List<CurrencyInfoResponse> getSupportedCurrencies() {
        return List.of(
                currency("USD", "US Dollar", "$"),
                currency("EUR", "Euro", "€"),
                currency("GBP", "British Pound", "£"),
                currency("AUD", "Australian Dollar", "A$"),
                currency("JPY", "Japanese Yen", "¥"),
                currency("INR", "Indian Rupee", "₹"),
                currency("CAD", "Canadian Dollar", "C$"),
                currency("SGD", "Singapore Dollar", "S$"),
                currency("CNY", "Chinese Yuan", "¥"),
                currency("AED", "UAE Dirham", "د.إ"),
                currency("CHF", "Swiss Franc", "CHF"),
                currency("KRW", "South Korean Won", "₩"));
    }

    public List<PricingRuleResponse> getAllPricingRules() {
        return pricingRuleRepository.findByIsActiveTrue().stream()
                .map(PricingRuleResponse::from)
                .toList();
    }

    public PricingRuleResponse updatePricingRule(String id, UpdatePricingRuleRequest request, String userId) {
        PricingRule rule = pricingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing rule not found"));

        rule.setBasePricePerDayLKR(request.getBasePricePerDayLKR());
        rule.setPricePerExtraPassengerLKR(request.getPricePerExtraPassengerLKR());
        if (request.getZoneMultipliers() != null) {
            rule.setZoneMultipliers(request.getZoneMultipliers());
        }
        rule.setSeasonalMultiplier(request.getSeasonalMultiplier());
        rule.setLastUpdatedByUserId(userId);

        return PricingRuleResponse.from(pricingRuleRepository.save(rule));
    }

    public ExchangeRateResponse getExchangeRates() {
        return ExchangeRateResponse.from(getExchangeRateDocument());
    }

    public ExchangeRateResponse updateExchangeRates(UpdateExchangeRatesRequest request, String userId) {
        ExchangeRate exchangeRate = getExchangeRateDocument();
        exchangeRate.setRates(request.getRates());
        exchangeRate.setLastUpdated(LocalDateTime.now());
        exchangeRate.setUpdatedByUserId(userId);
        return ExchangeRateResponse.from(exchangeRateRepository.save(exchangeRate));
    }

    private ExchangeRate getExchangeRateDocument() {
        return exchangeRateRepository.findById(EXCHANGE_RATE_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange rates not configured"));
    }

    private double resolveZoneMultiplier(PricingRule rule, String fromDistrict, String toDistrict) {
        if (rule.getZoneMultipliers() == null) {
            return 1.0;
        }
        for (ZoneMultiplier zone : rule.getZoneMultipliers()) {
            if (matchesZone(zone, fromDistrict, toDistrict)) {
                return zone.getMultiplier();
            }
        }
        return 1.0;
    }

    private boolean matchesZone(ZoneMultiplier zone, String fromDistrict, String toDistrict) {
        return (zone.getFromDistrict().equalsIgnoreCase(fromDistrict)
                && zone.getToDistrict().equalsIgnoreCase(toDistrict))
                || (zone.getFromDistrict().equalsIgnoreCase(toDistrict)
                        && zone.getToDistrict().equalsIgnoreCase(fromDistrict));
    }

    private CurrencyInfoResponse currency(String code, String name, String symbol) {
        return CurrencyInfoResponse.builder().code(code).name(name).symbol(symbol).build();
    }
}
