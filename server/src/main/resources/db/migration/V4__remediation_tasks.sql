CREATE TABLE remediation_tasks (
    id CHAR(36) PRIMARY KEY,
    owner_id CHAR(36) NOT NULL,
    import_id CHAR(36) NOT NULL,
    rule_id VARCHAR(80) NOT NULL,
    severity VARCHAR(24) NOT NULL,
    sku VARCHAR(255),
    field_name VARCHAR(100) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    repair_action VARCHAR(1000) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_remediation_owner FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_remediation_import FOREIGN KEY (import_id) REFERENCES catalog_imports(id) ON DELETE CASCADE,
    INDEX idx_remediation_owner_status (owner_id, status, created_at)
);
