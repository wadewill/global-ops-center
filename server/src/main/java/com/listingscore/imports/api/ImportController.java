package com.listingscore.imports.api;

import com.listingscore.imports.service.ImportService;
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

    public ImportController(ImportService importService) {
        this.importService = importService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResponse> create(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(201).body(importService.analyze(file));
    }

    @GetMapping("/{id}")
    public ImportResponse get(@PathVariable UUID id) {
        return importService.get(id);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable UUID id) {
        byte[] content = importService.export(id).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("listingscore-repair-package.csv").build().toString())
                .body(content);
    }
}
