package com.tsl.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tsl.dto.request.CreateVehicleRequest;
import com.tsl.dto.request.UpdateVehicleRequest;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.model.Vehicle;
import com.tsl.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CloudinaryService cloudinaryService;

    public List<Vehicle> listByCapacity(int capacity) {
        return vehicleRepository.findByIsActiveTrueAndCapacityGreaterThanEqualOrderByCapacityAsc(capacity);
    }

    public List<Vehicle> listAllForAdmin() {
        return vehicleRepository.findAll();
    }

    public Vehicle getActiveVehicle(String id) {
        return vehicleRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }

    public Vehicle create(CreateVehicleRequest request) {
        Vehicle vehicle = Vehicle.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .registrationNumber(request.getRegistrationNumber())
                .assignedDriverId(request.getAssignedDriverId())
                .isActive(true)
                .build();
        return vehicleRepository.save(vehicle);
    }

    public Vehicle update(String id, UpdateVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        vehicle.setName(request.getName());
        vehicle.setType(request.getType());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setDescription(request.getDescription());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setAssignedDriverId(request.getAssignedDriverId());

        return vehicleRepository.save(vehicle);
    }

    public Vehicle softDelete(String id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        vehicle.setActive(false);
        return vehicleRepository.save(vehicle);
    }

    public Vehicle uploadImage(String id, MultipartFile file) throws Exception {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (vehicle.getImageUrl() != null) {
            String publicId = cloudinaryService.extractPublicId(vehicle.getImageUrl());
            if (publicId != null) {
                cloudinaryService.deleteImage(publicId);
            }
        }

        String url = cloudinaryService.uploadImage(file, "tsl/vehicles");
        vehicle.setImageUrl(url);
        return vehicleRepository.save(vehicle);
    }
}
