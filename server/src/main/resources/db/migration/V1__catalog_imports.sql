CREATE TABLE catalog_imports (
    id CHAR(36) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    total_rows INT NOT NULL,
    catalog_score INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
