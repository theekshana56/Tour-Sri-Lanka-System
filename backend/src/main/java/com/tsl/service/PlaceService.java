package com.tsl.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tsl.dto.request.CreatePlaceRequest;
import com.tsl.dto.request.UpdatePlaceRequest;
import com.tsl.exception.BadRequestException;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.model.Place;
import com.tsl.model.PlaceCategory;
import com.tsl.model.PriceRange;
import com.tsl.repository.PlaceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final MongoTemplate mongoTemplate;
    private final CloudinaryService cloudinaryService;

    public Page<Place> listPlaces(
            PlaceCategory category,
            String district,
            PriceRange priceRange,
            String tags,
            String search,
            int page,
            int size) {

        Query query = new Query(Criteria.where("isActive").is(true));

        if (category != null) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (district != null && !district.isBlank()) {
            query.addCriteria(Criteria.where("district").is(district));
        }
        if (priceRange != null) {
            query.addCriteria(Criteria.where("priceRange").is(priceRange));
        }
        if (tags != null && !tags.isBlank()) {
            List<String> tagList = Arrays.stream(tags.split(","))
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .toList();
            if (!tagList.isEmpty()) {
                query.addCriteria(Criteria.where("tags").in(tagList));
            }
        }
        if (search != null && !search.isBlank()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("name").regex(search, "i"),
                    Criteria.where("description").regex(search, "i"),
                    Criteria.where("district").regex(search, "i")));
        }

        long total = mongoTemplate.count(query, Place.class);
        Pageable pageable = PageRequest.of(page, size);
        query.with(pageable);
        List<Place> places = mongoTemplate.find(query, Place.class);

        return new PageImpl<>(places, pageable, total);
    }

    public Place getActivePlace(String id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));
        if (!place.isActive()) {
            throw new ResourceNotFoundException("Place not found");
        }
        return place;
    }

    public List<String> getDistricts() {
        return placeRepository.findDistinctDistricts().stream()
                .map(Place::getDistrict)
                .distinct()
                .sorted(Comparator.naturalOrder())
                .collect(Collectors.toList());
    }

    public List<Place> getFeatured() {
        return placeRepository.findTop8ByIsFeaturedTrueAndIsActiveTrueOrderByRatingDesc();
    }

    public List<Place> listAllForAdmin() {
        return placeRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
    }

    public Place toggleActive(String id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));
        place.setActive(!place.isActive());
        return placeRepository.save(place);
    }

    public Place create(CreatePlaceRequest request) {
        Place place = Place.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .district(request.getDistrict())
                .province(request.getProvince())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .priceRange(request.getPriceRange())
                .rating(request.getRating() != null ? request.getRating() : 4.0)
                .tags(request.getTags() != null ? request.getTags() : new ArrayList<>())
                .highlights(limitHighlights(request.getHighlights()))
                .bestTimeToVisit(request.getBestTimeToVisit())
                .isActive(true)
                .isFeatured(false)
                .build();
        return placeRepository.save(place);
    }

    public Place update(String id, UpdatePlaceRequest request) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));

        place.setName(request.getName());
        place.setDescription(request.getDescription());
        place.setCategory(request.getCategory());
        place.setDistrict(request.getDistrict());
        place.setProvince(request.getProvince());
        place.setLatitude(request.getLatitude());
        place.setLongitude(request.getLongitude());
        place.setPriceRange(request.getPriceRange());
        if (request.getRating() != null) {
            place.setRating(request.getRating());
        }
        if (request.getTags() != null) {
            place.setTags(request.getTags());
        }
        if (request.getHighlights() != null) {
            place.setHighlights(limitHighlights(request.getHighlights()));
        }
        place.setBestTimeToVisit(request.getBestTimeToVisit());

        return placeRepository.save(place);
    }

    public Place softDelete(String id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));
        place.setActive(false);
        return placeRepository.save(place);
    }

    public Place uploadImage(String id, MultipartFile file) throws Exception {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));

        String url = cloudinaryService.uploadImage(file, "tsl/places");
        if (place.getImageUrls() == null) {
            place.setImageUrls(new ArrayList<>());
        }
        place.getImageUrls().add(url);
        if (place.getThumbnailUrl() == null || place.getThumbnailUrl().isBlank()) {
            place.setThumbnailUrl(url);
        }
        return placeRepository.save(place);
    }

    public Place toggleFeature(String id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));
        place.setFeatured(!place.isFeatured());
        return placeRepository.save(place);
    }

    public Place removeImage(String id, int index) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));

        if (place.getImageUrls() == null || index < 0 || index >= place.getImageUrls().size()) {
            throw new BadRequestException("Invalid image index");
        }

        String removedUrl = place.getImageUrls().remove(index);
        String publicId = cloudinaryService.extractPublicId(removedUrl);
        if (publicId != null) {
            cloudinaryService.deleteImage(publicId);
        }

        if (removedUrl.equals(place.getThumbnailUrl())) {
            place.setThumbnailUrl(
                    place.getImageUrls().isEmpty() ? null : place.getImageUrls().get(0));
        }

        return placeRepository.save(place);
    }

    private List<String> limitHighlights(List<String> highlights) {
        if (highlights == null) {
            return new ArrayList<>();
        }
        return highlights.stream().limit(5).collect(Collectors.toList());
    }
}
