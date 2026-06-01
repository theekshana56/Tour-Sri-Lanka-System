package com.tsl.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.Counter;

public interface CounterRepository extends MongoRepository<Counter, String> {
}
