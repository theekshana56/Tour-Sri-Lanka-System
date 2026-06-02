package com.tsl.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.response.TripCallSessionResponse;
import com.tsl.dto.response.TripConversationResponse;
import com.tsl.dto.response.TripMessageResponse;
import com.tsl.model.Role;
import com.tsl.service.TripCommunicationService;
import com.tsl.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/communications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminCommunicationController {

    private final TripCommunicationService communicationService;

    @GetMapping("/conversations")
    public List<TripConversationResponse> listConversations() {
        return communicationService.listAllForAdmin();
    }

    @GetMapping("/conversations/{id}/messages")
    public List<TripMessageResponse> auditMessages(
            @PathVariable String id, Authentication authentication) {
        return communicationService.getMessages(
                id,
                authentication.getName(),
                Role.valueOf(SecurityUtils.extractRole(authentication)),
                null);
    }

    @GetMapping("/calls")
    public List<TripCallSessionResponse> callLogs(
            @RequestParam(required = false) String conversationId) {
        return communicationService.listCallHistoryForAdmin(conversationId);
    }
}
