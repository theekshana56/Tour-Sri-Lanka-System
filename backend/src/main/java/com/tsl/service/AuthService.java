package com.tsl.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tsl.config.JwtProperties;
import com.tsl.dto.request.LoginRequest;
import com.tsl.dto.request.LogoutRequest;
import com.tsl.dto.request.RefreshTokenRequest;
import com.tsl.dto.request.RegisterRequest;
import com.tsl.dto.response.AuthResponse;
import com.tsl.dto.response.TokenRefreshResponse;
import com.tsl.dto.response.UserResponse;
import com.tsl.exception.BadRequestException;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.exception.UnauthorizedException;
import com.tsl.model.RefreshToken;
import com.tsl.model.Role;
import com.tsl.model.User;
import com.tsl.repository.RefreshTokenRepository;
import com.tsl.repository.UserRepository;
import com.tsl.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .isActive(true)
                .isAvailable(true)
                .build();
        user = userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = persistRefreshToken(user.getId());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.from(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account has been deactivated");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = persistRefreshToken(user.getId());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.from(user))
                .build();
    }

    public TokenRefreshResponse refresh(RefreshTokenRequest request) {
        RefreshToken tokenRecord = refreshTokenRepository.findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (tokenRecord.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRecord.setRevoked(true);
            refreshTokenRepository.save(tokenRecord);
            throw new UnauthorizedException("Refresh token expired");
        }

        User user = userRepository.findById(tokenRecord.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        tokenRecord.setRevoked(true);
        refreshTokenRepository.save(tokenRecord);

        return TokenRefreshResponse.builder()
                .accessToken(jwtUtil.generateAccessToken(user))
                .refreshToken(persistRefreshToken(user.getId()))
                .build();
    }

    public void logout(String userId, LogoutRequest request) {
        RefreshToken tokenRecord = refreshTokenRepository.findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!tokenRecord.getUserId().equals(userId)) {
            throw new UnauthorizedException("Refresh token does not belong to authenticated user");
        }
        tokenRecord.setRevoked(true);
        refreshTokenRepository.save(tokenRecord);
    }

    public User getCurrentUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String persistRefreshToken(String userId) {
        String rawToken = jwtUtil.generateRefreshToken();
        RefreshToken token = RefreshToken.builder()
                .token(rawToken)
                .userId(userId)
                .expiryDate(LocalDateTime.now().plus(jwtProperties.getRefreshExpirationMs(), ChronoUnit.MILLIS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(token);
        return rawToken;
    }
}
