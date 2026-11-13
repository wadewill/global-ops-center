package com.listingscore.common;

import com.listingscore.auth.service.RateLimitException;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ProblemDetail> domain(ApiException exception, Locale locale) { return response(exception.code(), locale); }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ProblemDetail> invalidRequest(IllegalArgumentException exception, Locale locale) { return response(ApiErrorCode.INVALID_REQUEST, locale); }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemDetail> validation(MethodArgumentNotValidException exception, Locale locale) {
        ProblemDetail problem = ApiProblems.create(ApiErrorCode.VALIDATION_FAILED, locale);
        List<Map<String, String>> fields = exception.getBindingResult().getFieldErrors().stream()
                .sorted(Comparator.comparing(FieldError::getField).thenComparing(error -> String.valueOf(error.getCode())))
                .map(error -> Map.of("field", error.getField(), "code", fieldCode(error), "message", fieldMessage(error, locale)))
                .toList();
        problem.setProperty("fields", fields);
        if (!fields.isEmpty()) problem.setDetail(fields.get(0).get("message"));
        return response(problem, locale);
    }

    @ExceptionHandler(RateLimitException.class)
    ResponseEntity<ProblemDetail> rateLimited(RateLimitException exception, Locale locale) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.CONTENT_LANGUAGE, ApiLanguage.tag(locale))
                .header(HttpHeaders.RETRY_AFTER, Long.toString(exception.getRetryAfterSeconds()))
                .body(ApiProblems.create(ApiErrorCode.RATE_LIMITED, locale));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<ProblemDetail> malformed(Exception exception, Locale locale) { return response(ApiErrorCode.MALFORMED_REQUEST, locale); }

    @ExceptionHandler({MissingServletRequestParameterException.class, MissingServletRequestPartException.class})
    ResponseEntity<ProblemDetail> missing(Exception exception, Locale locale) { return response(ApiErrorCode.MISSING_PARAMETER, locale); }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ProblemDetail> uploadTooLarge(MaxUploadSizeExceededException exception, Locale locale) {
        ProblemDetail problem = ApiProblems.create(ApiErrorCode.FILE_TOO_LARGE, locale);
        problem.setStatus(HttpStatus.PAYLOAD_TOO_LARGE);
        return response(problem, locale);
    }

    @ExceptionHandler(MultipartException.class)
    ResponseEntity<ProblemDetail> multipart(MultipartException exception, Locale locale) { return response(ApiErrorCode.MALFORMED_REQUEST, locale); }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ProblemDetail> mediaType(HttpMediaTypeNotSupportedException exception, Locale locale) { return response(ApiErrorCode.UNSUPPORTED_MEDIA_TYPE, locale); }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ProblemDetail> method(HttpRequestMethodNotSupportedException exception, Locale locale) { return response(ApiErrorCode.METHOD_NOT_ALLOWED, locale); }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ProblemDetail> resource(NoResourceFoundException exception, Locale locale) { return response(ApiErrorCode.RESOURCE_NOT_FOUND, locale); }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ProblemDetail> forbidden(AccessDeniedException exception, Locale locale) { return response(ApiErrorCode.ACCESS_DENIED, locale); }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ProblemDetail> status(ResponseStatusException exception, Locale locale) {
        return frameworkStatus(exception.getStatusCode().value(), locale);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemDetail> unexpected(Exception exception, Locale locale) {
        if (exception instanceof ErrorResponse error) return frameworkStatus(error.getStatusCode().value(), locale);
        return response(ApiErrorCode.INTERNAL_ERROR, locale);
    }

    private ResponseEntity<ProblemDetail> frameworkStatus(int status, Locale locale) {
        ApiErrorCode code = switch (status) {
            case 400 -> ApiErrorCode.INVALID_REQUEST;
            case 401 -> ApiErrorCode.AUTHENTICATION_REQUIRED;
            case 403 -> ApiErrorCode.ACCESS_DENIED;
            case 404 -> ApiErrorCode.RESOURCE_NOT_FOUND;
            case 405 -> ApiErrorCode.METHOD_NOT_ALLOWED;
            case 413 -> ApiErrorCode.FILE_TOO_LARGE;
            case 415 -> ApiErrorCode.UNSUPPORTED_MEDIA_TYPE;
            case 429 -> ApiErrorCode.RATE_LIMITED;
            default -> status >= 400 && status < 500 ? ApiErrorCode.INVALID_REQUEST : ApiErrorCode.INTERNAL_ERROR;
        };
        ProblemDetail problem = ApiProblems.create(code, locale);
        problem.setStatus(status);
        return response(problem, locale);
    }

    private ResponseEntity<ProblemDetail> response(ApiErrorCode code, Locale locale) { return response(ApiProblems.create(code, locale), locale); }
    private ResponseEntity<ProblemDetail> response(ProblemDetail problem, Locale locale) {
        return ResponseEntity.status(problem.getStatus()).header(HttpHeaders.CONTENT_LANGUAGE, ApiLanguage.tag(locale)).body(problem);
    }

    private String fieldCode(FieldError error) {
        return switch (String.valueOf(error.getCode())) {
            case "NotBlank", "NotNull", "NotEmpty" -> "REQUIRED";
            case "Email" -> "INVALID_EMAIL";
            case "Size", "Length", "Min", "Max" -> "INVALID_LENGTH";
            default -> "INVALID_FORMAT";
        };
    }

    private String fieldMessage(FieldError error, Locale locale) {
        boolean zh = ApiLanguage.isChinese(locale);
        String field = error.getField();
        String label = fieldLabel(field, zh);
        return switch (fieldCode(error)) {
            case "REQUIRED" -> zh ? "请填写" + label + "。" : label + " is required.";
            case "INVALID_EMAIL" -> zh ? "请输入有效的邮箱地址。" : "Enter a valid email address.";
            case "INVALID_LENGTH" -> switch (field) {
                case "password" -> zh ? "密码长度须为 12 至 72 个字符。" : "Password must contain between 12 and 72 characters.";
                case "displayName" -> zh ? "姓名或团队名称须为 2 至 80 个字符。" : "Display name must contain between 2 and 80 characters.";
                case "email" -> zh ? "邮箱地址不能超过 254 个字符。" : "Email must contain no more than 254 characters.";
                case "label" -> zh ? "连接名称不能超过 100 个字符。" : "Connection name must contain no more than 100 characters.";
                case "credential" -> zh ? "访问令牌或 API 密钥不能超过 4096 个字符。" : "Credential must contain no more than 4096 characters.";
                case "endpointUrl" -> zh ? "接口地址不能超过 500 个字符。" : "Endpoint URL must contain no more than 500 characters.";
                default -> zh ? label + "长度不符合要求。" : label + " length is outside the allowed range.";
            };
            default -> field.equals("password") ? (zh ? "密码必须同时包含字母和数字。" : "Password must include letters and numbers.") : (zh ? label + "格式不正确。" : label + " has an invalid format.");
        };
    }

    private String fieldLabel(String field, boolean zh) {
        return switch (field) {
            case "email" -> zh ? "邮箱" : "Email";
            case "password" -> zh ? "密码" : "Password";
            case "displayName" -> zh ? "姓名或团队名称" : "Display name";
            case "platform" -> zh ? "平台" : "Platform";
            case "label" -> zh ? "连接名称" : "Connection name";
            case "authType" -> zh ? "认证方式" : "Authentication type";
            case "endpointUrl" -> zh ? "接口地址" : "Endpoint URL";
            case "credential" -> zh ? "访问令牌或 API 密钥" : "Credential";
            case "status" -> zh ? "任务状态" : "Task status";
            default -> zh ? "必要信息" : "This field";
        };
    }
}
