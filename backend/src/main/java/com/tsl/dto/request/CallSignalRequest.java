package com.tsl.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CallSignalRequest {

    @NotBlank
    private String signalType;

    @NotBlank
    private String payload;
}
