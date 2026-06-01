package com.tsl.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "places")
public class Place {

    @Id
    private String id;
    private String name;
    private String description;
    private PlaceCategory category;
    private String district;
    private String province;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    private String thumbnailUrl;
    private PriceRange priceRange;
    private Double rating;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Builder.Default
    private List<String> highlights = new ArrayList<>();

    private String bestTimeToVisit;

    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean isFeatured = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
