package com.listingscore.tasks.service;

import com.listingscore.imports.api.IssueResponse;
import com.listingscore.tasks.api.TaskResponse;
import com.listingscore.tasks.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class TaskService {
    private final RemediationTaskRepository tasks;
    public TaskService(RemediationTaskRepository tasks) { this.tasks = tasks; }
    @Transactional public void createForImport(UUID ownerId, UUID importId, List<IssueResponse> issues) { tasks.saveAll(issues.stream().map(issue -> new RemediationTask(ownerId, importId, issue)).toList()); }
    public List<TaskResponse> list(UUID ownerId, TaskStatus status) { List<RemediationTask> result = status == null ? tasks.findTop100ByOwnerIdOrderByCreatedAtDesc(ownerId) : tasks.findByOwnerIdAndStatusOrderByCreatedAtDesc(ownerId, status); return result.stream().map(TaskResponse::from).toList(); }
    @Transactional public TaskResponse update(UUID ownerId, UUID id, TaskStatus status) { RemediationTask task=tasks.findByIdAndOwnerId(id,ownerId).orElseThrow(() -> new IllegalArgumentException("Task was not found.")); task.moveTo(status); return TaskResponse.from(task); }
}
