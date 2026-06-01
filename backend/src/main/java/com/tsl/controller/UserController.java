package com.tsl.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tsl.dto.request.AdminCreateUserRequest;
import com.tsl.dto.request.AdminUpdateUserRequest;
import com.tsl.dto.response.UserResponse;
import com.tsl.model.Role;
import com.tsl.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserResponse create(@Valid @RequestBody AdminCreateUserRequest request) {
        return UserResponse.from(userService.createAdminUser(request));
    }

    @GetMapping
    public Page<UserResponse> list(
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return userService.listUsers(role, page, size).map(UserResponse::from);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable String id, @Valid @RequestBody AdminUpdateUserRequest request) {
        return UserResponse.from(userService.updateUser(id, request));
    }

    @PutMapping("/{id}/toggle-status")
    public UserResponse toggleStatus(@PathVariable String id) {
        return UserResponse.from(userService.toggleStatus(id));
    }
}
