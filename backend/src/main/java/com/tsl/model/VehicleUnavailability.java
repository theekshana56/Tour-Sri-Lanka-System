package com.tsl.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vehicle_unavailability")
public class VehicleUnavailability {

    @Id
    private String id;

    @Indexed(unique = true)
    private String vehicleId;

    @Builder.Default
    private List<LocalDate> unavailableDates = new ArrayList<>();
}
