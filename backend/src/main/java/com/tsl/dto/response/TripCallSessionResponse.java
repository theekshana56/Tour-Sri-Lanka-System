package com.tsl.dto.response;

import java.time.LocalDateTime;

import com.tsl.model.CallStatus;
import com.tsl.model.Role;
import com.tsl.model.TripCallSession;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripCallSessionResponse {
    private String id;
    private String conversationId;
    private String bookingId;
    private String initiatorId;
    private Role initiatorRole;
    private CallStatus status;
    private LocalDateTime answeredAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;
    private LocalDateTime createdAt;

    public static TripCallSessionResponse from(TripCallSession c) {
        return TripCallSessionResponse.builder()
                .id(c.getId())
                .conversationId(c.getConversationId())
                .bookingId(c.getBookingId())
                .initiatorId(c.getInitiatorId())
                .initiatorRole(c.getInitiatorRole())
                .status(c.getStatus())
                .answeredAt(c.getAnsweredAt())
                .endedAt(c.getEndedAt())
                .durationSeconds(c.getDurationSeconds())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
