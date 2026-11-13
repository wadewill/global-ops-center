package com.listingscore.common;

import java.util.Locale;
import org.springframework.http.ProblemDetail;

public final class ApiProblems {
    private ApiProblems() { }
    public static ProblemDetail create(ApiErrorCode code, Locale locale) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(code.status(), code.detail(locale));
        problem.setTitle(code.title(locale));
        problem.setProperty("code", code.name());
        return problem;
    }
}
