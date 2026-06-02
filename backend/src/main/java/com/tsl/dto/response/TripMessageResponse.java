package com.tsl.dto.response;

import java.time.LocalDateTime;

import com.tsl.model.MessageType;
import com.tsl.model.Role;
import com.tsl.model.TripMessage;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripMessageResponse {
    private String id;
    private String conversationId;
    private String bookingId;
    private String senderId;
    private Role senderRole;
    private String senderDisplayName;
    private String body;
    private MessageType type;
    private LocalDateTime createdAt;

    public static TripMessageResponse from(TripMessage m) {
        return TripMessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .bookingId(m.getBookingId())
                .senderId(m.getSenderId())
                .senderRole(m.getSenderRole())
                .senderDisplayName(m.getSenderDisplayName())
                .body(m.getBody())
                .type(m.getType())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
