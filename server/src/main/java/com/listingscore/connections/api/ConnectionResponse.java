package com.listingscore.connections.api;
import java.time.Instant;
import java.util.UUID;
public record ConnectionResponse(UUID id, String platform, String label, String authType, String endpointUrl, String status, Instant lastCheckedAt, Instant createdAt) { }
