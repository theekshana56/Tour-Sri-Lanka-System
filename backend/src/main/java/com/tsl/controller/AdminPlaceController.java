package com.tsl.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tsl.dto.request.CreatePlaceRequest;
import com.tsl.dto.request.UpdatePlaceRequest;
import com.tsl.dto.response.PlaceResponse;
import com.tsl.service.PlaceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPlaceController {

    private final PlaceService placeService;

    @GetMapping
    public List<PlaceResponse> listAll() {
        return placeService.listAllForAdmin().stream().map(PlaceResponse::from).toList();
    }

    @PostMapping
    public PlaceResponse create(@Valid @RequestBody CreatePlaceRequest request) {
        return PlaceResponse.from(placeService.create(request));
    }

    @PutMapping("/{id}")
    public PlaceResponse update(@PathVariable String id, @Valid @RequestBody UpdatePlaceRequest request) {
        return PlaceResponse.from(placeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public PlaceResponse delete(@PathVariable String id) {
        return PlaceResponse.from(placeService.softDelete(id));
    }

    @PostMapping("/{id}/images")
    public PlaceResponse uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws Exception {
        return PlaceResponse.from(placeService.uploadImage(id, file));
    }

    @PutMapping("/{id}/feature")
    public PlaceResponse toggleFeature(@PathVariable String id) {
        return PlaceResponse.from(placeService.toggleFeature(id));
    }

    @PutMapping("/{id}/active")
    public PlaceResponse toggleActive(@PathVariable String id) {
        return PlaceResponse.from(placeService.toggleActive(id));
    }

    @DeleteMapping("/{id}/images/{index}")
    public PlaceResponse removeImage(@PathVariable String id, @PathVariable int index) {
        return PlaceResponse.from(placeService.removeImage(id, index));
    }
}
