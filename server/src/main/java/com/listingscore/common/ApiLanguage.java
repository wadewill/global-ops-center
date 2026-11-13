package com.listingscore.common;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

/** Supported API response languages. Missing or unsupported preferences use English. */
public final class ApiLanguage {
    private ApiLanguage() { }

    public static Locale resolve(HttpServletRequest request) {
        String header = request.getHeader("Accept-Language");
        if (header == null || header.isBlank()) return Locale.ENGLISH;
        try {
            for (Locale.LanguageRange preference : Locale.LanguageRange.parse(header)) {
                if (preference.getWeight() == 0) continue;
                String range = preference.getRange();
                if (range.equals("zh") || range.startsWith("zh-")) return Locale.SIMPLIFIED_CHINESE;
                if (range.equals("en") || range.startsWith("en-") || range.equals("*")) return Locale.ENGLISH;
            }
        } catch (IllegalArgumentException ignored) { /* Do not fail requests for malformed preferences. */ }
        return Locale.ENGLISH;
    }

    public static boolean isChinese(Locale locale) { return "zh".equals(locale.getLanguage()); }
    public static String tag(Locale locale) { return isChinese(locale) ? "zh-CN" : "en"; }
}
