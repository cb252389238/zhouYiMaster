---
name: 六爻起卦功能优化
overview: 优化六爻起卦页面的交互体验，包括调整爻线间距、加快铜钱动画速度、优化卦象结果显示方式和按钮布局
todos:
  - id: adjust-css-animation
    content: 修改 index.html 铜钱动画时长从1.5s改为0.8s
    status: completed
  - id: adjust-yao-spacing
    content: 修改 index.html 爻线间距gap从8px改为3px，添加卦名显示样式
    status: completed
  - id: add-button-container
    content: 修改 index.html 添加按钮区域容器lyButtonArea，用于动态替换按钮
    status: completed
  - id: sync-js-delay
    content: 修改 app.js tossCoins函数中setTimeout延迟从1500ms改为800ms
    status: completed
  - id: update-showresult
    content: 修改 app.js showLiuYaoResult函数：添加卦名显示、简化卦象信息、替换按钮
    status: completed
  - id: update-init-function
    content: 修改 app.js initLiuYao函数：重置按钮区域、清空卦名显示
    status: completed
---

## 用户需求

对六爻起卦功能进行四项调整：

### 1. 调整爻线间距

- 当前爻线间距（gap）为8px，显示过于分散
- 需要调整为更紧凑的间距（3px左右）

### 2. 加快铜钱翻转动画速度

- 当前动画时长为1.5秒，转动速度较慢
- 需要加快动画速度至0.8秒左右

### 3. 摇出卦后的UI调整

- 在铜钱上方显示卦名
- 移除"投掷铜钱"按钮
- 在原按钮位置添加两个新按钮："重新起卦"和"卦象详情"
- 点击"卦象详情"跳转到六十四卦查询的卦象详情页面

### 4. 简化卦象信息展示

- 移除卦辞和爻辞内容
- 保留卦符号显示
- 保留变卦信息（如果有变爻）
- 在卦象结果区域添加"卦象详情"按钮

## 产品概述

优化六爻起卦功能的用户体验，使界面更紧凑、动画更流畅、信息展示更简洁。

## 核心功能

- 紧凑的爻线展示
- 流畅快速的铜钱翻转动画
- 简洁的卦象结果展示
- 一键跳转到完整卦象详情页面

## 技术栈

- 前端：HTML + CSS + JavaScript
- 项目类型：单页应用（SPA）

## 实现方案

### 1. CSS动画优化

**修改位置**：`index.html` 第397-422行

**当前代码**：

```css
.ly-coin-wrapper.rolling {
    animation: flip3d 1.5s ease-out;
}
```

**调整方案**：

- 将动画时长从 `1.5s` 改为 `0.8s`
- 保持原有的3D翻转效果不变

### 2. 爻线间距调整

**修改位置**：`index.html` 第424-434行

**当前代码**：

```css
.yao-display {
    gap: 8px;
    min-height: 180px;
}
```

**调整方案**：

- 将 `gap` 从 `8px` 改为 `3px`
- 添加 `position: relative` 支持绝对定位的卦名显示
- 添加 `.gua-name-display` 样式用于在爻象区域顶部显示卦名

### 3. JavaScript动画延迟同步

**修改位置**：`app.js` 第948行

**当前代码**：

```javascript
}, 1500);
```

**调整方案**：

- 将 `setTimeout` 延迟从 `1500ms` 改为 `800ms`，与CSS动画时长同步

### 4. 摇出卦后显示逻辑调整

**修改位置**：`app.js` 第951-1079行 `showLiuYaoResult()` 函数

**调整方案**：

- 在爻象展示区域顶部添加卦名显示（绝对定位）
- 简化卦象结果HTML：移除卦辞爻辞列表，仅保留卦符号和变卦信息
- 替换投掷按钮为"重新起卦"和"卦象详情"两个按钮
- "卦象详情"按钮调用已有的 `showLiuYaoDetail()` 函数（第1080行）跳转到六十四卦查询页面

### 5. 初始化函数调整

**修改位置**：`app.js` `initLiuYao()` 函数

**调整方案**：

- 重置时恢复按钮区域为"投掷铜钱"按钮
- 清空爻象区域时移除卦名显示

## 技术细节

### 按钮替换逻辑

在 `showLiuYaoResult()` 中，通过修改按钮区域的innerHTML实现按钮替换：

```javascript
document.getElementById('lyButtonArea').innerHTML = `
    <button class="option-btn" onclick="resetLiuYao()">重新起卦</button>
    <button class="option-btn" onclick="showLiuYaoDetail()">卦象详情</button>
`;
```

### 卦名显示逻辑

在爻象展示区域顶部添加卦名（绝对定位）：

```javascript
const guaNameDiv = document.createElement('div');
guaNameDiv.className = 'gua-name-display';
guaNameDiv.textContent = guaNameDisplay;
document.getElementById('lyYaoDisplay').appendChild(guaNameDiv);
```

### 简化卦象信息

移除卦辞和爻辞列表的HTML生成代码，仅保留：

- 卦符号（大字号显示）
- 变卦信息（如果有变爻）
- 两个操作按钮

## 目录结构

```
d:/project/zhouYiMaster/
├── index.html  # [MODIFY] CSS样式调整（动画速度、爻线间距、卦名样式）和HTML结构调整（按钮区域容器）
├── app.js      # [MODIFY] tossCoins延迟调整、showLiuYaoResult简化、initLiuYao重置逻辑
├── image/      # 图片资源目录（不变）
├── pinyin-data.js  # 拼音数据（不变）
└── yizhou-data.js  # 易经数据（不变）
```