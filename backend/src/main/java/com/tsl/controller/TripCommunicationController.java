package com.tsl.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.CallSignalRequest;
import com.tsl.dto.request.SendTripMessageRequest;
import com.tsl.dto.response.CallSignalResponse;
import com.tsl.dto.response.TripCallSessionResponse;
import com.tsl.dto.response.TripConversationResponse;
import com.tsl.dto.response.TripMessageResponse;
import com.tsl.model.Role;
import com.tsl.service.TripCommunicationService;
import com.tsl.util.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/communications")
@RequiredArgsConstructor
public class TripCommunicationController {

    private final TripCommunicationService communicationService;

    @GetMapping("/conversations")
    public List<TripConversationResponse> myConversations(Authentication authentication) {
        return communicationService.listMyConversations(
                authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
    }

    @GetMapping("/conversations/by-booking/{bookingId}")
    public TripConversationResponse byBooking(
            @PathVariable String bookingId, Authentication authentication) {
        return communicationService.getByBookingId(
                bookingId, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
    }

    @GetMapping("/conversations/{id}")
    public TripConversationResponse getConversation(
            @PathVariable String id, Authentication authentication) {
        return communicationService.getConversation(
                id, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
    }

    @GetMapping("/conversations/{id}/messages")
    public List<TripMessageResponse> getMessages(
            @PathVariable String id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            Authentication authentication) {
        return communicationService.getMessages(
                id, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)), since);
    }

    @PostMapping("/conversations/{id}/messages")
    public TripMessageResponse sendMessage(
            @PathVariable String id,
            @Valid @RequestBody SendTripMessageRequest request,
            Authentication authentication) {
        return communicationService.sendMessage(
                id,
                authentication.getName(),
                Role.valueOf(SecurityUtils.extractRole(authentication)),
                request);
    }

    @PostMapping("/conversations/{id}/calls")
    public TripCallSessionResponse initiateCall(
            @PathVariable String id, Authentication authentication) {
        return communicationService.initiateCall(
                id, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
    }

    @GetMapping("/conversations/{id}/calls/active")
    public ResponseEntity<TripCallSessionResponse> getActiveCall(
            @PathVariable String id, Authentication authentication) {
        TripCallSessionResponse call = communicationService.getActiveCall(
                id, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
        return call != null ? ResponseEntity.ok(call) : ResponseEntity.noContent().build();
    }

    @PutMapping("/calls/{callId}/accept")
    public TripCallSessionResponse acceptCall(
            @PathVariable String callId, Authentication authentication) {
        return communicationService.acceptCall(
                callId, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
    }

    @PutMapping("/calls/{callId}/decline")
    public TripCallSessionResponse declineCall(
            @PathVariable String callId, Authentication authentication) {
        return communicationService.declineCall(
                callId, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
    }

    @PutMapping("/calls/{callId}/end")
    public TripCallSessionResponse endCall(
            @PathVariable String callId, Authentication authentication) {
        return communicationService.endCall(
                callId, authentication.getName(), Role.valueOf(SecurityUtils.extractRole(authentication)));
    }

    @PostMapping("/calls/{callId}/signals")
    public CallSignalResponse postSignal(
            @PathVariable String callId,
            @Valid @RequestBody CallSignalRequest request,
            Authentication authentication) {
        return communicationService.postSignal(
                callId,
                authentication.getName(),
                Role.valueOf(SecurityUtils.extractRole(authentication)),
                request);
    }

    @GetMapping("/calls/{callId}/signals")
    public List<CallSignalResponse> getSignals(
            @PathVariable String callId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after,
            Authentication authentication) {
        return communicationService.getSignals(
                callId,
                authentication.getName(),
                Role.valueOf(SecurityUtils.extractRole(authentication)),
                after);
    }
}
