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

import com.tsl.dto.request.CreateVehicleRequest;
import com.tsl.dto.request.UpdateVehicleRequest;
import com.tsl.dto.response.VehicleResponse;
import com.tsl.service.VehicleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/vehicles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminVehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public List<VehicleResponse> listAll() {
        return vehicleService.listAllForAdmin().stream().map(VehicleResponse::from).toList();
    }

    @PostMapping
    public VehicleResponse create(@Valid @RequestBody CreateVehicleRequest request) {
        return VehicleResponse.from(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    public VehicleResponse update(@PathVariable String id, @Valid @RequestBody UpdateVehicleRequest request) {
        return VehicleResponse.from(vehicleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public VehicleResponse delete(@PathVariable String id) {
        return VehicleResponse.from(vehicleService.softDelete(id));
    }

    @PostMapping("/{id}/image")
    public VehicleResponse uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws Exception {
        return VehicleResponse.from(vehicleService.uploadImage(id, file));
    }
}
