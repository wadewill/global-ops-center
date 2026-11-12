ALTER TABLE catalog_imports
    ADD COLUMN analysis_json LONGTEXT NOT NULL,
    ADD COLUMN export_csv LONGTEXT NOT NULL;
