---
name: cx-character-popup
overview: 在六十四卦查询详情页为卦名、卦辞、爻辞添加逐字点击交互，并在侧边弹窗展示字源信息
todos:
  - id: prep-data
    content: 完善或新增 character-origin-data.js，覆盖核心汉字释义
    status: completed
  - id: build-renderer
    content: 在 app.js 添加字符渲染与弹窗控制工具函数
    status: completed
    dependencies:
      - prep-data
  - id: integrate-clickable-text
    content: 改写 showGuaDetail / renderYaociList 使文本逐字可点
    status: completed
    dependencies:
      - build-renderer
  - id: add-ui-structure
    content: 在 index.html 增加弹窗 DOM 与 CSS，设计字符高亮样式
    status: completed
    dependencies:
      - build-renderer
  - id: wire-events
    content: 绑定点击/键盘事件、放大高亮与弹窗逻辑
    status: completed
    dependencies:
      - integrate-clickable-text
      - add-ui-structure
  - id: test-flow
    content: 验证不同卦名/卦辞/爻辞点击与弹窗交互、变爻操作互不干扰
    status: completed
    dependencies:
      - wire-events
---

## 用户需求

- 在六十四卦查询模块的详情页中（卦名、卦辞、爻辞展示区域），每个汉字都需独立可点击。
- 点击任意汉字后，需在局部放大该汉字（突出被选中字符），并在旁侧弹出信息窗口。
- 弹窗需展示该汉字的「起源」「最初含义」「后续含义演变」三类文本信息。
- 仅限查询详情页，其它模块保持现状；界面及交互要与现有风格统一。

## 产品概述

在六十四卦查询详情页增加字级点击交互与释义弹窗，帮助学习者即时了解卦辞、爻辞及卦名中的每个汉字出处和含义，加强对经文的理解。

## 核心特性

1. 查询详情页文字逐字点击：卦名、卦辞、爻辞文本按汉字拆分渲染，悬浮与点击有视觉反馈。
2. 单字放大与弹窗：点击后该字局部放大高亮，并在右侧或附近弹出释义窗口。
3. 字源数据展示：窗口内列出该字的起源、最初含义、后续含义演变；支持基础兜底文案。

## 技术选型

- 复用现有 HTML/CSS/Vanilla JS 结构。
- 在 `app.js` 中新增字符交互渲染与事件逻辑；在 `index.html` 中扩展样式与弹窗容器。
- 新增或扩展 `character-origin-data.js`（若不存在则创建）保存汉字释义数据。

## 实现方案

1. **数据层**：准备 `characterOriginData`（对象映射），包含常用汉字的起源/含义/演变；未找到时使用兜底描述。
2. **渲染层**：

- 新增 `formatInteractiveText` 等工具方法，把字符串转换为逐字 `<span>`/`<ruby>`，附带 `data-char`。
- 在 `showGuaDetail` 中用该函数渲染 `cxGuaName`、`cxTuanshi`。
- 在 `renderYaociList` 中将每条爻辞的标题与正文逐字渲染。

3. **交互层**：

- 统一事件代理（click & keydown）捕获 `.char-trigger`；点击时高亮并调用弹窗填充。
- 高亮策略：为被点字符添加 `active-char` 类，控制放大与色彩；点击其它处或关闭弹窗后移除。
- 弹窗布局：在 `index.html` 追加侧边/浮动容器，内容区展示三段文本，支持关闭按钮与遮罩；可沿袭玻璃拟态风格，与主界面一致。

4. **样式层**：

- 字符 hover/active 状态（放大、描边、阴影）。
- 弹窗定位（右侧固定 or 相对父容器），响应式兼容移动端。
- 选中字的过渡效果与弹窗动画保持统一调性。

5. **可扩展性**：

- 字源数据独立文件便于继续扩容。
- 渲染工具可复用到其他模块（如后续需要）。

## 实施备注

- 仅在 `chaxun` 模块应用新渲染，避免影响其他练习模块。
- 注意 `renderYaociList` 内点击变爻逻辑：需区分点字符 vs 点整条；可通过阻止事件冒泡或条件判断处理。
- 弹窗需考虑多次点击不同字符时更新内容而非重复创建；注意滚动区域高度及移动端遮挡。

## 架构设计

- `character-origin-data.js`: 保存 `characterOriginData` 字典。
- `app.js`: 
- 新增工具函数：`formatInteractiveText`、`openCharacterOriginPopup`、`closeCharacterOriginPopup` 等。
- 增加事件绑定（在 `window.onload`）。
- 修改 `showGuaDetail`、`renderYaociList` 调用。
- `index.html`: 
- 增补 `.char-trigger` 样式、弹窗结构、遮罩层。
- 引入新脚本文件。

## 目录结构（修改说明）

- `index.html` `[MODIFY]`：新增字符交互样式、弹窗 DOM。
- `app.js` `[MODIFY]`：添加字符渲染工具、事件逻辑、更新查询详情渲染。
- `character-origin-data.js` `[NEW or MODIFY]`：提供汉字释义数据；若已存在则补足字段。