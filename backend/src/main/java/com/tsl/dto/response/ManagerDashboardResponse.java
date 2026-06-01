package com.tsl.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.tsl.dto.response.BookingResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDashboardResponse {
    private ManagerDashboardStatsResponse stats;
    private List<BookingResponse> pendingQueue;
}

