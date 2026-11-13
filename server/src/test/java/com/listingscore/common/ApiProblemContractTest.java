package com.listingscore.common;

import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.springframework.web.HttpMediaTypeNotAcceptableException;

import static org.junit.jupiter.api.Assertions.*;

class ApiProblemContractTest {
    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void doesNotExposeTechnicalExceptionsAsTranslatedUiCopy() {
        var response = handler.unexpected(new IllegalStateException("db-password=private-internal-value"), Locale.SIMPLIFIED_CHINESE);
        assertEquals(500, response.getStatusCode().value());
        assertEquals("服务暂时无法完成请求，请稍后重试。", response.getBody().getDetail());
        assertEquals("INTERNAL_ERROR", response.getBody().getProperties().get("code"));
        assertFalse(response.getBody().toString().contains("private-internal-value"));
    }

    @Test
    void preservesFrameworkHttpStatusWhileReplacingItsEnglishDetail() {
        var response = handler.unexpected(new HttpMediaTypeNotAcceptableException("internal English parser detail"), Locale.SIMPLIFIED_CHINESE);
        assertEquals(406, response.getStatusCode().value());
        assertEquals("请检查提交的请求。", response.getBody().getDetail());
        assertFalse(response.getBody().toString().contains("parser detail"));
    }
}
