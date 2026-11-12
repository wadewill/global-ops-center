package com.listingscore.imports.service;

import java.util.Map;

record ProductRow(int rowNumber, Map<String, String> fields) {
    String get(String name) {
        return fields.getOrDefault(name, "").trim();
    }
}
