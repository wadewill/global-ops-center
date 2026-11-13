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

import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

    @Test
    void localizesReportsTasksAndExportsWithoutChangingStoredLanguage() throws Exception {
        String token = accessToken("catalog-i18n@example.com");
        String csv = "sku,title,description,price,image_url,availability,brand,gtin,item_group_id,color,size\n" +
                ",,,,,,,12345,,Blue,\n" +
                "DUP,Title,Description,0,bad,in_stock,Acme,,,,\n" +
                "DUP,Title,Description,not-a-number,https://example.com/image.jpg,in_stock,Acme,,,,\n";
        MockMultipartFile file = new MockMultipartFile("file", "catalog.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));
        JsonNode chinese = objectMapper.readTree(mockMvc.perform(multipart("/api/v1/imports").file(file)
                        .header("Authorization", "Bearer " + token).header("Accept-Language", "zh-CN"))
                .andExpect(status().isCreated()).andExpect(header().string("Content-Language", "zh-CN"))
                .andExpect(jsonPath("$.issues", hasSize(14))).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
        for (JsonNode issue : chinese.path("issues")) {
            assertTrue(issue.path("message").asText().matches(".*\\p{IsHan}.*"), issue.toString());
            assertTrue(issue.path("repairAction").asText().matches(".*\\p{IsHan}.*"), issue.toString());
        }
        assertTrue(chinese.path("issues").toString().contains("商品价格不是有效数字。"));
        assertTrue(chinese.path("issues").toString().contains("商品价格必须大于 0。"));
        String id = chinese.path("importId").asText();
        JsonNode english = objectMapper.readTree(mockMvc.perform(get("/api/v1/imports/{id}", id)
                        .header("Authorization", "Bearer " + token).header("Accept-Language", "en"))
                .andExpect(status().isOk()).andExpect(header().string("Content-Language", "en"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertEquals("SKU is missing.", english.path("issues").get(0).path("message").asText());
        assertEquals(chinese.path("issues").get(0).path("ruleId"), english.path("issues").get(0).path("ruleId"));
        assertEquals(chinese.path("summary"), english.path("summary"));
        mockMvc.perform(get("/api/v1/imports/{id}", id).header("Authorization", "Bearer " + token).header("Accept-Language", "zh"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.issues[0].message").value("缺少商品 SKU。"));
        mockMvc.perform(get("/api/v1/imports/{id}/export", id).header("Authorization", "Bearer " + token).header("Accept-Language", "zh-CN"))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("缺少商品 SKU。")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("SKU_REQUIRED")));
        mockMvc.perform(get("/api/v1/imports/{id}/export", id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("SKU is missing.")));

        JsonNode tasks = objectMapper.readTree(mockMvc.perform(get("/api/v1/tasks").header("Authorization", "Bearer " + token)
                        .header("Accept-Language", "zh-CN"))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(14)))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
        for (JsonNode task : tasks) assertTrue(task.path("message").asText().matches(".*\\p{IsHan}.*"));
        JsonNode task = tasks.get(0);
        mockMvc.perform(patch("/api/v1/tasks/{id}", task.path("id").asText()).header("Authorization", "Bearer " + token)
                        .header("Accept-Language", "zh-CN").contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.message").value(task.path("message").asText()));
        JsonNode englishTasks = objectMapper.readTree(mockMvc.perform(get("/api/v1/tasks").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
        for (JsonNode item : englishTasks) assertTrue(!item.path("message").asText().matches(".*\\p{IsHan}.*"));
    }

    @Test
    void localizesExistingEnglishAnalysisAndTemplateExamples() throws Exception {
        String token = accessToken("catalog-legacy-i18n@example.com");
        MockMultipartFile file = new MockMultipartFile("file", "old.csv", "text/csv",
                "sku,title,description,price,image_url,availability\nOLD,Title,Description,0,https://example.com/image.jpg,in_stock\n".getBytes(StandardCharsets.UTF_8));
        JsonNode original = objectMapper.readTree(mockMvc.perform(multipart("/api/v1/imports").file(file).header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
        mockMvc.perform(get("/api/v1/imports/{id}", original.path("importId").asText()).header("Authorization", "Bearer " + token)
                        .header("Accept-Language", "zh-CN"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.issues[0].message").value("商品价格必须大于 0。"));
        mockMvc.perform(get("/api/v1/imports/template").header("Accept-Language", "zh-CN"))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("sku,title,description")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("示例商品")));
        mockMvc.perform(get("/api/v1/imports/template").header("Accept-Language", "en"))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("Example product")));
    }

    private String accessToken(String email) throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/register").header("X-Real-IP", "198.51.100.142").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"safe-password-123\",\"displayName\":\"Test User\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).path("accessToken").asText();
    }
}
