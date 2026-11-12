package com.listingscore.auth.api;

import java.util.UUID;

public record AuthResponse(String accessToken, String tokenType, UserResponse user) {
    public record UserResponse(UUID id, String email, String displayName, String role) { }
}
