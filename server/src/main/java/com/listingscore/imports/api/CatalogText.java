package com.listingscore.imports.api;

import com.listingscore.common.ApiLanguage;
import com.listingscore.tasks.api.TaskResponse;

import java.util.Comparator;
import java.util.Locale;
import java.util.Map;

/** Localizes presentation at the response boundary, leaving saved analyses and tasks unchanged. */
public final class CatalogText {
    private CatalogText() { }

    private record Translation(String message, String action) { }

    private static final Map<String, Translation> CHINESE = Map.ofEntries(
            Map.entry("SKU_REQUIRED", new Translation("缺少商品 SKU。", "请在发布前为商品填写唯一的 SKU。")),
            Map.entry("TITLE_REQUIRED", new Translation("缺少商品标题。", "请填写真实、面向买家的商品标题。")),
            Map.entry("PRICE_REQUIRED", new Translation("缺少商品价格。", "请填写有效的商品售价。")),
            Map.entry("IMAGE_REQUIRED", new Translation("缺少商品主图链接。", "请填写可公开访问的商品主图链接。")),
            Map.entry("AVAILABILITY_REQUIRED", new Translation("缺少商品库存状态。", "请填写商品的在售或库存状态。")),
            Map.entry("DESCRIPTION_REQUIRED", new Translation("缺少商品描述。", "请补充真实的商品特点、规格和使用场景。")),
            Map.entry("SKU_DUPLICATE", new Translation("商品 SKU 重复。", "请为每个商品变体使用唯一的 SKU。")),
            Map.entry("PRICE_INVALID", new Translation("商品价格必须大于 0。", "请使用大于 0 的数字价格。")),
            Map.entry("IMAGE_URL_INVALID", new Translation("图片链接必须以 http:// 或 https:// 开头。", "请使用可公开访问的 HTTP(S) 图片链接。")),
            Map.entry("GOOGLE_BRAND_WITH_GTIN", new Translation("已填写 GTIN，但缺少商品品牌。", "请补充制造商品牌，以满足 Google 商品数据要求。")),
            Map.entry("GTIN_FORMAT", new Translation("GTIN 必须是 8、12、13 或 14 位数字。", "请核对制造商提供的 GTIN，不要自行编造商品标识。")),
            Map.entry("VARIANT_GROUP_MISSING", new Translation("已填写颜色或尺码，但缺少变体分组。", "请为同款商品的不同变体填写相同的 item_group_id。"))
    );

    public static IssueResponse issue(IssueResponse issue, Locale locale) {
        if (!ApiLanguage.isChinese(locale)) return issue;
        Translation text = translation(issue.ruleId(), issue.message());
        return new IssueResponse(issue.rowNumber(), issue.sku(), issue.ruleId(), issue.severity(),
                issue.field(), text.message(), text.action());
    }

    public static ImportResponse report(ImportResponse report, Locale locale) {
        if (!ApiLanguage.isChinese(locale)) return report;
        return new ImportResponse(report.importId(), report.sourceName(), report.status(), report.totalRows(),
                report.catalogScore(), report.summary(), report.mappedFields(),
                report.issues().stream().map(issue -> issue(issue, locale)).toList(), report.createdAt());
    }

    public static TaskResponse task(TaskResponse task, Locale locale) {
        if (!ApiLanguage.isChinese(locale)) return task;
        Translation text = translation(task.ruleId(), task.message());
        return new TaskResponse(task.id(), task.importId(), task.ruleId(), task.severity(), task.sku(), task.field(),
                text.message(), text.action(), task.status(), task.createdAt(), task.updatedAt());
    }

    public static String export(ImportResponse report, Locale locale) {
        StringBuilder result = new StringBuilder("row_number,sku,rule_id,severity,field,message,repair_action\n");
        report.issues().stream().sorted(Comparator.comparingInt(IssueResponse::rowNumber))
                .map(issue -> issue(issue, locale)).forEach(issue -> result.append(issue.rowNumber()).append(',')
                        .append(csv(issue.sku())).append(',').append(csv(issue.ruleId())).append(',')
                        .append(csv(issue.severity().name())).append(',').append(csv(issue.field())).append(',')
                        .append(csv(issue.message())).append(',').append(csv(issue.repairAction())).append('\n'));
        return result.toString();
    }

    private static Translation translation(String ruleId, String originalMessage) {
        // Both conditions share an existing rule ID in persisted reports. Preserve their distinct advice.
        if ("PRICE_INVALID".equals(ruleId) && "Price is not a number.".equals(originalMessage)) {
            return new Translation("商品价格不是有效数字。", "请填写数字价格，例如 19.99。");
        }
        return CHINESE.getOrDefault(ruleId,
                new Translation("检测到商品数据问题。", "请检查此问题对应的商品字段并重新运行诊断。"));
    }

    private static String csv(String value) {
        String safe = value == null ? "" : value;
        if (safe.startsWith("=") || safe.startsWith("+") || safe.startsWith("-") || safe.startsWith("@")) safe = "'" + safe;
        return '"' + safe.replace("\"", "\"\"") + '"';
    }
}
