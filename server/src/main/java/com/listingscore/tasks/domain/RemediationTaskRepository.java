package com.listingscore.tasks.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RemediationTaskRepository extends JpaRepository<RemediationTask, UUID> {
    List<RemediationTask> findTop100ByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    List<RemediationTask> findByOwnerIdAndStatusOrderByCreatedAtDesc(UUID ownerId, TaskStatus status);
    Optional<RemediationTask> findByIdAndOwnerId(UUID id, UUID ownerId);
}
