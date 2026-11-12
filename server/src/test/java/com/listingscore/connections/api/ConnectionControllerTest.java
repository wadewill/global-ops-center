package com.listingscore.connections.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ConnectionControllerTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void storesConnectionWithoutReturningCredential() throws Exception {
        String token = token();
        mockMvc.perform(post("/api/v1/connections").header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"platform\":\"SHOPIFY\",\"label\":\"US Store\",\"authType\":\"ACCESS_TOKEN\",\"credential\":\"shpat_secret_should_never_be_returned\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.label").value("US Store"))
                .andExpect(jsonPath("$.credential").doesNotExist()).andExpect(jsonPath("$.credentialCiphertext").doesNotExist());
        mockMvc.perform(get("/api/v1/connections").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].label").value("US Store"));
    }

    private String token() throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"connections@example.com\",\"password\":\"safe-password-123\",\"displayName\":\"Connection Test\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode response = objectMapper.readTree(body);
        return response.path("accessToken").asText();
    }
}
