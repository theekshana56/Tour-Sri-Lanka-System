package com.tsl.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.tsl.model.Place;

public interface PlaceRepository extends MongoRepository<Place, String> {
    long count();

    List<Place> findTop8ByIsFeaturedTrueAndIsActiveTrueOrderByRatingDesc();

    @Query(value = "{ 'isActive': true }", fields = "{ 'district': 1 }")
    List<Place> findDistinctDistricts();
}
