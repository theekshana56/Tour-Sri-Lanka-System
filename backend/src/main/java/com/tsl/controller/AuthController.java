package com.tsl.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.LoginRequest;
import com.tsl.dto.request.LogoutRequest;
import com.tsl.dto.request.RefreshTokenRequest;
import com.tsl.dto.request.RegisterRequest;
import com.tsl.dto.response.AuthResponse;
import com.tsl.dto.response.MessageResponse;
import com.tsl.dto.response.TokenRefreshResponse;
import com.tsl.dto.response.UserResponse;
import com.tsl.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public TokenRefreshResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public MessageResponse logout(@Valid @RequestBody LogoutRequest request, Authentication authentication) {
        authService.logout(authentication.getName(), request);
        return MessageResponse.builder().message("Logged out successfully").build();
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from(authService.getCurrentUser(authentication.getName()));
    }
}
