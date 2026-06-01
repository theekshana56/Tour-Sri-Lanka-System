package com.tsl.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;

public interface BookingRepository extends MongoRepository<Booking, String> {

    Optional<Booking> findByBookingNumber(String bookingNumber);

    Page<Booking> findByCustomerId(String customerId, Pageable pageable);

    Page<Booking> findByCustomerIdAndStatus(String customerId, BookingStatus status, Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    Page<Booking> findByBookingNumberContainingIgnoreCase(String bookingNumber, Pageable pageable);

    Page<Booking> findByStatusAndBookingNumberContainingIgnoreCase(
            BookingStatus status,
            String bookingNumber,
            Pageable pageable);

    Page<Booking> findByAssignedDriverId(String assignedDriverId, Pageable pageable);

    List<Booking> findByAssignedDriverIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            String assignedDriverId,
            BookingStatus status,
            LocalDate end,
            LocalDate start);

    List<Booking> findByStatusInAndCreatedAtBetween(
            Collection<BookingStatus> statuses,
            LocalDateTime from,
            LocalDateTime to);

    List<Booking> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            BookingStatus status,
            LocalDate end,
            LocalDate start);

    long countByStatus(BookingStatus status);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<Booking> findByStatusOrderByCreatedAtAsc(BookingStatus status);

    long countByStatusAndReviewedAtBetween(BookingStatus status, LocalDateTime from, LocalDateTime to);

    long countByReviewedByUserIdAndStatusIn(
            String reviewedByUserId,
            Collection<BookingStatus> statuses);

    Page<Booking> findByReviewedByUserIdAndStatusIn(
            String reviewedByUserId,
            Collection<BookingStatus> statuses,
            Pageable pageable);
}
