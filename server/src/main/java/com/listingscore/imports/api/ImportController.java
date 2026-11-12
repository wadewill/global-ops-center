package com.listingscore.imports.api;

import com.listingscore.imports.service.ImportService;
import com.listingscore.auth.service.AuthService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/imports")
public class ImportController {
    private final ImportService importService;
    private final AuthService authService;

    public ImportController(ImportService importService, AuthService authService) {
        this.importService = importService;
        this.authService = authService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResponse> create(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(201).body(importService.analyze(file, authService.currentUser().getId()));
    }

    @GetMapping
    public java.util.List<ImportHistoryResponse> list() { return importService.list(authService.currentUser().getId()); }

    @GetMapping("/{id}")
    public ImportResponse get(@PathVariable UUID id) {
        return importService.get(id, authService.currentUser().getId());
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable UUID id) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("listingscore-repair-package.csv").build().toString())
                .body(importService.export(id, authService.currentUser().getId()).getBytes(StandardCharsets.UTF_8));
    }
}
