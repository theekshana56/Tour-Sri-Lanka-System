package com.tsl.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.ExchangeRate;

public interface ExchangeRateRepository extends MongoRepository<ExchangeRate, String> {
}
