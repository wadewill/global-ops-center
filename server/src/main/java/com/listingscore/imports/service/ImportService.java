package com.listingscore.imports.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.listingscore.imports.api.ImportResponse;
import com.listingscore.imports.api.IssueResponse;
import com.listingscore.imports.api.Severity;
import com.listingscore.imports.api.SummaryResponse;
import com.listingscore.imports.domain.CatalogImport;
import com.listingscore.imports.domain.CatalogImportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.listingscore.imports.api.ImportHistoryResponse;

@Service
public class ImportService {
    private final CsvCatalogParser parser;
    private final RuleEngine ruleEngine;
    private final CatalogImportRepository repository;
    private final ObjectMapper objectMapper;

    public ImportService(CsvCatalogParser parser, RuleEngine ruleEngine, CatalogImportRepository repository, ObjectMapper objectMapper) {
        this.parser = parser;
        this.ruleEngine = ruleEngine;
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ImportResponse analyze(MultipartFile file, UUID ownerId) {
        validate(file);
        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CsvCatalogParser.ParsedCatalog catalog = parser.parse(reader);
            List<IssueResponse> issues = ruleEngine.evaluate(catalog.rows());
            SummaryResponse summary = summarize(issues);
            int score = calculateScore(catalog.rows().size(), issues);
            UUID id = UUID.randomUUID();
            CatalogImport catalogImport = new CatalogImport(id, ownerId, file.getOriginalFilename(), catalog.rows().size(), score);
            List<IssueResponse> orderedIssues = issues.stream()
                    .sorted(Comparator.comparing(IssueResponse::severity).thenComparing(IssueResponse::rowNumber))
                    .toList();
            ImportResponse response = new ImportResponse(catalogImport.getId(), catalogImport.getSourceName(), catalogImport.getStatus().name(), catalogImport.getTotalRows(), catalogImport.getCatalogScore(), summary, catalog.mappedFields(), orderedIssues, catalogImport.getCreatedAt());
            catalogImport.saveAnalysis(writeResponse(response), exportCsv(catalog.rows(), orderedIssues));
            repository.save(catalogImport);
            return response;
        } catch (IOException ex) {
            throw new IllegalArgumentException("The CSV file could not be read.");
        }
    }

    public ImportResponse get(UUID id, UUID ownerId) {
        CatalogImport item = owned(id, ownerId);
        return readResponse(item.getAnalysisJson(), id);
    }

    public String export(UUID id, UUID ownerId) { return owned(id, ownerId).getExportCsv(); }
    public List<ImportHistoryResponse> list(UUID ownerId) {
        return repository.findTop12ByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(item -> new ImportHistoryResponse(item.getId(), item.getSourceName(), item.getTotalRows(), item.getCatalogScore(), item.getCreatedAt())).toList();
    }

    private CatalogImport owned(UUID id, UUID ownerId) { return repository.findByIdAndOwnerId(id, ownerId).orElseThrow(() -> new ImportNotFoundException(id)); }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Choose a non-empty CSV file.");
        if (file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("The file must be 5 MB or smaller.");
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!name.endsWith(".csv")) throw new IllegalArgumentException("This MVP accepts UTF-8 CSV files only.");
    }

    private SummaryResponse summarize(List<IssueResponse> issues) {
        EnumMap<Severity, Integer> totals = new EnumMap<>(Severity.class);
        for (Severity severity : Severity.values()) totals.put(severity, 0);
        issues.forEach(issue -> totals.merge(issue.severity(), 1, Integer::sum));
        return new SummaryResponse(totals.get(Severity.BLOCKER), totals.get(Severity.HIGH), totals.get(Severity.MEDIUM), totals.get(Severity.OPPORTUNITY));
    }

    private int calculateScore(int rows, List<IssueResponse> issues) {
        if (rows == 0) return 0;
        int penalty = issues.stream().mapToInt(issue -> issue.severity().penalty()).sum();
        return Math.max(0, Math.min(100, 100 - Math.round((float) penalty / rows)));
    }

    private String exportCsv(List<ProductRow> rows, List<IssueResponse> issues) {
        Map<Integer, List<IssueResponse>> byRow = issues.stream().collect(Collectors.groupingBy(IssueResponse::rowNumber));
        StringBuilder builder = new StringBuilder("row_number,sku,rule_id,severity,field,message,repair_action\n");
        for (ProductRow row : rows) {
            for (IssueResponse issue : byRow.getOrDefault(row.rowNumber(), List.of())) {
                builder.append(issue.rowNumber()).append(',')
                        .append(csv(issue.sku())).append(',')
                        .append(csv(issue.ruleId())).append(',')
                        .append(csv(issue.severity().name())).append(',')
                        .append(csv(issue.field())).append(',')
                        .append(csv(issue.message())).append(',')
                        .append(csv(issue.repairAction())).append('\n');
            }
        }
        return builder.toString();
    }

    private String csv(String value) {
        String safe = value == null ? "" : value;
        if (safe.startsWith("=") || safe.startsWith("+") || safe.startsWith("-") || safe.startsWith("@")) safe = "'" + safe;
        return '"' + safe.replace("\"", "\"\"") + '"';
    }

    private String writeResponse(ImportResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Unable to persist the import analysis.", ex);
        }
    }

    private ImportResponse readResponse(String analysisJson, UUID id) {
        try {
            return objectMapper.readValue(analysisJson, ImportResponse.class);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Stored analysis for import %s is invalid.".formatted(id), ex);
        }
    }

    public static class ImportNotFoundException extends RuntimeException {
        public ImportNotFoundException(UUID id) { super("Import %s was not found.".formatted(id)); }
    }
}
