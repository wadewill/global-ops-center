package com.listingscore.imports.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "catalog_imports")
public class CatalogImport {
    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;
    @Column(nullable = false)
    private String sourceName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportStatus status;
    @Column(nullable = false)
    private int totalRows;
    @Column(nullable = false)
    private int catalogScore;
    @Column(nullable = false)
    private Instant createdAt;
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String analysisJson;
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String exportCsv;

    protected CatalogImport() {
    }

    public CatalogImport(UUID id, String sourceName, int totalRows, int catalogScore) {
        this.id = id;
        this.sourceName = sourceName;
        this.status = ImportStatus.SUCCEEDED;
        this.totalRows = totalRows;
        this.catalogScore = catalogScore;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getSourceName() { return sourceName; }
    public ImportStatus getStatus() { return status; }
    public int getTotalRows() { return totalRows; }
    public int getCatalogScore() { return catalogScore; }
    public Instant getCreatedAt() { return createdAt; }
    public String getAnalysisJson() { return analysisJson; }
    public String getExportCsv() { return exportCsv; }

    public void saveAnalysis(String analysisJson, String exportCsv) {
        this.analysisJson = analysisJson;
        this.exportCsv = exportCsv;
    }
}
