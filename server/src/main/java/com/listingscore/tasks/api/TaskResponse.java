package com.listingscore.tasks.api;

import com.listingscore.tasks.domain.RemediationTask;
import com.listingscore.tasks.domain.TaskStatus;
import java.time.Instant;
import java.util.UUID;

public record TaskResponse(UUID id, UUID importId, String ruleId, String severity, String sku, String field, String message, String repairAction, TaskStatus status, Instant createdAt, Instant updatedAt) {
    public static TaskResponse from(RemediationTask task) { return new TaskResponse(task.getId(), task.getImportId(), task.getRuleId(), task.getSeverity(), task.getSku(), task.getFieldName(), task.getMessage(), task.getRepairAction(), task.getStatus(), task.getCreatedAt(), task.getUpdatedAt()); }
}
