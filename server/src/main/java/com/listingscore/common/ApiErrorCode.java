package com.listingscore.common;

import java.util.Locale;
import org.springframework.http.HttpStatus;

public enum ApiErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Check the submitted request.", "请检查提交的请求。"),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Check the submitted fields.", "请检查填写的信息。"),
    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "An account with this email already exists.", "该邮箱已注册，请直接登录。"),
    DISPLAY_NAME_REQUIRED(HttpStatus.BAD_REQUEST, "Enter a display name.", "请填写姓名或团队名称。"),
    INVALID_CREDENTIALS(HttpStatus.BAD_REQUEST, "Email or password is incorrect.", "邮箱或密码不正确。"),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Please try again later.", "操作过于频繁，请稍后重试。"),
    INVALID_ENDPOINT_URL(HttpStatus.BAD_REQUEST, "Endpoint URL must be a valid HTTPS address.", "接口地址必须是有效的 HTTPS 地址。"),
    EMPTY_CSV(HttpStatus.BAD_REQUEST, "Choose a non-empty CSV file.", "请选择一个非空的 CSV 文件。"),
    FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "The file must be 5 MB or smaller.", "文件大小不能超过 5 MB。"),
    UNSUPPORTED_FILE_TYPE(HttpStatus.BAD_REQUEST, "Only UTF-8 CSV files are supported.", "目前仅支持 UTF-8 编码的 CSV 文件。"),
    CSV_READ_FAILED(HttpStatus.BAD_REQUEST, "The CSV file could not be read. Check its format and encoding.", "无法读取 CSV 文件，请检查文件格式和编码。"),
    CSV_HEADER_UNSUPPORTED(HttpStatus.BAD_REQUEST, "No supported product fields were found in the header row.", "表头中未找到支持的商品字段，请使用标准模板。"),
    CSV_NO_PRODUCTS(HttpStatus.BAD_REQUEST, "The file has a header but no product rows.", "文件只有表头，没有商品数据。"),
    IMPORT_NOT_FOUND(HttpStatus.NOT_FOUND, "The import was not found.", "未找到该诊断报告。"),
    CONNECTION_NOT_FOUND(HttpStatus.BAD_REQUEST, "Connection was not found.", "未找到该 API 连接。"),
    TASK_NOT_FOUND(HttpStatus.BAD_REQUEST, "Task was not found.", "未找到该修复任务。"),
    AUTHENTICATION_REQUIRED(HttpStatus.UNAUTHORIZED, "Sign in to continue.", "请先登录后再继续操作。"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "You do not have permission to perform this action.", "你没有执行此操作的权限。"),
    MALFORMED_REQUEST(HttpStatus.BAD_REQUEST, "The request format is invalid. Check the submitted data.", "请求格式不正确，请检查提交的数据。"),
    MISSING_PARAMETER(HttpStatus.BAD_REQUEST, "A required request field or file is missing.", "缺少必要的请求字段或文件。"),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "This request content type is not supported.", "不支持此请求内容格式。"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "This request method is not supported.", "不支持此请求方式。"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "The requested resource was not found.", "未找到请求的资源。"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "We could not complete that request. Please try again later.", "服务暂时无法完成请求，请稍后重试。");

    private final HttpStatus status;
    private final String english;
    private final String chinese;
    ApiErrorCode(HttpStatus status, String english, String chinese) { this.status = status; this.english = english; this.chinese = chinese; }
    public HttpStatus status() { return status; }
    public String detail(Locale locale) { return ApiLanguage.isChinese(locale) ? chinese : english; }
    public String title(Locale locale) {
        boolean zh = ApiLanguage.isChinese(locale);
        return switch (status) {
            case UNAUTHORIZED -> zh ? "需要登录" : "Authentication required";
            case FORBIDDEN -> zh ? "没有访问权限" : "Access denied";
            case TOO_MANY_REQUESTS -> zh ? "操作过于频繁" : "Too many attempts";
            case NOT_FOUND -> this == IMPORT_NOT_FOUND ? (zh ? "报告不存在" : "Import not found") : (zh ? "资源不存在" : "Resource not found");
            case INTERNAL_SERVER_ERROR -> zh ? "服务暂时不可用" : "Request failed";
            case METHOD_NOT_ALLOWED -> zh ? "不支持的请求方式" : "Method not allowed";
            case UNSUPPORTED_MEDIA_TYPE -> zh ? "不支持的内容格式" : "Unsupported media type";
            default -> zh ? "请求无效" : "Invalid request";
        };
    }
}
