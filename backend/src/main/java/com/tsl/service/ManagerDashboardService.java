package com.tsl.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tsl.dto.response.ManagerDashboardResponse;
import com.tsl.dto.response.ManagerDashboardStatsResponse;
import com.tsl.dto.response.BookingResponse;
import com.tsl.model.BookingStatus;
import com.tsl.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManagerDashboardService {

    private final BookingRepository bookingRepository;

    public ManagerDashboardResponse getDashboard(String managerUserId) {
        LocalDate today = LocalDate.now();

        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        LocalDate weekStartDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDateTime weekStart = weekStartDate.atStartOfDay();
        LocalDateTime weekEnd = LocalDateTime.now();

        List<BookingStatus> reviewedStatuses = List.of(BookingStatus.APPROVED, BookingStatus.REJECTED);

        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long approvedToday = bookingRepository.countByStatusAndReviewedAtBetween(
                BookingStatus.APPROVED,
                dayStart,
                dayEnd);
        long rejectedThisWeek = bookingRepository.countByStatusAndReviewedAtBetween(
                BookingStatus.REJECTED,
                weekStart,
                weekEnd);

        long totalReviewed = bookingRepository.countByReviewedByUserIdAndStatusIn(
                managerUserId,
                reviewedStatuses);

        // Oldest waiting first (longest waiting at top)
        List<BookingResponse> pendingQueue = bookingRepository
                .findByStatusOrderByCreatedAtAsc(BookingStatus.PENDING)
                .stream()
                .map(BookingResponse::from)
                .toList();

        ManagerDashboardStatsResponse stats = ManagerDashboardStatsResponse.builder()
                .pendingBookings(pendingBookings)
                .approvedToday(approvedToday)
                .rejectedThisWeek(rejectedThisWeek)
                .totalReviewed(totalReviewed)
                .build();

        return ManagerDashboardResponse.builder()
                .stats(stats)
                .pendingQueue(pendingQueue)
                .build();
    }
}

