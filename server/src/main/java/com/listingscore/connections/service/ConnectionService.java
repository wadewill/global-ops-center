package com.listingscore.connections.service;
import com.listingscore.connections.api.ConnectionRequest;
import com.listingscore.connections.api.ConnectionResponse;
import com.listingscore.connections.domain.ApiConnection;
import com.listingscore.connections.domain.ApiConnectionRepository;
import com.listingscore.common.ApiErrorCode;
import com.listingscore.common.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@Service
public class ConnectionService {
    private final ApiConnectionRepository connections; private final CredentialCipher cipher;
    public ConnectionService(ApiConnectionRepository connections, CredentialCipher cipher) { this.connections=connections; this.cipher=cipher; }
    @Transactional public ConnectionResponse create(UUID userId, ConnectionRequest request) {
        String endpoint = request.endpointUrl() == null || request.endpointUrl().isBlank() ? null : request.endpointUrl().trim();
        if (endpoint != null) validateHttpsUrl(endpoint);
        ApiConnection connection = connections.save(new ApiConnection(UUID.randomUUID(), userId, request.platform().trim().toUpperCase(), request.label().trim(), request.authType().trim().toUpperCase(), endpoint, cipher.encrypt(request.credential())));
        return view(connection);
    }
    public List<ConnectionResponse> list(UUID userId) { return connections.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::view).toList(); }
    @Transactional public ConnectionResponse verify(UUID userId, UUID id) { ApiConnection item=owned(userId,id); item.markVerified(); return view(item); }
    @Transactional public void delete(UUID userId, UUID id) { connections.delete(owned(userId,id)); }
    private ApiConnection owned(UUID userId, UUID id) { return connections.findByIdAndUserId(id,userId).orElseThrow(() -> new ApiException(ApiErrorCode.CONNECTION_NOT_FOUND)); }
    private ConnectionResponse view(ApiConnection item) { return new ConnectionResponse(item.getId(),item.getPlatform(),item.getLabel(),item.getAuthType(),item.getEndpointUrl(),item.getStatus(),item.getLastCheckedAt(),item.getCreatedAt()); }
    private void validateHttpsUrl(String value) { try { URI uri=URI.create(value); if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost()==null) throw new IllegalArgumentException(); } catch (IllegalArgumentException ex) { throw new ApiException(ApiErrorCode.INVALID_ENDPOINT_URL); } }
}
