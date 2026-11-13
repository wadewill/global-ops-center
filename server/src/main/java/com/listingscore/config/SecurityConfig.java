package com.listingscore.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.listingscore.auth.service.JwtService;
import com.listingscore.common.ApiErrorCode;
import com.listingscore.common.ApiLanguage;
import com.listingscore.common.ApiProblems;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean UserDetailsService userDetailsService() { return new InMemoryUserDetailsManager(); }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter, ObjectMapper objectMapper) throws Exception {
        return http.csrf(csrf -> csrf.disable()).cors(cors -> { }).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/api/v1/auth/**", "/api/v1/imports/template").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, ex) -> writeProblem(request, response, objectMapper, ApiErrorCode.AUTHENTICATION_REQUIRED))
                        .accessDeniedHandler((request, response, ex) -> writeProblem(request, response, objectMapper, ApiErrorCode.ACCESS_DENIED)))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).build();
    }

    private void writeProblem(HttpServletRequest request, HttpServletResponse response, ObjectMapper objectMapper, ApiErrorCode code) throws IOException {
        var locale = ApiLanguage.resolve(request);
        response.setStatus(code.status().value());
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/problem+json");
        response.setHeader("Content-Language", ApiLanguage.tag(locale));
        objectMapper.writeValue(response.getOutputStream(), ApiProblems.create(code, locale));
    }

    @Component
    static class JwtAuthenticationFilter extends OncePerRequestFilter {
        private final JwtService jwt;
        JwtAuthenticationFilter(JwtService jwt) { this.jwt = jwt; }
        @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                try {
                    UUID userId = jwt.parseUserId(header.substring(7));
                    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(userId, null, List.of()));
                } catch (JwtException | IllegalArgumentException ignored) { SecurityContextHolder.clearContext(); }
            }
            chain.doFilter(request, response);
        }
    }
}
