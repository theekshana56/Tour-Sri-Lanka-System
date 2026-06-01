package com.tsl.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.response.DayAvailabilityResponse;
import com.tsl.dto.response.DriverInfoResponse;
import com.tsl.dto.response.RangeAvailabilityResponse;
import com.tsl.dto.response.VehicleResponse;
import com.tsl.service.AvailabilityService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/calendar")
    public Map<String, DayAvailabilityResponse> getCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return availabilityService.getMonthlyCalendar(year, month);
    }

    @GetMapping("/check")
    public RangeAvailabilityResponse checkRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return availabilityService.checkRangeAvailability(from, to);
    }

    @GetMapping("/drivers")
    public List<DriverInfoResponse> getAvailableDrivers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return availabilityService.getAvailableDriversForDateRange(from, to);
    }

    @GetMapping("/vehicles")
    public List<VehicleResponse> getAvailableVehicles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "1") int minCapacity) {
        return availabilityService.getAvailableVehiclesForDateRange(from, to, minCapacity);
    }
}
