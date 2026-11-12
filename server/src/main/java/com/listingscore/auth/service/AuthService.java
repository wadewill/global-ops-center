package com.listingscore.auth.service;

import com.listingscore.auth.api.AuthRequest;
import com.listingscore.auth.api.AuthResponse;
import com.listingscore.auth.domain.AppUser;
import com.listingscore.auth.domain.AppUserRepository;
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
        if (users.existsByEmail(email)) throw new IllegalArgumentException("An account with this email already exists.");
        if (request.displayName() == null || request.displayName().isBlank()) throw new IllegalArgumentException("Enter a display name.");
        AppUser user = users.save(new AppUser(UUID.randomUUID(), email, request.displayName().trim(), passwords.encode(request.password())));
        return response(user);
    }
    public AuthResponse login(AuthRequest request) {
        AppUser user = users.findByEmail(normalized(request.email())).orElseThrow(() -> new IllegalArgumentException("Email or password is incorrect."));
        if (!passwords.matches(request.password(), user.getPasswordHash())) throw new IllegalArgumentException("Email or password is incorrect.");
        return response(user);
    }
    public AuthResponse.UserResponse me() { return userResponse(currentUser()); }
    public AppUser currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UUID id)) throw new IllegalStateException("No authenticated user.");
        return users.findById(id).orElseThrow(() -> new IllegalStateException("Account no longer exists."));
    }
    private AuthResponse response(AppUser user) { return new AuthResponse(jwt.create(user.getId(), user.getEmail()), "Bearer", userResponse(user)); }
    private AuthResponse.UserResponse userResponse(AppUser user) { return new AuthResponse.UserResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole()); }
    private String normalized(String email) { return email.trim().toLowerCase(Locale.ROOT); }
}
