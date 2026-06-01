package com.tsl.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long pendingBookings;
    private long todaysBookings;
    private BigDecimal thisMonthRevenueLKR;
    private long activeDrivers;
}
