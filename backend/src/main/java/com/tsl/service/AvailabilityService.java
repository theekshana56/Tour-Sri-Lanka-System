package com.tsl.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tsl.dto.response.BlockedDatesResponse;
import com.tsl.dto.response.DayAvailabilityResponse;
import com.tsl.dto.response.DriverInfoResponse;
import com.tsl.dto.response.RangeAvailabilityResponse;
import com.tsl.dto.response.VehicleResponse;
import com.tsl.dto.response.VehicleUnavailableDatesResponse;
import com.tsl.exception.BadRequestException;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.DriverAvailability;
import com.tsl.model.Role;
import com.tsl.model.User;
import com.tsl.model.Vehicle;
import com.tsl.model.VehicleType;
import com.tsl.model.VehicleUnavailability;
import com.tsl.repository.BookingRepository;
import com.tsl.repository.DriverAvailabilityRepository;
import com.tsl.repository.UserRepository;
import com.tsl.repository.VehicleRepository;
import com.tsl.repository.VehicleUnavailabilityRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final DriverAvailabilityRepository driverAvailabilityRepository;
    private final VehicleUnavailabilityRepository vehicleUnavailabilityRepository;

    public Map<String, DayAvailabilityResponse> getMonthlyCalendar(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate from = yearMonth.atDay(1);
        LocalDate to = yearMonth.atEndOfMonth();
        AvailabilityContext context = buildContext(from, to);

        Map<String, DayAvailabilityResponse> calendar = new LinkedHashMap<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            int availableDrivers = countAvailableDrivers(date, context);
            int availableVehicles = countAvailableVehicles(date, context);
            calendar.put(date.toString(), DayAvailabilityResponse.builder()
                    .availableDrivers(availableDrivers)
                    .availableVehicles(availableVehicles)
                    .isAvailable(availableDrivers > 0 && availableVehicles > 0)
                    .build());
        }
        return calendar;
    }

    public RangeAvailabilityResponse checkRangeAvailability(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        AvailabilityContext context = buildContext(from, to);

        int minDrivers = Integer.MAX_VALUE;
        int minVehicles = Integer.MAX_VALUE;
        List<LocalDate> blockedDays = new ArrayList<>();

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            int availableDrivers = countAvailableDrivers(date, context);
            int availableVehicles = countAvailableVehicles(date, context);
            minDrivers = Math.min(minDrivers, availableDrivers);
            minVehicles = Math.min(minVehicles, availableVehicles);
            if (availableDrivers == 0 || availableVehicles == 0) {
                blockedDays.add(date);
            }
        }

        if (minDrivers == Integer.MAX_VALUE) {
            minDrivers = 0;
        }
        if (minVehicles == Integer.MAX_VALUE) {
            minVehicles = 0;
        }

        return RangeAvailabilityResponse.builder()
                .available(blockedDays.isEmpty())
                .minAvailableDrivers(minDrivers)
                .minAvailableVehicles(minVehicles)
                .blockedDays(blockedDays)
                .build();
    }

    public List<DriverInfoResponse> getAvailableDriversForDateRange(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        AvailabilityContext context = buildContext(from, to);

        List<DriverInfoResponse> result = new ArrayList<>();
        for (User driver : context.drivers()) {
            if (!driver.isAvailable()) {
                continue;
            }
            boolean availableAllDays = true;
            for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
                if (!isDriverAvailableOnDate(driver.getId(), date, context)) {
                    availableAllDays = false;
                    break;
                }
            }
            if (availableAllDays) {
                result.add(toDriverInfo(driver, context.vehicleById()));
            }
        }
        return result;
    }

    public List<VehicleResponse> getAvailableVehiclesForDateRange(
            LocalDate from, LocalDate to, int minCapacity) {
        validateDateRange(from, to);
        if (minCapacity < 1) {
            throw new BadRequestException("Minimum capacity must be at least 1");
        }

        AvailabilityContext context = buildContext(from, to);
        List<VehicleResponse> result = new ArrayList<>();

        for (Vehicle vehicle : context.vehicles()) {
            if (vehicle.getCapacity() < minCapacity) {
                continue;
            }
            boolean availableAllDays = true;
            for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
                if (!isVehicleAvailableOnDate(vehicle.getId(), date, context)) {
                    availableAllDays = false;
                    break;
                }
            }
            if (availableAllDays) {
                result.add(VehicleResponse.from(vehicle));
            }
        }
        return result;
    }

    public BlockedDatesResponse getDriverBlockedDates(String driverId) {
        User driver = requireDriver(driverId);
        return BlockedDatesResponse.builder()
                .driverId(driver.getId())
                .blockedDates(getBlockedDatesForDriver(driverId))
                .build();
    }

    public BlockedDatesResponse blockDriverDate(String driverId, LocalDate date) {
        requireDriver(driverId);
        DriverAvailability availability = driverAvailabilityRepository.findByDriverId(driverId)
                .orElseGet(() -> DriverAvailability.builder().driverId(driverId).build());

        if (!availability.getBlockedDates().contains(date)) {
            availability.getBlockedDates().add(date);
            Collections.sort(availability.getBlockedDates());
            driverAvailabilityRepository.save(availability);
        }

        return BlockedDatesResponse.builder()
                .driverId(driverId)
                .blockedDates(availability.getBlockedDates())
                .build();
    }

    public BlockedDatesResponse unblockDriverDate(String driverId, LocalDate date) {
        requireDriver(driverId);
        DriverAvailability availability = driverAvailabilityRepository.findByDriverId(driverId)
                .orElse(null);

        if (availability != null) {
            availability.getBlockedDates().remove(date);
            driverAvailabilityRepository.save(availability);
            return BlockedDatesResponse.builder()
                    .driverId(driverId)
                    .blockedDates(availability.getBlockedDates())
                    .build();
        }

        return BlockedDatesResponse.builder()
                .driverId(driverId)
                .blockedDates(List.of())
                .build();
    }

    public VehicleUnavailableDatesResponse getVehicleUnavailableDates(String vehicleId) {
        requireVehicle(vehicleId);
        return VehicleUnavailableDatesResponse.builder()
                .vehicleId(vehicleId)
                .unavailableDates(getUnavailableDatesForVehicle(vehicleId))
                .build();
    }

    public VehicleUnavailableDatesResponse blockVehicleDate(String vehicleId, LocalDate date) {
        requireVehicle(vehicleId);
        VehicleUnavailability unavailability = vehicleUnavailabilityRepository.findByVehicleId(vehicleId)
                .orElseGet(() -> VehicleUnavailability.builder().vehicleId(vehicleId).build());

        if (!unavailability.getUnavailableDates().contains(date)) {
            unavailability.getUnavailableDates().add(date);
            Collections.sort(unavailability.getUnavailableDates());
            vehicleUnavailabilityRepository.save(unavailability);
        }

        return VehicleUnavailableDatesResponse.builder()
                .vehicleId(vehicleId)
                .unavailableDates(unavailability.getUnavailableDates())
                .build();
    }

    public VehicleUnavailableDatesResponse unblockVehicleDate(String vehicleId, LocalDate date) {
        requireVehicle(vehicleId);
        VehicleUnavailability unavailability = vehicleUnavailabilityRepository.findByVehicleId(vehicleId)
                .orElse(null);

        if (unavailability != null) {
            unavailability.getUnavailableDates().remove(date);
            vehicleUnavailabilityRepository.save(unavailability);
            return VehicleUnavailableDatesResponse.builder()
                    .vehicleId(vehicleId)
                    .unavailableDates(unavailability.getUnavailableDates())
                    .build();
        }

        return VehicleUnavailableDatesResponse.builder()
                .vehicleId(vehicleId)
                .unavailableDates(List.of())
                .build();
    }

    private AvailabilityContext buildContext(LocalDate from, LocalDate to) {
        List<User> drivers = userRepository.findByRoleAndIsActiveTrue(Role.DRIVER);
        List<Vehicle> vehicles = vehicleRepository.findByIsActiveTrue();
        List<Booking> bookings = bookingRepository
                .findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        BookingStatus.APPROVED, to, from);

        List<String> driverIds = drivers.stream().map(User::getId).toList();
        Map<String, Set<LocalDate>> driverBlockedDates = driverAvailabilityRepository.findByDriverIdIn(driverIds).stream()
                .collect(Collectors.toMap(
                        DriverAvailability::getDriverId,
                        da -> da.getBlockedDates().stream()
                                .filter(date -> !date.isBefore(from) && !date.isAfter(to))
                                .collect(Collectors.toSet())));

        List<String> vehicleIds = vehicles.stream().map(Vehicle::getId).toList();
        Map<String, Set<LocalDate>> vehicleUnavailableDates = vehicleUnavailabilityRepository.findByVehicleIdIn(vehicleIds).stream()
                .collect(Collectors.toMap(
                        VehicleUnavailability::getVehicleId,
                        vu -> vu.getUnavailableDates().stream()
                                .filter(date -> !date.isBefore(from) && !date.isAfter(to))
                                .collect(Collectors.toSet())));

        Map<String, Map<LocalDate, Boolean>> driverBookedByDate = new HashMap<>();
        Map<String, Map<LocalDate, Boolean>> vehicleBookedByDate = new HashMap<>();

        for (Booking booking : bookings) {
            LocalDate rangeStart = booking.getStartDate().isBefore(from) ? from : booking.getStartDate();
            LocalDate rangeEnd = booking.getEndDate().isAfter(to) ? to : booking.getEndDate();
            if (rangeStart == null || rangeEnd == null) {
                continue;
            }
            for (LocalDate date = rangeStart; !date.isAfter(rangeEnd); date = date.plusDays(1)) {
                if (booking.getAssignedDriverId() != null) {
                    driverBookedByDate
                            .computeIfAbsent(booking.getAssignedDriverId(), k -> new HashMap<>())
                            .put(date, true);
                }
                if (booking.getVehicleId() != null) {
                    vehicleBookedByDate
                            .computeIfAbsent(booking.getVehicleId(), k -> new HashMap<>())
                            .put(date, true);
                }
            }
        }

        Map<String, Vehicle> vehicleById = vehicles.stream()
                .collect(Collectors.toMap(Vehicle::getId, v -> v));

        return new AvailabilityContext(
                drivers,
                vehicles,
                vehicleById,
                driverBlockedDates,
                vehicleUnavailableDates,
                driverBookedByDate,
                vehicleBookedByDate);
    }

    private int countAvailableDrivers(LocalDate date, AvailabilityContext context) {
        int count = 0;
        for (User driver : context.drivers()) {
            if (driver.isAvailable() && isDriverAvailableOnDate(driver.getId(), date, context)) {
                count++;
            }
        }
        return count;
    }

    private int countAvailableVehicles(LocalDate date, AvailabilityContext context) {
        int count = 0;
        for (Vehicle vehicle : context.vehicles()) {
            if (isVehicleAvailableOnDate(vehicle.getId(), date, context)) {
                count++;
            }
        }
        return count;
    }

    private boolean isDriverAvailableOnDate(String driverId, LocalDate date, AvailabilityContext context) {
        Set<LocalDate> blocked = context.driverBlockedDates().getOrDefault(driverId, Set.of());
        if (blocked.contains(date)) {
            return false;
        }
        Map<LocalDate, Boolean> booked = context.driverBookedByDate().get(driverId);
        return booked == null || !booked.containsKey(date);
    }

    private boolean isVehicleAvailableOnDate(String vehicleId, LocalDate date, AvailabilityContext context) {
        Set<LocalDate> unavailable = context.vehicleUnavailableDates().getOrDefault(vehicleId, Set.of());
        if (unavailable.contains(date)) {
            return false;
        }
        Map<LocalDate, Boolean> booked = context.vehicleBookedByDate().get(vehicleId);
        return booked == null || !booked.containsKey(date);
    }

    private DriverInfoResponse toDriverInfo(User driver, Map<String, Vehicle> vehicleById) {
        VehicleType vehicleType = null;
        String vehicleName = null;
        if (driver.getAssignedVehicleId() != null) {
            Vehicle vehicle = vehicleById.get(driver.getAssignedVehicleId());
            if (vehicle != null) {
                vehicleType = vehicle.getType();
                vehicleName = vehicle.getName();
            }
        }
        return DriverInfoResponse.builder()
                .driverId(driver.getId())
                .driverName(driver.getFullName())
                .vehicleType(vehicleType)
                .vehicleName(vehicleName)
                .build();
    }

    private List<LocalDate> getBlockedDatesForDriver(String driverId) {
        return driverAvailabilityRepository.findByDriverId(driverId)
                .map(DriverAvailability::getBlockedDates)
                .orElse(List.of());
    }

    private List<LocalDate> getUnavailableDatesForVehicle(String vehicleId) {
        return vehicleUnavailabilityRepository.findByVehicleId(vehicleId)
                .map(VehicleUnavailability::getUnavailableDates)
                .orElse(List.of());
    }

    private User requireDriver(String driverId) {
        User user = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        if (user.getRole() != Role.DRIVER) {
            throw new BadRequestException("User is not a driver");
        }
        return user;
    }

    private Vehicle requireVehicle(String vehicleId) {
        return vehicleRepository.findByIdAndIsActiveTrue(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new BadRequestException("'from' date must not be after 'to' date");
        }
    }

    private record AvailabilityContext(
            List<User> drivers,
            List<Vehicle> vehicles,
            Map<String, Vehicle> vehicleById,
            Map<String, Set<LocalDate>> driverBlockedDates,
            Map<String, Set<LocalDate>> vehicleUnavailableDates,
            Map<String, Map<LocalDate, Boolean>> driverBookedByDate,
            Map<String, Map<LocalDate, Boolean>> vehicleBookedByDate) {
    }
}
