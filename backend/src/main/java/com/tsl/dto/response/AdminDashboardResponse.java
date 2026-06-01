package com.tsl.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private AdminDashboardStatsResponse stats;
    private List<BookingResponse> pendingQueue;
    private List<BookingResponse> recentActivity;
}
