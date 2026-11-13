package com.listingscore.imports.api;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CatalogTextTest {
    @Test
    void exportedLocalizedAdviceKeepsUntrustedCellsEscapedAndStoredDataIntact() {
        IssueResponse original = new IssueResponse(2, "=SUM(1,2)", "TITLE_REQUIRED", Severity.HIGH, "title",
                "Product title is missing.", "Add a factual, customer-facing title.");
        ImportResponse report = new ImportResponse(UUID.randomUUID(), "original.csv", "COMPLETED", 1, 85,
                new SummaryResponse(0, 1, 0, 0), List.of("sku", "title"), List.of(original), Instant.now());
        String chinese = CatalogText.export(report, Locale.SIMPLIFIED_CHINESE);
        assertTrue(chinese.contains("\"'=SUM(1,2)\""));
        assertTrue(chinese.contains("缺少商品标题。"));
        assertEquals("Product title is missing.", report.issues().get(0).message());
        assertTrue(CatalogText.export(report, Locale.ENGLISH).contains("Product title is missing."));
    }

    @Test
    void unknownRuleGetsChineseFallbackWithoutChangingItsMachineCode() {
        IssueResponse original = new IssueResponse(2, "SKU-1", "FUTURE_RULE", Severity.MEDIUM, "new_field",
                "A new server rule message.", "New English advice.");
        IssueResponse chinese = CatalogText.issue(original, Locale.SIMPLIFIED_CHINESE);
        assertEquals("FUTURE_RULE", chinese.ruleId());
        assertEquals("new_field", chinese.field());
        assertEquals("检测到商品数据问题。", chinese.message());
        assertEquals(original, CatalogText.issue(original, Locale.ENGLISH));
    }
}
