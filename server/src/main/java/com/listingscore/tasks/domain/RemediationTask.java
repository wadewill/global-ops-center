package com.listingscore.tasks.domain;

import com.listingscore.imports.api.IssueResponse;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "remediation_tasks")
public class RemediationTask {
    @Id @JdbcTypeCode(SqlTypes.CHAR) private UUID id;
    @JdbcTypeCode(SqlTypes.CHAR) @Column(nullable = false) private UUID ownerId;
    @JdbcTypeCode(SqlTypes.CHAR) @Column(nullable = false) private UUID importId;
    @Column(nullable = false) private String ruleId;
    @Column(nullable = false) private String severity;
    private String sku;
    @Column(name = "field_name", nullable = false) private String fieldName;
    @Column(nullable = false) private String message;
    @Column(nullable = false) private String repairAction;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private TaskStatus status;
    @Column(nullable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;
    protected RemediationTask() { }
    public RemediationTask(UUID ownerId, UUID importId, IssueResponse issue) { id=UUID.randomUUID(); this.ownerId=ownerId; this.importId=importId; ruleId=issue.ruleId(); severity=issue.severity().name(); sku=issue.sku(); fieldName=issue.field(); message=issue.message(); repairAction=issue.repairAction(); status=TaskStatus.OPEN; createdAt=Instant.now(); updatedAt=createdAt; }
    public UUID getId(){return id;} public UUID getImportId(){return importId;} public String getRuleId(){return ruleId;} public String getSeverity(){return severity;} public String getSku(){return sku;} public String getFieldName(){return fieldName;} public String getMessage(){return message;} public String getRepairAction(){return repairAction;} public TaskStatus getStatus(){return status;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
    public void moveTo(TaskStatus next){status=next;updatedAt=Instant.now();}
}
