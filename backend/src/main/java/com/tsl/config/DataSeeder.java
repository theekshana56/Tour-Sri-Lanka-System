package com.tsl.config;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.tsl.model.ExchangeRate;
import com.tsl.model.Place;
import com.tsl.model.PlaceCategory;
import com.tsl.model.PriceRange;
import com.tsl.model.PricingRule;
import com.tsl.model.Role;
import com.tsl.model.User;
import com.tsl.model.Vehicle;
import com.tsl.model.VehicleType;
import com.tsl.model.ZoneMultiplier;
import com.tsl.repository.ExchangeRateRepository;
import com.tsl.repository.PlaceRepository;
import com.tsl.repository.PricingRuleRepository;
import com.tsl.repository.UserRepository;
import com.tsl.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String EXCHANGE_RATE_ID = "main";

    private final PlaceRepository placeRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final ExchangeRateRepository exchangeRateRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedPlaces();
        seedVehicles();
        seedDrivers();
        seedPricingRules();
        seedExchangeRates();
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmailIgnoreCase("admin@tsl.lk")) {
            return;
        }
        User admin = User.builder()
                .fullName("TSL Admin")
                .email("admin@tsl.lk")
                .password(passwordEncoder.encode("Admin@123"))
                .phone("+94770000000")
                .role(Role.ADMIN)
                .isActive(true)
                .isAvailable(true)
                .build();
        userRepository.save(admin);
        log.info("Seeded default admin user: admin@tsl.lk");
    }

    private void seedPlaces() {
        if (placeRepository.count() > 0) {
            return;
        }

        List<Place> places = List.of(
                buildPlace("Sigiriya Rock Fortress", PlaceCategory.DESTINATION, "Matale", "Central",
                        7.9570, 80.7603, PriceRange.LUXURY, 4.9,
                        List.of("heritage", "UNESCO", "history"),
                        List.of("Ancient rock fortress", "Panoramic views", "UNESCO World Heritage"),
                        "December to April", true),
                buildPlace("Galle Dutch Fort", PlaceCategory.DESTINATION, "Galle", "Southern",
                        6.0267, 80.2167, PriceRange.MID_RANGE, 4.7,
                        List.of("heritage", "colonial", "beach"),
                        List.of("Colonial architecture", "Coastal walks", "Cafes and galleries"),
                        "November to March", true),
                buildPlace("Yala National Park", PlaceCategory.ACTIVITY, "Hambantota", "Southern",
                        6.3724, 81.5170, PriceRange.LUXURY, 4.8,
                        List.of("wildlife", "safari", "leopard"),
                        List.of("Leopard spotting", "Jeep safaris", "Bird watching"),
                        "February to July", true),
                buildPlace("Ella Rock & Nine Arches Bridge", PlaceCategory.DESTINATION, "Badulla", "Uva",
                        6.8667, 81.0500, PriceRange.BUDGET, 4.6,
                        List.of("mountain", "hiking", "scenic"),
                        List.of("Scenic train rides", "Hiking trails", "Iconic bridge"),
                        "January to March", true),
                buildPlace("Mirissa Beach", PlaceCategory.DESTINATION, "Matara", "Southern",
                        5.9483, 80.4716, PriceRange.MID_RANGE, 4.5,
                        List.of("beach", "whale watching", "surfing"),
                        List.of("Whale watching", "Golden sands", "Beach cafes"),
                        "November to April", false),
                buildPlace("Temple of the Tooth (Kandy)", PlaceCategory.DESTINATION, "Kandy", "Central",
                        7.2936, 80.6413, PriceRange.MID_RANGE, 4.8,
                        List.of("heritage", "religious", "UNESCO"),
                        List.of("Sacred relic temple", "Cultural performances", "Lake views"),
                        "Year-round", true),
                buildPlace("Nuwara Eliya Hill Country", PlaceCategory.DESTINATION, "Nuwara Eliya", "Central",
                        6.9497, 80.7891, PriceRange.MID_RANGE, 4.6,
                        List.of("tea", "mountain", "colonial"),
                        List.of("Tea plantations", "Cool climate", "Gregory Lake"),
                        "March to May", false),
                buildPlace("Pinnawala Elephant Orphanage", PlaceCategory.ACTIVITY, "Kegalle", "Sabaragamuwa",
                        7.3008, 80.3870, PriceRange.BUDGET, 4.3,
                        List.of("wildlife", "elephants", "family"),
                        List.of("Elephant herd", "River bathing", "Family friendly"),
                        "Year-round", false),
                buildPlace("Trincomalee Beach", PlaceCategory.DESTINATION, "Trincomalee", "Eastern",
                        8.5874, 81.2152, PriceRange.MID_RANGE, 4.5,
                        List.of("beach", "diving", "whale watching"),
                        List.of("Pristine beaches", "Snorkeling", "Koneswaram Temple"),
                        "May to September", false),
                buildPlace("Colombo City Tour", PlaceCategory.DESTINATION, "Colombo", "Western",
                        6.9271, 79.8612, PriceRange.MID_RANGE, 4.4,
                        List.of("city", "food", "shopping", "nightlife"),
                        List.of("Gangaramaya Temple", "Street food", "Modern malls"),
                        "Year-round", false),
                buildPlace("Arugam Bay", PlaceCategory.DESTINATION, "Ampara", "Eastern",
                        6.8408, 81.8363, PriceRange.BUDGET, 4.6,
                        List.of("surfing", "beach", "backpacker"),
                        List.of("World-class surf", "Laid-back vibe", "Lagoon safaris"),
                        "April to October", false),
                buildPlace("Dambulla Cave Temple", PlaceCategory.DESTINATION, "Matale", "Central",
                        7.8567, 80.6492, PriceRange.BUDGET, 4.7,
                        List.of("heritage", "religious", "UNESCO"),
                        List.of("Cave murals", "Golden temple", "Panoramic hilltop"),
                        "Year-round", false),
                buildPlace("Horton Plains National Park", PlaceCategory.ACTIVITY, "Nuwara Eliya", "Central",
                        6.8021, 80.8078, PriceRange.MID_RANGE, 4.7,
                        List.of("hiking", "wildlife", "waterfall"),
                        List.of("World's End cliff", "Baker's Falls", "Cloud forests"),
                        "January to March", false),
                buildPlace("Bentota Beach & Water Sports", PlaceCategory.DESTINATION, "Galle", "Southern",
                        6.4214, 80.0014, PriceRange.LUXURY, 4.6,
                        List.of("beach", "water sports", "luxury"),
                        List.of("Jet skiing", "River cruises", "Luxury resorts"),
                        "November to April", true),
                buildPlace("Anuradhapura Ancient City", PlaceCategory.DESTINATION, "Anuradhapura", "North Central",
                        8.3114, 80.4037, PriceRange.BUDGET, 4.8,
                        List.of("heritage", "religious", "UNESCO"),
                        List.of("Sacred bodhi tree", "Ancient stupas", "Archaeological sites"),
                        "Year-round", true));

        placeRepository.saveAll(places);
        log.info("Seeded {} Sri Lanka places", places.size());
    }

    private void seedVehicles() {
        if (vehicleRepository.count() > 0) {
            return;
        }

        List<Vehicle> vehicles = List.of(
                Vehicle.builder().name("Toyota Prius").type(VehicleType.SEDAN).capacity(3)
                        .description("Fuel-efficient sedan ideal for city and short tours")
                        .registrationNumber("CAB-1001").isActive(true).build(),
                Vehicle.builder().name("Toyota Fortuner").type(VehicleType.SUV).capacity(6)
                        .description("Comfortable SUV for family hill country tours")
                        .registrationNumber("CAB-2001").isActive(true).build(),
                Vehicle.builder().name("Toyota HiAce").type(VehicleType.VAN).capacity(10)
                        .description("Spacious van for group travel across the island")
                        .registrationNumber("CAB-3001").isActive(true).build(),
                Vehicle.builder().name("Micro Bus").type(VehicleType.MINIBUS).capacity(20)
                        .description("Minibus for large tour groups and events")
                        .registrationNumber("CAB-4001").isActive(true).build(),
                Vehicle.builder().name("Range Rover Sport").type(VehicleType.LUXURY_SUV).capacity(6)
                        .description("Premium luxury SUV for VIP tours")
                        .registrationNumber("CAB-5001").isActive(true).build());

        vehicleRepository.saveAll(vehicles);
        log.info("Seeded {} vehicles", vehicles.size());
    }

    private void seedDrivers() {
        if (!userRepository.findByRoleAndIsActiveTrue(Role.DRIVER).isEmpty()) {
            return;
        }

        List<Vehicle> vehicles = vehicleRepository.findByIsActiveTrue();
        if (vehicles.size() < 3) {
            return;
        }

        User driver1 = User.builder()
                .fullName("Kamal Perera")
                .email("driver1@tsl.lk")
                .password(passwordEncoder.encode("Driver@123"))
                .phone("+94771111001")
                .role(Role.DRIVER)
                .licenseNumber("DL-B123456")
                .isActive(true)
                .isAvailable(true)
                .build();
        User driver2 = User.builder()
                .fullName("Nimal Silva")
                .email("driver2@tsl.lk")
                .password(passwordEncoder.encode("Driver@123"))
                .phone("+94771111002")
                .role(Role.DRIVER)
                .licenseNumber("DL-B234567")
                .isActive(true)
                .isAvailable(true)
                .build();
        User driver3 = User.builder()
                .fullName("Sunil Fernando")
                .email("driver3@tsl.lk")
                .password(passwordEncoder.encode("Driver@123"))
                .phone("+94771111003")
                .role(Role.DRIVER)
                .licenseNumber("DL-B345678")
                .isActive(true)
                .isAvailable(true)
                .build();

        userRepository.saveAll(List.of(driver1, driver2, driver3));

        Vehicle sedan = vehicles.stream().filter(v -> v.getType() == VehicleType.SEDAN).findFirst().orElse(vehicles.get(0));
        Vehicle suv = vehicles.stream().filter(v -> v.getType() == VehicleType.SUV).findFirst().orElse(vehicles.get(1));
        Vehicle van = vehicles.stream().filter(v -> v.getType() == VehicleType.VAN).findFirst().orElse(vehicles.get(2));

        driver1.setAssignedVehicleId(sedan.getId());
        driver2.setAssignedVehicleId(suv.getId());
        driver3.setAssignedVehicleId(van.getId());
        userRepository.saveAll(List.of(driver1, driver2, driver3));

        sedan.setAssignedDriverId(driver1.getId());
        suv.setAssignedDriverId(driver2.getId());
        van.setAssignedDriverId(driver3.getId());
        vehicleRepository.saveAll(List.of(sedan, suv, van));

        log.info("Seeded 3 drivers (driver1@tsl.lk / Driver@123)");
    }

    private void seedPricingRules() {
        if (pricingRuleRepository.count() > 0) {
            return;
        }

        List<ZoneMultiplier> zoneMultipliers = List.of(
                ZoneMultiplier.builder().fromDistrict("Colombo").toDistrict("Badulla").multiplier(1.4).build(),
                ZoneMultiplier.builder().fromDistrict("Colombo").toDistrict("Hambantota").multiplier(1.3).build(),
                ZoneMultiplier.builder().fromDistrict("Colombo").toDistrict("Trincomalee").multiplier(1.5).build(),
                ZoneMultiplier.builder().fromDistrict("Colombo").toDistrict("Matale").multiplier(1.2).build(),
                ZoneMultiplier.builder().fromDistrict("Kandy").toDistrict("Galle").multiplier(1.3).build());

        List<PricingRule> rules = List.of(
                pricingRule(VehicleType.SEDAN, "12000", "1500", zoneMultipliers),
                pricingRule(VehicleType.SUV, "18000", "2000", zoneMultipliers),
                pricingRule(VehicleType.VAN, "22000", "1800", zoneMultipliers),
                pricingRule(VehicleType.MINIBUS, "35000", "1500", zoneMultipliers),
                pricingRule(VehicleType.LUXURY_SUV, "30000", "3000", zoneMultipliers));

        pricingRuleRepository.saveAll(rules);
        log.info("Seeded {} pricing rules", rules.size());
    }

    private void seedExchangeRates() {
        if (exchangeRateRepository.existsById(EXCHANGE_RATE_ID)) {
            return;
        }

        Map<String, BigDecimal> rates = new LinkedHashMap<>();
        rates.put("USD", new BigDecimal("0.00329"));
        rates.put("EUR", new BigDecimal("0.00303"));
        rates.put("GBP", new BigDecimal("0.00259"));
        rates.put("AUD", new BigDecimal("0.00508"));
        rates.put("JPY", new BigDecimal("0.495"));
        rates.put("INR", new BigDecimal("0.274"));
        rates.put("CAD", new BigDecimal("0.00448"));
        rates.put("SGD", new BigDecimal("0.00441"));
        rates.put("CNY", new BigDecimal("0.0238"));
        rates.put("AED", new BigDecimal("0.0121"));
        rates.put("CHF", new BigDecimal("0.00295"));
        rates.put("KRW", new BigDecimal("4.42"));

        ExchangeRate exchangeRate = ExchangeRate.builder()
                .id(EXCHANGE_RATE_ID)
                .baseCurrency("LKR")
                .rates(rates)
                .build();

        exchangeRateRepository.save(exchangeRate);
        log.info("Seeded exchange rates (id={})", EXCHANGE_RATE_ID);
    }

    private PricingRule pricingRule(
            VehicleType type,
            String basePerDay,
            String extraPerPassenger,
            List<ZoneMultiplier> zoneMultipliers) {
        return PricingRule.builder()
                .vehicleType(type)
                .basePricePerDayLKR(new BigDecimal(basePerDay))
                .pricePerExtraPassengerLKR(new BigDecimal(extraPerPassenger))
                .zoneMultipliers(zoneMultipliers)
                .seasonalMultiplier(1.0)
                .isActive(true)
                .build();
    }

    private Place buildPlace(
            String name,
            PlaceCategory category,
            String district,
            String province,
            double lat,
            double lng,
            PriceRange priceRange,
            double rating,
            List<String> tags,
            List<String> highlights,
            String bestTime,
            boolean featured) {
        return Place.builder()
                .name(name)
                .description("Discover " + name + " in " + district + " district — one of Sri Lanka's must-visit destinations.")
                .category(category)
                .district(district)
                .province(province)
                .latitude(lat)
                .longitude(lng)
                .priceRange(priceRange)
                .rating(rating)
                .tags(tags)
                .highlights(highlights)
                .bestTimeToVisit(bestTime)
                .isActive(true)
                .isFeatured(featured)
                .build();
    }
}
