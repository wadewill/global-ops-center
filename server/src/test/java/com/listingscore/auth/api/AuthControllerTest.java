package com.listingscore.auth.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    void registrationIsRateLimitedPerIp() throws Exception {
        for (int index = 0; index < 5; index++) {
            mockMvc.perform(register("rate-" + index + "@example.com", "198.51.100.99"))
                    .andExpect(status().isCreated());
        }
        mockMvc.perform(register("rate-overflow@example.com", "198.51.100.99"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", org.hamcrest.Matchers.notNullValue()))
                .andExpect(jsonPath("$.title").value("Too many attempts"));
        mockMvc.perform(register("rate-overflow-zh@example.com", "198.51.100.99").header("Accept-Language", "zh-CN"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("Retry-After", org.hamcrest.Matchers.notNullValue()))
                .andExpect(header().string("Content-Language", "zh-CN"))
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"))
                .andExpect(jsonPath("$.detail").value("操作过于频繁，请稍后重试。"));
    }

    @Test
    void rejectsWeakPasswordBeforeCreatingAccount() throws Exception {
        mockMvc.perform(register("weak-password@example.com", "198.51.100.100").content("{\"email\":\"weak-password@example.com\",\"password\":\"onlyletterslong\",\"displayName\":\"Weak Password\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid request"));
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder register(String email, String ip) {
        return post("/api/v1/auth/register").header("X-Real-IP", ip).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"safe-password-123\",\"displayName\":\"Rate Limit Test\"}");
    }
}
