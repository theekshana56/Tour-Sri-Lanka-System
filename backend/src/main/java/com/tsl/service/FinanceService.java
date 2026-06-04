package com.tsl.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.tsl.dto.response.FinanceBookingResponse;
import com.tsl.dto.response.RevenueSummaryResponse;
import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.VehicleType;
import com.tsl.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final BookingRepository bookingRepository;
    private final MongoTemplate mongoTemplate;

    public RevenueSummaryResponse getRevenueSummary(LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(23, 59, 59);

        List<Booking> bookings = bookingRepository.findByStatusInAndCreatedAtBetween(
                List.of(BookingStatus.APPROVED, BookingStatus.COMPLETED),
                fromDateTime,
                toDateTime);

        BigDecimal totalRevenue = bookings.stream()
                .map(Booking::getTotalPriceLKR)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long count = bookings.size();
        BigDecimal avg = count == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        return RevenueSummaryResponse.builder()
                .totalRevenueLKR(totalRevenue)
                .totalBookings(count)
                .avgBookingValueLKR(avg)
                .revenueByMonth(buildMonthlyRevenue(bookings))
                .revenueByVehicleType(buildVehicleTypeRevenue(bookings))
                .topRoutes(buildTopRoutes(bookings))
                .build();
    }

    public Page<FinanceBookingResponse> getBookings(
            BookingStatus status,
            String vehicleType,
            String currency,
            LocalDate from,
            LocalDate to,
            int page,
            int size) {
        Query query = new Query();

        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (StringUtils.hasText(vehicleType)) {
            try {
                VehicleType type = VehicleType.valueOf(vehicleType.trim().toUpperCase());
                query.addCriteria(Criteria.where("vehicleType").is(type));
            } catch (IllegalArgumentException ignored) {}
        }
        if (StringUtils.hasText(currency)) {
            query.addCriteria(Criteria.where("preferredCurrency").regex("^" + currency.trim() + "$", "i"));
        }
        if (from != null && to != null) {
            LocalDateTime fromDateTime = from.atStartOfDay();
            LocalDateTime toDateTime = to.atTime(23, 59, 59);
            query.addCriteria(Criteria.where("createdAt").gte(fromDateTime).lte(toDateTime));
        } else if (from != null) {
            query.addCriteria(Criteria.where("createdAt").gte(from.atStartOfDay()));
        } else if (to != null) {
            query.addCriteria(Criteria.where("createdAt").lte(to.atTime(23, 59, 59)));
        }

        long total = mongoTemplate.count(query, Booking.class);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        query.with(pageable);
        List<Booking> bookings = mongoTemplate.find(query, Booking.class);

        List<FinanceBookingResponse> content = bookings.stream()
                .map(FinanceBookingResponse::from)
                .toList();

        return new PageImpl<>(content, pageable, total);
    }

    private List<RevenueSummaryResponse.MonthlyRevenueResponse> buildMonthlyRevenue(List<Booking> bookings) {
        Map<YearMonth, BigDecimal> monthly = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Booking booking : bookings) {
            if (booking.getCreatedAt() == null || booking.getTotalPriceLKR() == null) {
                continue;
            }
            YearMonth month = YearMonth.from(booking.getCreatedAt());
            monthly.merge(month, booking.getTotalPriceLKR(), BigDecimal::add);
        }

        return monthly.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> RevenueSummaryResponse.MonthlyRevenueResponse.builder()
                        .month(entry.getKey().format(formatter))
                        .revenue(entry.getValue())
                        .build())
                .toList();
    }

    private List<RevenueSummaryResponse.VehicleTypeRevenueResponse> buildVehicleTypeRevenue(
            List<Booking> bookings) {
        Map<String, List<Booking>> grouped = bookings.stream()
                .filter(b -> b.getVehicleType() != null)
                .collect(Collectors.groupingBy(b -> b.getVehicleType().name()));

        List<RevenueSummaryResponse.VehicleTypeRevenueResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<Booking>> entry : grouped.entrySet()) {
            BigDecimal revenue = entry.getValue().stream()
                    .map(Booking::getTotalPriceLKR)
                    .filter(price -> price != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(RevenueSummaryResponse.VehicleTypeRevenueResponse.builder()
                    .type(entry.getKey())
                    .revenue(revenue)
                    .count(entry.getValue().size())
                    .build());
        }
        return result;
    }

    private List<RevenueSummaryResponse.TopRouteResponse> buildTopRoutes(List<Booking> bookings) {
        Map<String, List<Booking>> routeGroups = new LinkedHashMap<>();
        for (Booking booking : bookings) {
            if (booking.getFromDistrict() == null || booking.getToDistrict() == null) {
                continue;
            }
            String key = booking.getFromDistrict() + "|" + booking.getToDistrict();
            routeGroups.computeIfAbsent(key, k -> new ArrayList<>()).add(booking);
        }

        return routeGroups.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("\\|");
                    BigDecimal revenue = entry.getValue().stream()
                            .map(Booking::getTotalPriceLKR)
                            .filter(price -> price != null)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return RevenueSummaryResponse.TopRouteResponse.builder()
                            .from(parts[0])
                            .to(parts[1])
                            .count(entry.getValue().size())
                            .revenue(revenue)
                            .build();
                })
                .sorted(Comparator.comparing(RevenueSummaryResponse.TopRouteResponse::getRevenue).reversed())
                .limit(10)
                .toList();
    }
}
