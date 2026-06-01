package com.tsl.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.DriverAvailability;

public interface DriverAvailabilityRepository extends MongoRepository<DriverAvailability, String> {
    Optional<DriverAvailability> findByDriverId(String driverId);
}
