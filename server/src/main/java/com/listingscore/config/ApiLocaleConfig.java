package com.listingscore.config;

import com.listingscore.common.ApiLanguage;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.i18n.LocaleContext;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

@Configuration
public class ApiLocaleConfig {
    @Bean
    LocaleResolver localeResolver() {
        return new AcceptHeaderLocaleResolver() {
            @Override public Locale resolveLocale(HttpServletRequest request) { return ApiLanguage.resolve(request); }
        };
    }

    @Component
    @Order(Ordered.HIGHEST_PRECEDENCE)
    static class ApiLocaleFilter extends OncePerRequestFilter {
        @Override protected boolean shouldNotFilter(HttpServletRequest request) { return !request.getRequestURI().startsWith("/api/"); }
        @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
            Locale locale = ApiLanguage.resolve(request);
            LocaleContext previous = LocaleContextHolder.getLocaleContext();
            LocaleContextHolder.setLocale(locale);
            response.setHeader("Content-Language", ApiLanguage.tag(locale));
            response.addHeader("Vary", "Accept-Language");
            try { chain.doFilter(request, response); }
            finally { LocaleContextHolder.setLocaleContext(previous); }
        }
    }
}
