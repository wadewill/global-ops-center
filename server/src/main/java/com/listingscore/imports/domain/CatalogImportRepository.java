package com.listingscore.imports.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface CatalogImportRepository extends JpaRepository<CatalogImport, UUID> {
    Optional<CatalogImport> findByIdAndOwnerId(UUID id, UUID ownerId);
    List<CatalogImport> findTop12ByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}
