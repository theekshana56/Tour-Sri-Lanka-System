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
public class ManagerDashboardStatsResponse {
    private long pendingBookings;
    private long approvedToday;
    private long rejectedThisWeek;
    private long totalReviewed;
}

