package com.listingscore.imports.api;

import java.time.Instant;
import java.util.UUID;

public record ImportHistoryResponse(UUID importId, String sourceName, int totalRows, int catalogScore, Instant createdAt) { }
