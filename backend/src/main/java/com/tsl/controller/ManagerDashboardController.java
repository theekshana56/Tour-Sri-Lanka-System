package com.tsl.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.response.ManagerDashboardResponse;
import com.tsl.service.ManagerDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/manager/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ManagerDashboardController {

    private final ManagerDashboardService managerDashboardService;

    @GetMapping
    public ManagerDashboardResponse getDashboard(Authentication authentication) {
        return managerDashboardService.getDashboard(authentication.getName());
    }
}

