package com.tsl.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneMultiplier {
    private String fromDistrict;
    private String toDistrict;
    private double multiplier;
}
