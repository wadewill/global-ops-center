package com.listingscore.imports.service;

import com.listingscore.imports.api.IssueResponse;
import com.listingscore.imports.api.Severity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
class RuleEngine {
    List<IssueResponse> evaluate(List<ProductRow> rows) {
        List<IssueResponse> issues = new ArrayList<>();
        Map<String, Integer> skuOccurrences = new HashMap<>();
        for (ProductRow row : rows) {
            if (!row.get("sku").isBlank()) {
                skuOccurrences.merge(row.get("sku"), 1, Integer::sum);
            }
        }
        for (ProductRow row : rows) {
            String sku = row.get("sku");
            required(row, issues, sku, "SKU_REQUIRED", Severity.BLOCKER, "sku", "SKU is missing.", "Add a unique SKU before publishing.");
            required(row, issues, sku, "TITLE_REQUIRED", Severity.HIGH, "title", "Product title is missing.", "Add a factual, customer-facing title.");
            required(row, issues, sku, "PRICE_REQUIRED", Severity.HIGH, "price", "Price is missing.", "Add a valid selling price.");
            required(row, issues, sku, "IMAGE_REQUIRED", Severity.HIGH, "image_url", "Primary image URL is missing.", "Add a publicly reachable primary image URL.");
            required(row, issues, sku, "AVAILABILITY_REQUIRED", Severity.MEDIUM, "availability", "Availability is missing.", "Add an availability or stock status value.");
            required(row, issues, sku, "DESCRIPTION_REQUIRED", Severity.OPPORTUNITY, "description", "Description is missing.", "Add factual benefits, specifications, and use context.");
            if (!sku.isBlank() && skuOccurrences.getOrDefault(sku, 0) > 1) {
                issue(row, issues, sku, "SKU_DUPLICATE", Severity.HIGH, "sku", "SKU appears more than once.", "Make each variant SKU unique.");
            }
            validatePrice(row, issues, sku);
            validateImageUrl(row, issues, sku);
            validateGoogleIdentifiers(row, issues, sku);
            validateVariant(row, issues, sku);
        }
        return issues;
    }

    private void required(ProductRow row, List<IssueResponse> issues, String sku, String id, Severity severity, String field, String message, String action) {
        if (row.get(field).isBlank()) issue(row, issues, sku, id, severity, field, message, action);
    }

    private void validatePrice(ProductRow row, List<IssueResponse> issues, String sku) {
        String price = row.get("price");
        if (price.isBlank()) return;
        try {
            if (new BigDecimal(price.replaceAll("[^0-9.-]", "")).signum() <= 0) {
                issue(row, issues, sku, "PRICE_INVALID", Severity.HIGH, "price", "Price must be greater than zero.", "Use a positive numeric price.");
            }
        } catch (NumberFormatException ex) {
            issue(row, issues, sku, "PRICE_INVALID", Severity.HIGH, "price", "Price is not a number.", "Use a numeric price such as 19.99.");
        }
    }

    private void validateImageUrl(ProductRow row, List<IssueResponse> issues, String sku) {
        String url = row.get("image_url");
        if (!url.isBlank() && !(url.startsWith("https://") || url.startsWith("http://"))) {
            issue(row, issues, sku, "IMAGE_URL_INVALID", Severity.MEDIUM, "image_url", "Image URL must start with http:// or https://.", "Use a public HTTP(S) image URL.");
        }
    }

    private void validateGoogleIdentifiers(ProductRow row, List<IssueResponse> issues, String sku) {
        String gtin = row.get("gtin");
        String brand = row.get("brand");
        if (!gtin.isBlank() && brand.isBlank()) {
            issue(row, issues, sku, "GOOGLE_BRAND_WITH_GTIN", Severity.MEDIUM, "brand", "Brand is missing while GTIN is present.", "Add the manufacturer brand for Google readiness.");
        }
        if (!gtin.isBlank() && !gtin.matches("\\d{8}|\\d{12}|\\d{13}|\\d{14}")) {
            issue(row, issues, sku, "GTIN_FORMAT", Severity.MEDIUM, "gtin", "GTIN is not 8, 12, 13, or 14 digits.", "Confirm the manufacturer-issued GTIN.");
        }
    }

    private void validateVariant(ProductRow row, List<IssueResponse> issues, String sku) {
        boolean hasVariantAttribute = !row.get("color").isBlank() || !row.get("size").isBlank();
        if (hasVariantAttribute && row.get("item_group_id").isBlank()) {
            issue(row, issues, sku, "VARIANT_GROUP_MISSING", Severity.MEDIUM, "item_group_id", "Color or size is present without an item group.", "Add an item_group_id shared by related variants.");
        }
    }

    private void issue(ProductRow row, List<IssueResponse> issues, String sku, String id, Severity severity, String field, String message, String action) {
        issues.add(new IssueResponse(row.rowNumber(), sku, id, severity, field, message, action));
    }
}
