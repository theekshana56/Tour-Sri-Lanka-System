package com.tsl.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.tsl.model.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "trip_messages")
public class TripMessage {

    @Id
    private String id;

    @Indexed
    private String conversationId;

    private String bookingId;

    private String senderId;
    private Role senderRole;
    private String senderDisplayName;

    private String body;

    @Builder.Default
    private MessageType type = MessageType.TEXT;

    @CreatedDate
    private LocalDateTime createdAt;
}
