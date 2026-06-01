package com.tsl.controller;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.response.PlaceResponse;
import com.tsl.model.PlaceCategory;
import com.tsl.model.PriceRange;
import com.tsl.service.PlaceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public Page<PlaceResponse> list(
            @RequestParam(required = false) PlaceCategory category,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) PriceRange priceRange,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return placeService.listPlaces(category, district, priceRange, tags, search, page, size)
                .map(PlaceResponse::from);
    }

    @GetMapping("/{id}")
    public PlaceResponse getById(@PathVariable String id) {
        return PlaceResponse.from(placeService.getActivePlace(id));
    }

    @GetMapping("/districts")
    public java.util.List<String> getDistricts() {
        return placeService.getDistricts();
    }

    @GetMapping("/featured")
    public java.util.List<PlaceResponse> getFeatured() {
        return placeService.getFeatured().stream().map(PlaceResponse::from).toList();
    }
}
