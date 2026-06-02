package com.tsl.dto.response;

import java.time.LocalDateTime;

import com.tsl.model.CallSignal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CallSignalResponse {
    private String id;
    private String callSessionId;
    private String fromUserId;
    private String signalType;
    private String payload;
    private LocalDateTime createdAt;

    public static CallSignalResponse from(CallSignal s) {
        return CallSignalResponse.builder()
                .id(s.getId())
                .callSessionId(s.getCallSessionId())
                .fromUserId(s.getFromUserId())
                .signalType(s.getSignalType())
                .payload(s.getPayload())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
