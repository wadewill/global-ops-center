package com.listingscore.auth.api;

import com.listingscore.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import com.listingscore.auth.service.AuthRateLimiter;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthRateLimiter rateLimiter;
    public AuthController(AuthService authService, AuthRateLimiter rateLimiter) { this.authService = authService; this.rateLimiter = rateLimiter; }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request, HttpServletRequest servletRequest) {
        rateLimiter.register(clientIp(servletRequest), request.email().trim().toLowerCase());
        return ResponseEntity.status(201).body(authService.register(request));
    }
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request, HttpServletRequest servletRequest) { rateLimiter.login(clientIp(servletRequest), request.email().trim().toLowerCase()); return authService.login(request); }
    @GetMapping("/me")
    public AuthResponse.UserResponse me() { return authService.me(); }
    private String clientIp(HttpServletRequest request) { String forwarded = request.getHeader("X-Real-IP"); return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded; }
}
