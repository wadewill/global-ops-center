# 商城风格商品示意图

这些图片由内置 `image_gen` 工具分别生成，用于 ListingScore 首页中的商品诊断演示。它们不是实际销售商品的照片，不代表品牌授权、商品库存或真实销售数据。

## 文件对应关系

| 主题 | 原始生成图片 | 网站使用图片 |
| --- | --- | --- |
| 米白运动鞋 | `sneaker.png` | `sneaker.webp` |
| 陶瓷拿铁杯套装 | `mugs.png` | `mugs.webp` |
| 黑色无线头戴耳机 | `headphones.png` | `headphones.webp` |

PNG 是内置工具的原始生成结果。WebP 由对应 PNG 使用项目现有 `sharp` 依赖缩放至 900 × 900 像素、以质量参数 85 编码，仅做网页尺寸与格式优化。生产页面引用 WebP；原始 PNG 可保留在本地，不必随网站发布。

## 最终实际生成提示词

每张图片使用一次独立生成调用，`transparent_background` 均为 `false`，没有提供参考图或调用 CLI。

### 米白运动鞋

```text
Use case: product-mockup. Asset type: square ecommerce catalog product photograph. On a pale warm ivory seamless studio surface, one pair of unbranded off-white athletic sneakers. Photorealistic knit, stitched suede panels, rubber soles and cotton laces. Natural three-quarter angle, shoes entirely visible centered with comfortable margins. Soft daylight, believable delicate contact shadows. Restrained commercial photography, no stylized 3D render, no illustration. No logos, no text, no labels, no watermarks, no additional objects. Square composition.
```

### 陶瓷拿铁杯套装

```text
Use case: product-mockup. Asset type: square ecommerce catalog product photograph. A set of two unbranded ceramic latte cups with matching saucers, one creamy white and one light tan, on a warm light gray seamless studio surface. Photorealistic satin glazed ceramic, fine natural surface variation. Both cups fully visible, centered, simple three-quarter angle, comfortable margins. Soft daylight and gentle real contact shadows. Clean contemporary ecommerce photography, not illustration or 3D render. No text, no logos, no labels, no watermarks, no extra props. Square composition.
```

### 黑色无线头戴耳机

```text
Use case: product-mockup. Asset type: square ecommerce catalog product photograph. One unbranded black wireless over-ear headphone on a soft white seamless studio background. Entire headband and both ear cups fully visible in a natural three-quarter angle, centered with comfortable margins. Photorealistic matte black polymer, padded leatherette ear cushions, subtle realistic seams. Soft diffused studio daylight, gentle contact shadow. Straightforward commercial product photography, not illustration and not stylized 3D render. No logos, no letters, no text, no labels, no watermark, no extra objects. Square composition.
```
