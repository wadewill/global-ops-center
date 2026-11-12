package com.listingscore.imports.api;

public record IssueResponse(
        int rowNumber,
        String sku,
        String ruleId,
        Severity severity,
        String field,
        String message,
        String repairAction
) {
}
