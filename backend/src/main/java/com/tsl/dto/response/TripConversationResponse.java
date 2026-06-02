package com.tsl.dto.response;

import java.time.LocalDateTime;

import com.tsl.model.ConversationStatus;
import com.tsl.model.TripConversation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripConversationResponse {
    private String id;
    private String bookingId;
    private String bookingNumber;
    private String customerId;
    private String customerName;
    private String driverId;
    private String driverName;
    private ConversationStatus status;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private long unreadCount;

    public static TripConversationResponse from(TripConversation c, long unreadCount) {
        return TripConversationResponse.builder()
                .id(c.getId())
                .bookingId(c.getBookingId())
                .bookingNumber(c.getBookingNumber())
                .customerId(c.getCustomerId())
                .customerName(c.getCustomerName())
                .driverId(c.getDriverId())
                .driverName(c.getDriverName())
                .status(c.getStatus())
                .lastMessageAt(c.getLastMessageAt())
                .createdAt(c.getCreatedAt())
                .unreadCount(unreadCount)
                .build();
    }
}
