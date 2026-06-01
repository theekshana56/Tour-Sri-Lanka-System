package com.tsl.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.UpdateExchangeRatesRequest;
import com.tsl.dto.request.UpdatePricingRuleRequest;
import com.tsl.dto.response.ExchangeRateResponse;
import com.tsl.dto.response.FinanceBookingResponse;
import com.tsl.dto.response.PricingRuleResponse;
import com.tsl.dto.response.RevenueSummaryResponse;
import com.tsl.model.BookingStatus;
import com.tsl.service.FinanceService;
import com.tsl.service.PricingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FINANCE_MANAGER')")
public class FinanceController {

    private final PricingService pricingService;
    private final FinanceService financeService;

    @GetMapping("/pricing-rules")
    public List<PricingRuleResponse> getPricingRules() {
        return pricingService.getAllPricingRules();
    }

    @PutMapping("/pricing-rules/{id}")
    public PricingRuleResponse updatePricingRule(
            @PathVariable String id,
            @Valid @RequestBody UpdatePricingRuleRequest request,
            Authentication authentication) {
        return pricingService.updatePricingRule(id, request, authentication.getName());
    }

    @GetMapping("/exchange-rates")
    public ExchangeRateResponse getExchangeRates() {
        return pricingService.getExchangeRates();
    }

    @PutMapping("/exchange-rates")
    public ExchangeRateResponse updateExchangeRates(
            @Valid @RequestBody UpdateExchangeRatesRequest request,
            Authentication authentication) {
        return pricingService.updateExchangeRates(request, authentication.getName());
    }

    @GetMapping("/revenue-summary")
    public RevenueSummaryResponse getRevenueSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return financeService.getRevenueSummary(from, to);
    }

    @GetMapping("/bookings")
    public Page<FinanceBookingResponse> getBookings(
            @RequestParam(defaultValue = "APPROVED") BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return financeService.getBookings(status, page, size);
    }
}
