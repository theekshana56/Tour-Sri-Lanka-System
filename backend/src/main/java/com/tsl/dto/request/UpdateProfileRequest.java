package com.tsl.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank
    @Size(min = 8, max = 20)
    private String phone;

    @NotBlank
    @Size(min = 3, max = 3)
    private String preferredCurrency;

    /** When set, updates driver trip availability (drivers only). */
    private Boolean isAvailable;
}
