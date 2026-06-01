package com.tsl.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryResponse {
    private BigDecimal totalRevenueLKR;
    private long totalBookings;
    private BigDecimal avgBookingValueLKR;
    private List<MonthlyRevenueResponse> revenueByMonth;
    private List<VehicleTypeRevenueResponse> revenueByVehicleType;
    private List<TopRouteResponse> topRoutes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueResponse {
        private String month;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleTypeRevenueResponse {
        private String type;
        private BigDecimal revenue;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopRouteResponse {
        private String from;
        private String to;
        private long count;
        private BigDecimal revenue;
    }
}
