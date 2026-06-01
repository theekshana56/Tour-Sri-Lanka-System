package com.tsl.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayAvailabilityResponse {
    private int availableDrivers;
    private int availableVehicles;
    private boolean isAvailable;
}
