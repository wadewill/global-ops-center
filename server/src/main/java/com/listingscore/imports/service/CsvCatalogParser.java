package com.listingscore.imports.service;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
class CsvCatalogParser {
    private static final Map<String, String> ALIASES = Map.ofEntries(
            Map.entry("sku", "sku"), Map.entry("id", "sku"),
            Map.entry("title", "title"), Map.entry("name", "title"), Map.entry("product_title", "title"),
            Map.entry("description", "description"), Map.entry("body", "description"), Map.entry("body_html", "description"),
            Map.entry("price", "price"), Map.entry("regular_price", "price"),
            Map.entry("image", "image_url"), Map.entry("image_url", "image_url"), Map.entry("image_link", "image_url"),
            Map.entry("availability", "availability"), Map.entry("stock_status", "availability"),
            Map.entry("brand", "brand"), Map.entry("gtin", "gtin"), Map.entry("mpn", "mpn"),
            Map.entry("item_group_id", "item_group_id"), Map.entry("parent_sku", "item_group_id"),
            Map.entry("color", "color"), Map.entry("size", "size")
    );

    ParsedCatalog parse(Reader reader) throws IOException {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .setIgnoreEmptyLines(true)
                .build();
        try (CSVParser parser = new CSVParser(reader, format)) {
            Map<String, String> mapping = buildMapping(parser.getHeaderMap().keySet());
            if (mapping.isEmpty()) {
                throw new IllegalArgumentException("No supported product fields were found in the header row.");
            }
            List<ProductRow> rows = new ArrayList<>();
            for (CSVRecord record : parser) {
                Map<String, String> fields = new LinkedHashMap<>();
                for (Map.Entry<String, String> entry : mapping.entrySet()) {
                    fields.put(entry.getValue(), record.get(entry.getKey()));
                }
                rows.add(new ProductRow((int) record.getRecordNumber() + 1, fields));
            }
            if (rows.isEmpty()) {
                throw new IllegalArgumentException("The file has a header but no product rows.");
            }
            return new ParsedCatalog(rows, List.copyOf(mapping.values()));
        }
    }

    private Map<String, String> buildMapping(Iterable<String> headers) {
        Map<String, String> mapping = new LinkedHashMap<>();
        for (String header : headers) {
            String normalized = header.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
            String canonical = ALIASES.get(normalized);
            if (canonical != null && !mapping.containsValue(canonical)) {
                mapping.put(header, canonical);
            }
        }
        return mapping;
    }

    record ParsedCatalog(List<ProductRow> rows, List<String> mappedFields) {
    }
}
