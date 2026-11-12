package com.listingscore.imports.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ImportControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void importsCsvAndReturnsDiagnosableIssues() throws Exception {
        String token = accessToken("catalog-test@example.com");
        String csv = "sku,title,description,price,image_url,availability,brand,gtin,color\n" +
                "TEE-BLUE,,Soft cotton shirt,0,not-a-url,,Acme,ABC,Blue\n" +
                "TEE-BLUE,Blue Tee,,19.99,https://cdn.example.com/tee.jpg,in_stock,,,Red\n";
        MockMultipartFile file = new MockMultipartFile("file", "catalog.csv", MediaType.TEXT_PLAIN_VALUE, csv.getBytes());

        String body = mockMvc.perform(multipart("/api/v1/imports").file(file).header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalRows").value(2))
                .andExpect(jsonPath("$.catalogScore").isNumber())
                .andExpect(jsonPath("$.issues", hasSize(10)))
                .andExpect(jsonPath("$.summary.blockers").value(0))
                .andExpect(jsonPath("$.mappedFields").value(hasSize(9)))
                .andReturn().getResponse().getContentAsString();
        JsonNode response = objectMapper.readTree(body);
        String importId = response.path("importId").asText();

        mockMvc.perform(get("/api/v1/imports/{id}", importId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.issues", hasSize(10)))
                .andExpect(jsonPath("$.summary.high").value(4));

        mockMvc.perform(get("/api/v1/imports/{id}/export", importId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv;charset=UTF-8"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("SKU_DUPLICATE")));

        String tasks = mockMvc.perform(get("/api/v1/tasks").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(10))).andReturn().getResponse().getContentAsString();
        String taskId = objectMapper.readTree(tasks).get(0).path("id").asText();
        mockMvc.perform(patch("/api/v1/tasks/{id}", taskId).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void rejectsNonCsvFiles() throws Exception {
        String token = accessToken("invalid-file-test@example.com");
        MockMultipartFile file = new MockMultipartFile("file", "catalog.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[]{1});
        mockMvc.perform(multipart("/api/v1/imports").file(file).header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid request"));
    }

    private String accessToken(String email) throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"safe-password-123\",\"displayName\":\"Test User\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).path("accessToken").asText();
    }
}
