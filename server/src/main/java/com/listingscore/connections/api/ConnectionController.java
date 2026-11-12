package com.listingscore.connections.api;
import com.listingscore.auth.service.AuthService;
import com.listingscore.connections.service.ConnectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/connections")
public class ConnectionController {
    private final ConnectionService service; private final AuthService auth;
    public ConnectionController(ConnectionService service, AuthService auth){this.service=service;this.auth=auth;}
    @GetMapping public List<ConnectionResponse> list(){return service.list(auth.currentUser().getId());}
    @PostMapping public ResponseEntity<ConnectionResponse> create(@Valid @RequestBody ConnectionRequest request){return ResponseEntity.status(201).body(service.create(auth.currentUser().getId(),request));}
    @PostMapping("/{id}/verify") public ConnectionResponse verify(@PathVariable UUID id){return service.verify(auth.currentUser().getId(),id);}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id){service.delete(auth.currentUser().getId(),id);return ResponseEntity.noContent().build();}
    @GetMapping("/platforms") public List<PlatformResponse> platforms(){return List.of(
            new PlatformResponse("SHOPIFY","Shopify","AVAILABLE","OAuth / access token"), new PlatformResponse("AMAZON_SELLER","Amazon Seller Central","PLANNED","LWA + AWS signature"),
            new PlatformResponse("WALMART","Walmart Marketplace","PLANNED","Client credentials"), new PlatformResponse("GOOGLE_MERCHANT","Google Merchant Center","PLANNED","OAuth 2.0"),
            new PlatformResponse("CUSTOM_API","Custom REST API","AVAILABLE","API key / bearer token"));}
}
