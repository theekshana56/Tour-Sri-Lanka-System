package com.tsl.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.CallSignal;

public interface CallSignalRepository extends MongoRepository<CallSignal, String> {

    List<CallSignal> findByCallSessionIdAndCreatedAtAfterOrderByCreatedAtAsc(
            String callSessionId, LocalDateTime after);
}
