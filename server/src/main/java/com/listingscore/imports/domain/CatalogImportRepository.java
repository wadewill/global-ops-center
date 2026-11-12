package com.listingscore.imports.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CatalogImportRepository extends JpaRepository<CatalogImport, UUID> {
}
