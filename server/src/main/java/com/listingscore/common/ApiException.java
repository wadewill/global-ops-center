package com.listingscore.common;

/** Carries a stable public code; server exception text is never used as UI copy. */
public class ApiException extends IllegalArgumentException {
    private final ApiErrorCode code;
    public ApiException(ApiErrorCode code) { super(code.name()); this.code = code; }
    public ApiException(ApiErrorCode code, Throwable cause) { super(code.name(), cause); this.code = code; }
    public ApiErrorCode code() { return code; }
}
