---
name: enhance-liuyao-spacing-width
overview: 进一步压缩六爻显示区域的纵向间距，并扩大每条爻的视觉宽度，使其更加紧凑易读。
todos:
  - id: analyze-current-styles
    content: 评估现有.yao-display/.yao-line纵横参数
    status: completed
  - id: refine-yao-css
    content: 收紧间距并拓宽爻视觉宽度
    status: completed
    dependencies:
      - analyze-current-styles
  - id: regression-check
    content: 回归六爻追加与颜色展示效果
    status: completed
    dependencies:
      - refine-yao-css
---

## 用户需求

- 六爻起卦实时展示区域依旧显得松散，需要进一步压缩每条爻之间的上下间距
- 单条爻（`.\yao-line`）视觉上显得过窄，需要通过宽度或字距等方式增强横向占比
- 保持现有起卦流程、阴阳及变爻颜色区分与从下向上排列行为不变，仅微调样式参数

## 产品概述

继续针对“六爻起卦”模块中 `#lyYaoDisplay` 及其 `.\yao-line` 子元素执行二次样式收紧，让六条爻的垂直间距更小、横向更饱满，同时不影响其他模块的布局。

## 核心功能

- 将六爻容器的纵向留白（`min-height`、`padding`、`gap` 等）进一步收紧，使卦形更集中
- 调整单条爻的 `font-size`、`line-height`、`letter-spacing` 或 `width`，打造更宽的视觉效果
- 回归测试六爻追加顺序和红黑变爻高亮，确保视觉调整不破坏显示逻辑

## 技术选型

- 维持项目既有的原生 HTML + 内联 CSS + 原生 JavaScript
- 样式调整集中在 `d:/project/zhouYiMaster/index.html` 的内联 `<style>` 段中

## 实施方案

1. **容器纵向压缩**  

- 精确调低 `.yao-display` 的 `min-height`、`padding` 与 `gap`，必要时借助 `max-height` 或 `justify-content` 控制布局，确保六条爻在竖向上更紧凑。

2. **爻宽度强化**  

- 在 `.yao-line` 上增加 `letter-spacing`、`padding-inline` 或 `display: inline-block + min-width`，必要时叠加背景条形/伪元素以增加横向视觉厚度，同时调节 `font-size`、`line-height` 取得平衡。

3. **联调与验证**  

- 通过实际投掷流程（`app.js` 逻辑保持不变）观察新增样式对逐条追加的影响，确保红色/黑色高亮、从下到上堆叠顺序、移动端适配仍正常。

## 实施注意事项

- 仅改动与六爻展示区域相关的 CSS，避免影响 `.gua-symbol`、查询模块等共用样式。
- 控制字距/宽度增强的实现方式，防止在移动设备上溢出；可结合媒体查询进行微调。
- 调整后注意 text-shadow 对齐及抗锯齿效果，避免文字宽度增加后出现视觉模糊。
- 回归测试需关注首次渲染为空、逐次追加 6 条爻、完成后再次重置的全流程。

## 架构设计

现有结构保持不变：

- `index.html` 控制样式与 DOM 结构  
- `app.js` 的 `renderYaoSymbol()` 负责 append `.yao-line`，无需逻辑改动  
数据流程：用户投掷 → `tossCoins()` 计算 → `renderYaoSymbol()` 追加 → 新 CSS 呈现压缩后的卦形。

## 目录结构

d:/project/zhouYiMaster/
├── index.html  # [MODIFY] 微调 `.yao-display` 与 `.yao-line` 的纵横布局参数，必要时新增辅助类或媒体查询，确保爻更紧凑且更宽
└── app.js      # [VERIFY] 复查渲染流程是否受样式影响（无代码更改）