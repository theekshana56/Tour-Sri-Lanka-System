package com.tsl.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
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
@Document(collection = "trip_call_sessions")
public class TripCallSession {

    @Id
    private String id;

    @Indexed
    private String conversationId;

    private String bookingId;

    private String initiatorId;
    private Role initiatorRole;

    private CallStatus status;

    private LocalDateTime answeredAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;

    @CreatedDate
    private LocalDateTime createdAt;
}
