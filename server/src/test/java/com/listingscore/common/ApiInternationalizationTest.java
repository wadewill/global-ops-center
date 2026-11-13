package com.listingscore.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApiInternationalizationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void localizesBothSecurityAndAuthControllerErrorsWithoutReflectingTokens() throws Exception {
        mvc.perform(get("/api/v1/tasks").header("Accept-Language", "zh-CN").header("Authorization", "Bearer secret-invalid-token"))
                .andExpect(status().isUnauthorized()).andExpect(header().string("Content-Language", "zh-CN"))
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"))
                .andExpect(jsonPath("$.detail").value("请先登录后再继续操作。"))
                .andExpect(content().string(not(containsString("secret-invalid-token"))));
        mvc.perform(get("/api/v1/auth/me").header("Accept-Language", "zh"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.title").value("需要登录"));
        mvc.perform(get("/api/v1/auth/me").header("Accept-Language", "en-US,en;q=0.9,zh;q=0.5"))
                .andExpect(status().isUnauthorized()).andExpect(header().string("Content-Language", "en"))
                .andExpect(jsonPath("$.detail").value("Sign in to continue."));
        mvc.perform(get("/api/v1/auth/me").header("Accept-Language", "fr-FR"))
                .andExpect(status().isUnauthorized()).andExpect(header().string("Content-Language", "en"));
    }

    @Test
    void localizesCredentialAndDuplicateAccountErrors() throws Exception {
        String email = "locale-" + UUID.randomUUID() + "@example.com";
        register(email);
        String registration = "{\"email\":\"" + email + "\",\"password\":\"safe-password-123\",\"displayName\":\"测试商家\"}";
        mvc.perform(post("/api/v1/auth/register").header("X-Real-IP", UUID.randomUUID().toString())
                        .header("Accept-Language", "zh-CN").contentType(MediaType.APPLICATION_JSON).content(registration))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"))
                .andExpect(jsonPath("$.detail").value("该邮箱已注册，请直接登录。"));
        mvc.perform(post("/api/v1/auth/login").header("Accept-Language", "zh-CN").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"wrong-password-123\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.detail").value("邮箱或密码不正确。"));
    }

    @Test
    void returnsLocalizedValidationFieldsWithoutRejectedValues() throws Exception {
        mvc.perform(post("/api/v1/auth/register").header("Accept-Language", "zh-CN").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"validation@example.com\",\"password\":\"secret-only-letters\",\"displayName\":\"测试商家\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.detail").value("密码必须同时包含字母和数字。"))
                .andExpect(jsonPath("$.fields[0].field").value("password"))
                .andExpect(jsonPath("$.fields[0].code").value("INVALID_FORMAT"))
                .andExpect(content().string(not(containsString("secret-only-letters"))));
        mvc.perform(post("/api/v1/auth/login").header("Accept-Language", "en").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"safe-password-123\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.detail").value("Enter a valid email address."));
    }

    @Test
    void localizesMalformedPayloadsAndMissingUploadFields() throws Exception {
        mvc.perform(post("/api/v1/auth/login").header("Accept-Language", "zh-CN").contentType(MediaType.APPLICATION_JSON).content("{bad-json"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.detail").value("请求格式不正确，请检查提交的数据。"));
        String token = register("locale-" + UUID.randomUUID() + "@example.com");
        mvc.perform(multipart("/api/v1/imports").header("Authorization", "Bearer " + token).header("Accept-Language", "zh-CN"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("MISSING_PARAMETER"));
        mvc.perform(patch("/api/v1/tasks/" + UUID.randomUUID()).header("Authorization", "Bearer " + token)
                        .header("Accept-Language", "zh-CN").contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"UNKNOWN\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    @Test
    void localizesConnectionEndpointValidationAndPreservesStatus() throws Exception {
        String token = register("locale-" + UUID.randomUUID() + "@example.com");
        mvc.perform(post("/api/v1/connections").header("Authorization", "Bearer " + token).header("Accept-Language", "zh-CN")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"platform\":\"CUSTOM_API\",\"label\":\"测试连接\",\"authType\":\"API_KEY\",\"endpointUrl\":\"http://example.com\",\"credential\":\"private-api-key\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_ENDPOINT_URL"))
                .andExpect(jsonPath("$.detail").value("接口地址必须是有效的 HTTPS 地址。"))
                .andExpect(content().string(not(containsString("private-api-key"))));
        mvc.perform(delete("/api/v1/connections/" + UUID.randomUUID()).header("Authorization", "Bearer " + token).header("Accept-Language", "zh-CN"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CONNECTION_NOT_FOUND"));
    }

    @Test
    void localizesCsvValidationAndMissingReports() throws Exception {
        String token = register("locale-" + UUID.randomUUID() + "@example.com");
        upload(token, "empty.csv", "").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("EMPTY_CSV"))
                .andExpect(jsonPath("$.detail").value("请选择一个非空的 CSV 文件。"));
        upload(token, "products.txt", "sku\nitem-1").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("UNSUPPORTED_FILE_TYPE"));
        upload(token, "products.csv", "unknown_field\nitem-1").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CSV_HEADER_UNSUPPORTED"));
        upload(token, "products.csv", "sku\n").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CSV_NO_PRODUCTS"));
        upload(token, "products.csv", "sku,title\nitem-1").andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("CSV_READ_FAILED"));
        mvc.perform(get("/api/v1/imports/" + UUID.randomUUID()).header("Authorization", "Bearer " + token).header("Accept-Language", "zh-CN"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("IMPORT_NOT_FOUND"))
                .andExpect(jsonPath("$.detail").value("未找到该诊断报告。"));
    }

    @Test
    void supportsCrossOriginLocaleAndTaskUpdates() throws Exception {
        mvc.perform(options("/api/v1/tasks/" + UUID.randomUUID()).header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "PATCH")
                        .header("Access-Control-Request-Headers", "authorization,content-type,accept-language"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Methods", containsString("PATCH")))
                .andExpect(header().string("Access-Control-Allow-Headers", containsString("accept-language")));
        mvc.perform(get("/api/v1/auth/me").header("Origin", "http://localhost:3000").header("Accept-Language", "zh-CN"))
                .andExpect(status().isUnauthorized()).andExpect(header().string("Access-Control-Expose-Headers", containsString("Content-Language")));
    }

    private ResultActions upload(String token, String name, String content) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", name, "text/csv", content.getBytes(StandardCharsets.UTF_8));
        return mvc.perform(multipart("/api/v1/imports").file(file).header("Authorization", "Bearer " + token).header("Accept-Language", "zh-CN"));
    }

    private String register(String email) throws Exception {
        String body = mvc.perform(post("/api/v1/auth/register").header("X-Real-IP", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"" + email + "\",\"password\":\"safe-password-123\",\"displayName\":\"Locale Test\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(body).path("accessToken").asText();
    }
}
