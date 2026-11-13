package com.listingscore.imports.api;

import com.listingscore.imports.service.ImportService;
import com.listingscore.auth.service.AuthService;
import com.listingscore.common.ApiLanguage;
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
import java.util.Locale;

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
    public ResponseEntity<ImportResponse> create(@RequestPart("file") MultipartFile file, Locale locale) {
        return ResponseEntity.status(201).body(CatalogText.report(importService.analyze(file, authService.currentUser().getId()), locale));
    }

    @GetMapping
    public java.util.List<ImportHistoryResponse> list() { return importService.list(authService.currentUser().getId()); }

    @GetMapping("/template")
    public ResponseEntity<byte[]> template(Locale locale) {
        String example = ApiLanguage.isChinese(locale)
                ? "SKU-001,示例商品,填写商品材质与主要特点,19.99,https://cdn.example.com/image.jpg,in_stock,示例品牌,1234567890123,GROUP-001,蓝色,M\n"
                : "SKU-001,Example product,Describe key material and benefits,19.99,https://cdn.example.com/image.jpg,in_stock,Example Brand,1234567890123,GROUP-001,Blue,M\n";
        String csv = "sku,title,description,price,image_url,availability,brand,gtin,item_group_id,color,size\n" + example;
        return ResponseEntity.ok().contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("listingscore-catalog-template.csv").build().toString()).body(csv.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/{id}")
    public ImportResponse get(@PathVariable UUID id, Locale locale) {
        return CatalogText.report(importService.get(id, authService.currentUser().getId()), locale);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable UUID id, Locale locale) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("listingscore-repair-package.csv").build().toString())
                .body(CatalogText.export(importService.get(id, authService.currentUser().getId()), locale).getBytes(StandardCharsets.UTF_8));
    }
}
