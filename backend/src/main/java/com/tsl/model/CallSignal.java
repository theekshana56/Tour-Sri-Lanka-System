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
@Document(collection = "call_signals")
public class CallSignal {

    @Id
    private String id;

    @Indexed
    private String callSessionId;

    private String fromUserId;

    /** offer, answer, ice-candidate */
    private String signalType;

    private String payload;

    @CreatedDate
    private LocalDateTime createdAt;
}
