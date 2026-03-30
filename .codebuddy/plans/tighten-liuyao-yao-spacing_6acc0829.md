---
name: tighten-liuyao-yao-spacing
overview: 调整六爻起卦页面中实时卦象的显示样式，缩小各爻之间的纵向间距，使其更接近用户截图中的紧凑展示效果。
todos:
  - id: review-liuyao-scope
    content: 使用[subagent:code-explorer]复核六爻起卦样式与渲染影响范围
    status: completed
  - id: tighten-yao-spacing
    content: 调整index.html中.yao-display与.yao-line的纵向间距参数
    status: completed
    dependencies:
      - review-liuyao-scope
  - id: verify-liuyao-visual
    content: 验证六爻从下到上显示、红黑颜色与紧凑效果一致
    status: completed
    dependencies:
      - tighten-yao-spacing
---

## User Requirements

将“六爻起卦”页面中红框标出的卦象显示区域调整得更紧凑，缩小六条爻之间的上下视觉间距，使效果更接近参考图2。仅处理该区域的显示样式，不涉及起卦逻辑、数据计算、颜色规则或交互流程改动。

## Product Overview

当前页面会在投掷铜钱过程中，从下往上逐条显示六爻。需要保留现有展示顺序、阴阳爻符号、老阴老阳红色高亮效果与整体页面结构，同时让卦象在视觉上更集中、更像一个完整卦形，避免中间留白过大。

## Core Features

- 压缩六爻展示区域的纵向留白
- 优化每条爻的字号、行高或容器高度，使卦形更紧凑
- 保持从下往上追加显示的现有表现不变
- 保持普通爻黑色、老爻红色的现有区分效果

## Tech Stack Selection

- 现有项目为原生 HTML + 内联 CSS + 原生 JavaScript
- 本次修改应复用现有单文件样式组织方式，优先在 `d:/project/zhouYiMaster/index.html` 中完成样式微调
- 六爻渲染逻辑位于 `d:/project/zhouYiMaster/app.js`，当前无需变更逻辑实现

## Implementation Approach

通过收紧六爻容器 `.yao-display` 的最小高度、内边距和相关纵向留白，并同步微调 `.yao-line` 的字号与行高，直接改善卦象竖向密度。该方案只影响“六爻起卦”实时展示区域，避免波及查询页和其他使用 `.gua-symbol` 的模块，改动范围小、回归风险低。

关键决策：

- 优先调整 `#lyYaoDisplay` 对应样式，而不是改 `renderYaoSymbol(total)` 逻辑，因为当前问题来自布局密度，不是渲染顺序或数据错误
- 继续保留 `flex-direction: column-reverse`，保证从下往上累积显示的行为不变
- 仅微调已有样式参数，不引入新结构或新渲染方式，避免技术债与额外兼容问题

性能与可靠性：

- 本次主要是静态样式调整，运行时复杂度不变，仍为每次投掷 O(1) 追加一个节点、完成六爻总计 O(6)
- 不增加额外 DOM 遍历、事件绑定或动画负担
- 风险点主要在移动端视觉适配；通过小范围样式修正可控验证

## Implementation Notes

- 仅修改 `d:/project/zhouYiMaster/index.html` 中 `.yao-display` 与 `.yao-line`，避免影响 `.gua-symbol-container`、查询模块和详情模块
- 若需进一步贴近参考图，可优先从 `min-height`、`padding`、`font-size`、`line-height` 四个参数联动微调，而不是单独压缩 `gap`
- 保持 `.yao-line.old` 与 `.yao-line.normal` 颜色定义不变，确保老阴老阳高亮规则稳定
- 不做无关样式重构，控制影响面在 `#lyYaoDisplay` 实时卦象区域内

## Architecture Design

本次为现有页面样式层局部优化，沿用当前结构：

- `index.html`
- 定义“六爻起卦”页面结构
- 提供 `#lyYaoDisplay`、`.yao-display`、`.yao-line` 的样式与容器
- `app.js`
- `renderYaoSymbol(total)` 负责向 `#lyYaoDisplay` 追加爻元素
- `tossCoins()` 驱动逐爻展示流程

数据与渲染关系：
`投掷结果 total` → `renderYaoSymbol(total)` → 追加 `.yao-line` → 由 `.yao-display` / `.yao-line` 控制最终紧凑程度

## Directory Structure

## Directory Structure Summary

本次实现为已有页面的局部样式优化，预计只需修改 1 个文件，逻辑文件仅作为确认依赖，无需调整。

d:/project/zhouYiMaster/
├── index.html  # [MODIFY] 六爻起卦页面样式定义文件。调整 `.yao-display` 与 `.yao-line` 的纵向布局参数，压缩卦象显示间距，使实时六爻展示更紧凑，同时保持现有颜色、高亮与排列方向不变。
└── app.js      # [AFFECTED] 六爻实时渲染逻辑文件。`renderYaoSymbol(total)` 继续复用现有追加节点逻辑，无需改动，但需要在联调时确认样式调整后显示效果与逐爻流程一致。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在执行前复核六爻起卦相关样式与调用链，确保只修改目标区域，不误伤其他卦象展示模块
- Expected outcome: 明确最终改动边界，仅锁定 `index.html` 中实时六爻展示样式相关位置