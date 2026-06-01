package com.tsl.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.response.CurrencyInfoResponse;
import com.tsl.dto.response.PriceQuoteResponse;
import com.tsl.service.PricingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingService pricingService;

    @GetMapping("/quote")
    public PriceQuoteResponse getQuote(
            @RequestParam String vehicleType,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam int days,
            @RequestParam int passengers,
            @RequestParam(defaultValue = "USD") String currency) {
        return pricingService.calculatePrice(vehicleType, from, to, days, passengers, currency);
    }

    @GetMapping("/currencies")
    public List<CurrencyInfoResponse> getCurrencies() {
        return pricingService.getSupportedCurrencies();
    }
}
