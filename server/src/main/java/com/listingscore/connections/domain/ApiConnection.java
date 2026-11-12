package com.listingscore.connections.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "api_connections")
public class ApiConnection {
    @Id @JdbcTypeCode(SqlTypes.CHAR) private UUID id;
    @JdbcTypeCode(SqlTypes.CHAR) @Column(nullable = false) private UUID userId;
    @Column(nullable = false) private String platform;
    @Column(nullable = false) private String label;
    @Column(nullable = false) private String authType;
    private String endpointUrl;
    @JdbcTypeCode(SqlTypes.LONGVARCHAR) @Column(nullable = false, columnDefinition = "LONGTEXT") private String credentialCiphertext;
    @Column(nullable = false) private String status;
    private Instant lastCheckedAt;
    @Column(nullable = false) private Instant createdAt;
    protected ApiConnection() { }
    public ApiConnection(UUID id, UUID userId, String platform, String label, String authType, String endpointUrl, String credentialCiphertext) {
        this.id=id; this.userId=userId; this.platform=platform; this.label=label; this.authType=authType; this.endpointUrl=endpointUrl; this.credentialCiphertext=credentialCiphertext; this.status="CONFIGURED"; this.createdAt=Instant.now();
    }
    public UUID getId(){return id;} public UUID getUserId(){return userId;} public String getPlatform(){return platform;} public String getLabel(){return label;} public String getAuthType(){return authType;} public String getEndpointUrl(){return endpointUrl;} public String getStatus(){return status;} public Instant getLastCheckedAt(){return lastCheckedAt;} public Instant getCreatedAt(){return createdAt;}
    public void markVerified(){status="VERIFIED"; lastCheckedAt=Instant.now();}
}
