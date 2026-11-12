package com.listingscore.connections.api;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record ConnectionRequest(
        @NotBlank @Size(max=40) String platform,
        @NotBlank @Size(max=100) String label,
        @NotBlank @Size(max=32) String authType,
        @Size(max=500) String endpointUrl,
        @NotBlank @Size(max=4096) String credential) { }
