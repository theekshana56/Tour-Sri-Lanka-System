package com.tsl.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.tsl.dto.response.AdminDashboardResponse;
import com.tsl.dto.response.AdminDashboardStatsResponse;
import com.tsl.dto.response.BookingResponse;
import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.Role;
import com.tsl.repository.BookingRepository;
import com.tsl.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public AdminDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(LocalTime.MAX);

        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);
        long todaysBookings = bookingRepository.countByCreatedAtBetween(dayStart, dayEnd);

        List<Booking> monthBookings = bookingRepository.findByStatusInAndCreatedAtBetween(
                List.of(BookingStatus.APPROVED, BookingStatus.COMPLETED),
                monthStart,
                monthEnd);
        BigDecimal monthRevenue = monthBookings.stream()
                .map(Booking::getTotalPriceLKR)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeDrivers = userRepository.findByRoleAndIsActiveTrue(Role.DRIVER).size();

        List<BookingResponse> pendingQueue = bookingRepository
                .findByStatusOrderByCreatedAtAsc(BookingStatus.PENDING)
                .stream()
                .map(BookingResponse::from)
                .collect(Collectors.toList());

        List<BookingResponse> recentActivity = bookingRepository
                .findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .limit(15)
                .map(BookingResponse::from)
                .collect(Collectors.toList());

        AdminDashboardStatsResponse stats = AdminDashboardStatsResponse.builder()
                .pendingBookings(pending)
                .todaysBookings(todaysBookings)
                .thisMonthRevenueLKR(monthRevenue)
                .activeDrivers(activeDrivers)
                .build();

        return AdminDashboardResponse.builder()
                .stats(stats)
                .pendingQueue(pendingQueue)
                .recentActivity(recentActivity)
                .build();
    }
}
