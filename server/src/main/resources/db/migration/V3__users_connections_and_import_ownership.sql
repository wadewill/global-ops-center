CREATE TABLE app_users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    display_name VARCHAR(80) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(24) NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_connections (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    platform VARCHAR(40) NOT NULL,
    label VARCHAR(100) NOT NULL,
    auth_type VARCHAR(32) NOT NULL,
    endpoint_url VARCHAR(500),
    credential_ciphertext LONGTEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'CONFIGURED',
    last_checked_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_api_connections_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    INDEX idx_api_connections_user (user_id)
);

ALTER TABLE catalog_imports ADD COLUMN owner_id CHAR(36) NULL;
ALTER TABLE catalog_imports ADD CONSTRAINT fk_catalog_import_owner FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE SET NULL;
CREATE INDEX idx_catalog_import_owner_created ON catalog_imports(owner_id, created_at);
