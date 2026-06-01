package com.tsl.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RangeAvailabilityResponse {
    private boolean available;
    private int minAvailableDrivers;
    private int minAvailableVehicles;
    private List<LocalDate> blockedDays;
}
