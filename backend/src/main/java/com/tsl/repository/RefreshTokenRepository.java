package com.tsl.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tsl.model.RefreshToken;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);
}
