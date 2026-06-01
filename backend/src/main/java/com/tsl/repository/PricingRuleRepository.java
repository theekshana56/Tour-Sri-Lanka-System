package com.tsl.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.PricingRule;
import com.tsl.model.VehicleType;

public interface PricingRuleRepository extends MongoRepository<PricingRule, String> {
    Optional<PricingRule> findByVehicleTypeAndIsActiveTrue(VehicleType vehicleType);

    Optional<PricingRule> findByVehicleType(VehicleType vehicleType);

    List<PricingRule> findByIsActiveTrue();
}
