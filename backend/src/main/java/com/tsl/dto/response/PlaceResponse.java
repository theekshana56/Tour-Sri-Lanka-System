package com.tsl.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.tsl.model.Place;
import com.tsl.model.PlaceCategory;
import com.tsl.model.PriceRange;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceResponse {
    private String id;
    private String name;
    private String description;
    private PlaceCategory category;
    private String district;
    private String province;
    private Double latitude;
    private Double longitude;
    private List<String> imageUrls;
    private String thumbnailUrl;
    private PriceRange priceRange;
    private Double rating;
    private List<String> tags;
    private List<String> highlights;
    private String bestTimeToVisit;
    private boolean isFeatured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PlaceResponse from(Place place) {
        return PlaceResponse.builder()
                .id(place.getId())
                .name(place.getName())
                .description(place.getDescription())
                .category(place.getCategory())
                .district(place.getDistrict())
                .province(place.getProvince())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .imageUrls(place.getImageUrls())
                .thumbnailUrl(place.getThumbnailUrl())
                .priceRange(place.getPriceRange())
                .rating(place.getRating())
                .tags(place.getTags())
                .highlights(place.getHighlights())
                .bestTimeToVisit(place.getBestTimeToVisit())
                .isFeatured(place.isFeatured())
                .createdAt(place.getCreatedAt())
                .updatedAt(place.getUpdatedAt())
                .build();
    }
}
