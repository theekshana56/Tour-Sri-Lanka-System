package com.tsl.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.TripConversation;

public interface TripConversationRepository extends MongoRepository<TripConversation, String> {

    Optional<TripConversation> findByBookingId(String bookingId);

    List<TripConversation> findByCustomerIdOrderByLastMessageAtDesc(String customerId);

    List<TripConversation> findByDriverIdOrderByLastMessageAtDesc(String driverId);
}
