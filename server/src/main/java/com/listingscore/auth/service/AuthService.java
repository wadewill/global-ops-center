package com.listingscore.auth.service;

import com.listingscore.auth.api.AuthRequest;
import com.listingscore.auth.api.AuthResponse;
import com.listingscore.auth.domain.AppUser;
import com.listingscore.auth.domain.AppUserRepository;
import com.listingscore.common.ApiErrorCode;
import com.listingscore.common.ApiException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    public AuthService(AppUserRepository users, PasswordEncoder passwords, JwtService jwt) { this.users = users; this.passwords = passwords; this.jwt = jwt; }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        String email = normalized(request.email());
        if (users.existsByEmail(email)) throw new ApiException(ApiErrorCode.EMAIL_ALREADY_EXISTS);
        if (request.displayName() == null || request.displayName().isBlank()) throw new ApiException(ApiErrorCode.DISPLAY_NAME_REQUIRED);
        AppUser user = users.save(new AppUser(UUID.randomUUID(), email, request.displayName().trim(), passwords.encode(request.password())));
        return response(user);
    }
    public AuthResponse login(AuthRequest request) {
        AppUser user = users.findByEmail(normalized(request.email())).orElseThrow(() -> new ApiException(ApiErrorCode.INVALID_CREDENTIALS));
        if (!passwords.matches(request.password(), user.getPasswordHash())) throw new ApiException(ApiErrorCode.INVALID_CREDENTIALS);
        return response(user);
    }
    public AuthResponse.UserResponse me() { return userResponse(currentUser()); }
    public AppUser currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication == null ? null : authentication.getPrincipal();
        if (!(principal instanceof UUID id)) throw new ApiException(ApiErrorCode.AUTHENTICATION_REQUIRED);
        return users.findById(id).orElseThrow(() -> new ApiException(ApiErrorCode.AUTHENTICATION_REQUIRED));
    }
    private AuthResponse response(AppUser user) { return new AuthResponse(jwt.create(user.getId(), user.getEmail()), "Bearer", userResponse(user)); }
    private AuthResponse.UserResponse userResponse(AppUser user) { return new AuthResponse.UserResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole()); }
    private String normalized(String email) { return email.trim().toLowerCase(Locale.ROOT); }
}
