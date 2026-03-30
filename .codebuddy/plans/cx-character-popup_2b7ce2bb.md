---
name: cx-character-popup
overview: 在六十四卦查询详情页实现卦名/卦辞/爻辞逐字点击并展示字源弹窗
design:
  architecture:
    framework: html
  styleKeywords:
    - 双栏布局
    - 玻璃拟态
    - 交互式文字
    - 响应式适配
  fontSystem:
    fontFamily: system-ui
    heading:
      size: 28px
      weight: 600
    subheading:
      size: 20px
      weight: 500
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#667EEA"
      - "#8A63D2"
    background:
      - "#FFFFFF"
      - "#F6F8FF"
    text:
      - "#27304F"
      - "#3F4657"
    functional:
      - "#4CAF50"
      - "#F44336"
todos:
  - id: init-char-data
    content: 在 app.js 中创建字源映射和弹窗状态常量
    status: completed
  - id: render-clickable-text
    content: 实现逐字按钮渲染与字源信息函数
    status: completed
    dependencies:
      - init-char-data
  - id: detail-events
    content: 改写 showGuaDetail/爻辞列表并绑定弹窗事件
    status: completed
    dependencies:
      - render-clickable-text
  - id: style-structure
    content: 更新 index.html 样式与 DOM，完善响应式布局
    status: completed
    dependencies:
      - detail-events
  - id: conflict-test
    content: 复测汉字点击与变爻交互，确认无冲突
    status: completed
    dependencies:
      - style-structure
---

## User Requirements

- 将六十四卦查询详情页的卦名、卦辞、爻辞文字全部拆成可点击的汉字按钮
- 点击单字后需高亮放大、保持原位置，并在右侧信息面板展示起源、最初含义、演变
- 保持爻辞空白区域可标记变爻且与汉字点击互不干扰
- 其他模块外观与逻辑保持不变

## Product Overview

在现有查询详情页中扩展逐字交互与字源弹窗，通过右侧信息面板即时呈现汉字释义，提升经文学习深度。布局需兼顾桌面与移动端，交互闭环（点击、关闭、按 Esc、点击空白）完整。

## Core Features

- 逐字渲染：卦名/卦辞/爻辞拆分为带注音的按钮，附 aria 属性
- 字源数据：内置常用汉字释义字典，不足部分提供兜底文案
- 弹窗交互：侧边面板展示释义，支持高亮同步、点击空白或 Esc 关闭
- 冲突规避：爻辞整条点击继续标记变爻，字符点击不触发变爻逻辑

## Tech Stack Selection

- 继续使用现有原生 HTML + CSS + Vanilla JS 结构
- 数据来源沿用 `yizhou-data.js`、`pinyin-data.js`，新增字源映射常量即可
- 事件绑定统一在 `app.js`，样式与 DOM 修改集中在 `index.html`

## Implementation Approach

1. **数据层**：在 `app.js` 定义 `cxCharacterOriginMap` 与兜底文本，并维护 `cxActiveCharacter` 状态。
2. **渲染层**：实现 `renderClickableCharacter`/`formatClickableText` 将字符串转换为 `<button>`，在 `showGuaDetail`、`renderYaociList` 中应用，保留注音。
3. **交互层**：实现 `openCharacterPanel`、`closeCharacterPanel`、`handleCharacterClick`，通过事件代理与 `bindCharacterPanelEvents` 管理点击、关闭、Esc、点击外部等场景，确保 `toggleYaociChange` 忽略来自 `.cx-char-btn` 的点击。
4. **样式与结构**：在 `index.html` 新增 `cx-detail-layout`、`.cx-char-btn*`、`.cx-char-panel*` 样式及右侧 `<aside>` 结构，确保响应式视图下弹窗移动到上方并保持粘性。
5. **性能与兼容**：按钮渲染基于 `Array.from` 单次遍历，事件代理避免为每个字单独绑定；弹窗状态重置在 `initChaXun`/`showGuaDetail` 中防止跨卦残留。

## Implementation Notes

- 逐字按钮需设置 `aria-label`，便于可访问性。
- 事件处理中使用 `event.target.closest('.cx-char-btn')` 区分点击源，必要时调用 `stopPropagation`。
- 移动端布局下避免 `position: sticky` 导致遮挡，面板设置 `order: -1`。
- 渲染过程中保留原有 `ruby` 结构，未匹配到拼音时改用 `span`。
- 关闭面板时需清理 `.active` 类，防止多字高亮。
- 保证 `toggleYaociChange` 只处理非字符按钮触发，可检查 `document.activeElement` 或事件冒泡。

## Architecture Design

- `app.js`
- 新增：`cxCharacterOriginMap`、`cxActiveCharacter`
- 新函数：`getCharacterOriginInfo`、`renderClickableCharacter`、`formatClickableText`、`open/closeCharacterPanel`、`handleCharacterClick`、`bindCharacterPanelEvents`
- 修改：`initChaXun`、`showGuaDetail`、`renderYaociList`、`toggleYaociChange`
- `index.html`
- 添加字符按钮与面板样式、响应式规则
- 扩展查询详情 DOM，为右侧弹窗预留 `<aside>`

## Directory Structure

project-root/
├── app.js  # [MODIFY] 新增字源映射与弹窗逻辑；改写渲染/事件函数，确保爻辞点击互不干扰。
└── index.html  # [MODIFY] 增加字符按钮样式、右侧弹窗 DOM、移动端适配及提示文案。

## 设计方案

- **布局**：查询详情采用左右双栏；左侧保留原内容，右侧新增玻璃拟态面板。移动端采用单列并将弹窗置于内容上方。
- **交互**：汉字按钮 hover/active 时轻微放大与渐变背景；面板含标题区、三段释义，支持关闭按钮与点击空白关闭。
- **视觉**：沿用主色 (#667eea) 与渐变背景，面板使用柔和阴影与圆角，按钮保持简洁边框。