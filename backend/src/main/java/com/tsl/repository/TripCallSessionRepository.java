package com.tsl.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.CallStatus;
import com.tsl.model.TripCallSession;

public interface TripCallSessionRepository extends MongoRepository<TripCallSession, String> {

    Optional<TripCallSession> findByConversationIdAndStatusIn(
            String conversationId, List<CallStatus> statuses);

    List<TripCallSession> findByConversationIdOrderByCreatedAtDesc(String conversationId);

    List<TripCallSession> findAllByOrderByCreatedAtDesc();
}
