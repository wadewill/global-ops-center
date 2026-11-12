package com.listingscore.connections.domain;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface ApiConnectionRepository extends JpaRepository<ApiConnection, UUID> {
    List<ApiConnection> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<ApiConnection> findByIdAndUserId(UUID id, UUID userId);
}
