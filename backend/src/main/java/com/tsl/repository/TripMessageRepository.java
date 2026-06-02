package com.tsl.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.TripMessage;

public interface TripMessageRepository extends MongoRepository<TripMessage, String> {

    Page<TripMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId, Pageable pageable);

    List<TripMessage> findByConversationIdAndCreatedAtAfterOrderByCreatedAtAsc(
            String conversationId, LocalDateTime after);
}
