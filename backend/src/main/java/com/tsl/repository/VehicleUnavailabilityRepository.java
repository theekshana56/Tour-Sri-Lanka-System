package com.tsl.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.VehicleUnavailability;

public interface VehicleUnavailabilityRepository extends MongoRepository<VehicleUnavailability, String> {
    Optional<VehicleUnavailability> findByVehicleId(String vehicleId);

    List<VehicleUnavailability> findByVehicleIdIn(Collection<String> vehicleIds);
}
