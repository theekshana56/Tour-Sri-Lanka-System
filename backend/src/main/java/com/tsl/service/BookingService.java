package com.tsl.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.tsl.dto.request.ApproveBookingRequest;
import com.tsl.dto.request.CreateBookingRequest;
import com.tsl.dto.request.RejectBookingRequest;
import com.tsl.dto.response.BookingResponse;
import com.tsl.dto.response.DriverBookingResponse;
import com.tsl.dto.response.PriceQuoteResponse;
import com.tsl.dto.response.PublicBookingTrackResponse;
import com.tsl.dto.response.RangeAvailabilityResponse;
import com.tsl.exception.BadRequestException;
import com.tsl.exception.BookingUnavailableException;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.exception.UnauthorizedException;
import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.Place;
import com.tsl.model.Role;
import com.tsl.model.User;
import com.tsl.model.Vehicle;
import com.tsl.repository.BookingRepository;
import com.tsl.repository.PlaceRepository;
import com.tsl.repository.UserRepository;
import com.tsl.repository.VehicleRepository;
import com.tsl.util.BookingIdGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingIdGenerator bookingIdGenerator;
    private final AvailabilityService availabilityService;
    private final PricingService pricingService;
    private final NotificationService notificationService;
    private final TripCommunicationService tripCommunicationService;

    public BookingResponse createBooking(CreateBookingRequest request, String customerId) {
        validateCreateRequest(request);

        RangeAvailabilityResponse availability = availabilityService.checkRangeAvailability(
                request.getStartDate(), request.getEndDate());
        if (!availability.isAvailable()) {
            throw new BookingUnavailableException(
                    "No drivers or vehicles available for the selected dates");
        }

        int numberOfDays = calculateNumberOfDays(request.getStartDate(), request.getEndDate());
        PriceQuoteResponse quote = pricingService.calculatePrice(
                request.getVehicleType().name(),
                request.getFromDistrict(),
                request.getToDistrict(),
                numberOfDays,
                request.getPassengerCount(),
                request.getPreferredCurrency());

        List<String> placeNames = resolvePlaceNames(request.getSelectedPlaceIds());

        Booking booking = Booking.builder()
                .bookingNumber(bookingIdGenerator.generate())
                .customerId(customerId)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerWhatsapp(request.getCustomerWhatsapp())
                .selectedPlaceIds(request.getSelectedPlaceIds())
                .selectedPlaceNames(placeNames)
                .fromDistrict(request.getFromDistrict())
                .toDistrict(request.getToDistrict())
                .pickupLocation(request.getPickupLocation())
                .dropLocation(request.getDropLocation())
                .pickupTime(request.getPickupTime())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .numberOfDays(numberOfDays)
                .passengerCount(request.getPassengerCount())
                .vehicleType(request.getVehicleType())
                .status(BookingStatus.PENDING)
                .totalPriceLKR(quote.getTotalLKR())
                .totalPriceForeign(quote.getTotalForeignCurrency())
                .preferredCurrency(quote.getPreferredCurrency())
                .exchangeRateUsed(quote.getExchangeRateUsed())
                .customerNotes(request.getCustomerNotes())
                .build();

        Booking saved = bookingRepository.save(booking);
        notificationService.notifyBookingCreated(saved);
        return BookingResponse.from(saved);
    }

    public BookingResponse approveBooking(String bookingId, ApproveBookingRequest request, String approvedByUserId) {
        Booking booking = requireBooking(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved");
        }

        Vehicle vehicle = vehicleRepository.findByIdAndIsActiveTrue(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        User driver = userRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        if (driver.getRole() != Role.DRIVER) {
            throw new BadRequestException("Assigned user is not a driver");
        }

        User reviewer = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        if (vehicle.getType() != booking.getVehicleType()) {
            throw new BadRequestException("Assigned vehicle type (" + vehicle.getType() + 
                    ") does not match requested vehicle type (" + booking.getVehicleType() + ")");
        }

        if (vehicle.getCapacity() < booking.getPassengerCount()) {
            throw new BadRequestException("Assigned vehicle capacity (" + vehicle.getCapacity() +
                    ") is less than requested passenger count (" + booking.getPassengerCount() + ")");
        }

        if (driver.getAssignedVehicleId() == null || !driver.getAssignedVehicleId().equals(vehicle.getId())) {
            throw new BadRequestException("Selected driver is not assigned to the selected vehicle");
        }

        // Check if driver is already booked on overlapping dates
        List<Booking> driverOverlaps = bookingRepository
                .findByAssignedDriverIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        driver.getId(), BookingStatus.APPROVED, booking.getEndDate(), booking.getStartDate());
        if (!driverOverlaps.isEmpty()) {
            throw new BadRequestException("Driver is already booked for another trip during this period");
        }

        // Check if vehicle is already booked on overlapping dates
        List<Booking> vehicleOverlaps = bookingRepository
                .findByVehicleIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        vehicle.getId(), BookingStatus.APPROVED, booking.getEndDate(), booking.getStartDate());
        if (!vehicleOverlaps.isEmpty()) {
            throw new BadRequestException("Vehicle is already booked for another trip during this period");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setVehicleId(vehicle.getId());
        booking.setVehicleName(vehicle.getName());
        booking.setAssignedDriverId(driver.getId());
        booking.setAssignedDriverName(driver.getFullName());
        booking.setAssignedDriverPhone(driver.getPhone());
        booking.setReviewedByUserId(approvedByUserId);
        booking.setReviewedByName(reviewer.getFullName());
        booking.setReviewedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        tripCommunicationService.ensureConversationForBooking(saved);
        notificationService.notifyBookingApproved(saved);
        return BookingResponse.from(saved);
    }

    public BookingResponse rejectBooking(String bookingId, RejectBookingRequest request, String rejectedByUserId) {
        if (!StringUtils.hasText(request.getRejectionReason())) {
            throw new BadRequestException("Rejection reason is required");
        }

        Booking booking = requireBooking(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected");
        }

        User reviewer = userRepository.findById(rejectedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(request.getRejectionReason().trim());
        booking.setReviewedByUserId(rejectedByUserId);
        booking.setReviewedByName(reviewer.getFullName());
        booking.setReviewedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        notificationService.notifyBookingRejected(saved);
        return BookingResponse.from(saved);
    }

    public BookingResponse cancelBooking(String bookingId, String requestedByUserId, String requestedByRole) {
        Booking booking = requireBooking(bookingId);

        if ("CUSTOMER".equals(requestedByRole)) {
            if (booking.getCustomerId() == null || !booking.getCustomerId().equals(requestedByUserId)) {
                throw new UnauthorizedException("You can only cancel your own bookings");
            }
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new BadRequestException("You can only cancel pending bookings");
            }
        } else if ("ADMIN".equals(requestedByRole)) {
            if (booking.getStatus() == BookingStatus.COMPLETED) {
                throw new BadRequestException("Completed bookings cannot be cancelled");
            }
        } else {
            throw new UnauthorizedException("You do not have permission to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    public BookingResponse completeBooking(String bookingId, String completedByUserId, String completedByRole) {
        Booking booking = requireBooking(bookingId);

        if (!"ADMIN".equals(completedByRole) && !"DRIVER".equals(completedByRole)) {
            throw new UnauthorizedException("You do not have permission to complete this booking");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be completed");
        }

        if ("DRIVER".equals(completedByRole)) {
            if (booking.getAssignedDriverId() == null
                    || !booking.getAssignedDriverId().equals(completedByUserId)) {
                throw new UnauthorizedException("You can only complete bookings assigned to you");
            }
        }

        booking.setStatus(BookingStatus.COMPLETED);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    public DriverBookingResponse completeDriverBooking(String bookingId, String driverId) {
        completeBooking(bookingId, driverId, "DRIVER");
        return toDriverResponse(requireBooking(bookingId));
    }

    public PublicBookingTrackResponse getByBookingNumber(String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return PublicBookingTrackResponse.from(booking);
    }

    public BookingResponse getById(String id) {
        return BookingResponse.from(requireBooking(id));
    }

    public Page<BookingResponse> getCustomerBookings(String customerId, BookingStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Booking> bookings = status != null
                ? bookingRepository.findByCustomerIdAndStatus(customerId, status, pageable)
                : bookingRepository.findByCustomerId(customerId, pageable);
        return bookings.map(BookingResponse::from);
    }

    public Page<BookingResponse> getAdminBookings(BookingStatus status, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String searchTerm = StringUtils.hasText(search) ? search.trim() : null;

        Page<Booking> bookings;
        if (status != null && searchTerm != null) {
            bookings = bookingRepository.findByStatusAndBookingNumberContainingIgnoreCase(
                    status, searchTerm, pageable);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(status, pageable);
        } else if (searchTerm != null) {
            bookings = bookingRepository.findByBookingNumberContainingIgnoreCase(searchTerm, pageable);
        } else {
            bookings = bookingRepository.findAll(pageable);
        }
        return bookings.map(BookingResponse::from);
    }

    public Page<BookingResponse> getBookingsReviewedBy(String reviewedByUserId, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "reviewedAt", "createdAt"));

        List<BookingStatus> statuses = List.of(BookingStatus.APPROVED, BookingStatus.REJECTED);
        Page<Booking> bookings = bookingRepository.findByReviewedByUserIdAndStatusIn(
                reviewedByUserId,
                statuses,
                pageable);
        return bookings.map(BookingResponse::from);
    }

    public Page<DriverBookingResponse> getDriverBookings(String driverId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startDate"));
        return bookingRepository.findByAssignedDriverId(driverId, pageable).map(this::toDriverResponse);
    }

    public List<DriverBookingResponse> getDriverBookingsToday(String driverId) {
        LocalDate today = LocalDate.now();
        return bookingRepository
                .findByAssignedDriverIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        driverId, BookingStatus.APPROVED, today, today)
                .stream()
                .map(this::toDriverResponse)
                .collect(Collectors.toList());
    }

    private DriverBookingResponse toDriverResponse(Booking booking) {
        String conversationId = tripCommunicationService.findConversationIdForBooking(booking.getId());
        return DriverBookingResponse.from(booking, conversationId);
    }

    private void validateCreateRequest(CreateBookingRequest request) {
        LocalDate today = LocalDate.now();
        if (request.getStartDate().isBefore(today)) {
            throw new BadRequestException("Start date cannot be in the past");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }
        if (request.getPassengerCount() < 1) {
            throw new BadRequestException("Passenger count must be at least 1");
        }
    }

    private int calculateNumberOfDays(LocalDate start, LocalDate end) {
        return (int) ChronoUnit.DAYS.between(start, end) + 1;
    }

    private List<String> resolvePlaceNames(List<String> placeIds) {
        List<String> names = new ArrayList<>();
        for (String placeId : placeIds) {
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + placeId));
            names.add(place.getName());
        }
        return names;
    }

    private Booking requireBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }
}
