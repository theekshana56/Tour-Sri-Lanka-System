package com.tsl.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.Vehicle;

public interface VehicleRepository extends MongoRepository<Vehicle, String> {
    List<Vehicle> findByIsActiveTrueAndCapacityGreaterThanEqualOrderByCapacityAsc(int capacity);

    Optional<Vehicle> findByIdAndIsActiveTrue(String id);

    List<Vehicle> findByIsActiveTrue();
}
