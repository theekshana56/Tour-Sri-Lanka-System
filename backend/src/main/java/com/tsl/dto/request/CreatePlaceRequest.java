package com.tsl.dto.request;

import java.util.List;

import com.tsl.model.PlaceCategory;
import com.tsl.model.PriceRange;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePlaceRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotNull
    private PlaceCategory category;

    @NotBlank
    private String district;

    @NotBlank
    private String province;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @NotNull
    private PriceRange priceRange;

    private Double rating;
    private List<String> tags;
    private List<String> highlights;
    private String bestTimeToVisit;
}
