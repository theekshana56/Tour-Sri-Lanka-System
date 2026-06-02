package com.tsl.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
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
@Document(collection = "trip_conversations")
public class TripConversation {

    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingId;

    private String bookingNumber;

    private String customerId;
    private String customerName;

    private String driverId;
    private String driverName;

    @Builder.Default
    private ConversationStatus status = ConversationStatus.ACTIVE;

    private LocalDateTime lastMessageAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
