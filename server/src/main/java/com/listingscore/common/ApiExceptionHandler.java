package com.listingscore.common;

import com.listingscore.imports.service.ImportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.ResponseEntity;
import com.listingscore.auth.service.RateLimitException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail invalidRequest(IllegalArgumentException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
        problem.setTitle("Invalid request");
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validation(MethodArgumentNotValidException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getBindingResult().getFieldError() == null ? "Check the submitted fields." : exception.getBindingResult().getFieldError().getDefaultMessage());
        problem.setTitle("Invalid request");
        return problem;
    }

    @ExceptionHandler(RateLimitException.class)
    ResponseEntity<ProblemDetail> rateLimited(RateLimitException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, exception.getMessage());
        problem.setTitle("Too many attempts");
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).header("Retry-After", Long.toString(exception.getRetryAfterSeconds())).body(problem);
    }

    @ExceptionHandler(ImportService.ImportNotFoundException.class)
    ProblemDetail notFound(ImportService.ImportNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Import not found");
        return problem;
    }
}
