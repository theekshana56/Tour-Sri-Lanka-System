package com.tsl.dto.response;

import com.tsl.model.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverInfoResponse {
    private String driverId;
    private String driverName;
    private VehicleType vehicleType;
    private String vehicleName;
}
