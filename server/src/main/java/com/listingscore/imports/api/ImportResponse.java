package com.listingscore.imports.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ImportResponse(
        UUID importId,
        String sourceName,
        String status,
        int totalRows,
        int catalogScore,
        SummaryResponse summary,
        List<String> mappedFields,
        List<IssueResponse> issues,
        Instant createdAt
) {
}
