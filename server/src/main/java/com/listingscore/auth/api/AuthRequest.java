package com.listingscore.auth.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record AuthRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 12, max = 72) @Pattern(regexp = "(?=.*[A-Za-z])(?=.*\\d).+", message = "Password must include letters and numbers.") String password,
        @Size(min = 2, max = 80) String displayName) { }
