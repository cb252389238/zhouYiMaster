---
name: fix-chaxun-detail-back-button
overview: 调整六十四卦查询详情页的导航文案与行为，使底部返回按钮从“返回首页”改为“返回上一页”，并与当前页面层级语义一致。
todos:
  - id: verify-query-detail-nav
    content: 使用 [subagent:code-explorer] 复核查询详情页返回按钮与导航链路
    status: completed
  - id: update-detail-back-label
    content: 修改 index.html 中详情页按钮文案为返回上一页
    status: completed
    dependencies:
      - verify-query-detail-nav
  - id: regression-check-query-nav
    content: 检查返回首页、返回上一页、返回本卦三类按钮语义一致性
    status: completed
    dependencies:
      - update-detail-back-label
---

## User Requirements

六十四卦查询详情页面当前存在两个“返回首页”按钮，其中详情区域内、下方那个按钮的实际作用并不是回到首页，而是返回到上一层八卦选择页。需要将这个按钮文案改为“返回上一页”，使文字与实际行为一致。

## Product Overview

六十四卦查询模块包含查询选择页与卦象详情页两层内容。用户进入详情页后，顶部保留模块级“返回首页”，详情区内部的返回按钮应明确表达“回到上一层查询页”的含义，避免误导。

## Core Features

- 将详情区域内绑定 `backToBaguaSelect()` 的按钮文案从“返回首页”改为“返回上一页”
- 保持该按钮现有返回逻辑不变，仍返回八卦选择页
- 保持模块顶部真正回首页的按钮及其他导航按钮文案、位置、交互不变

## Tech Stack Selection

- 现有项目：原生 HTML + CSS + JavaScript 静态页面
- 导航与页面切换：通过 `index.html` 中按钮 `onclick` 绑定 `app.js` 中函数实现
- 本次修改应延续现有内联事件与 DOM 结构，不引入新框架或新状态管理方式

## Implementation Approach

采用最小改动策略，只调整 `index.html` 中六十四卦查询详情区域内目标按钮的显示文案，不变更 `app.js` 的 `backToBaguaSelect()` 逻辑。该方案直接修正文案与行为不一致的问题，影响范围最小，回归成本低，也能避免对查询模块已有状态重置流程产生副作用。

关键决策：

- 不改函数名和逻辑：`backToBaguaSelect()` 当前行为已准确实现“返回上一层查询页”，无需额外改造
- 不新增历史栈：用户需求仅是修正文案，不涉及浏览历史或多级返回机制，避免过度设计
- 不调整其他“返回首页”按钮：按用户范围仅修改详情页内部那个按钮，保持模块级首页返回入口稳定

性能与可靠性：

- 本次仅修改静态按钮文本，无运行时性能成本
- 无新增状态、无额外 DOM 遍历、无异步逻辑
- 变更复杂度 O(1)，风险点仅限单一模板文案

## Implementation Notes

- 仅修改 `#cxGuaDetail` 内第一个返回按钮文本，保持 `onclick="backToBaguaSelect()"` 不变
- 不触碰 `showHome()`、`backToRootGua()`、`jumpToGua()`、`jumpToBianGua()` 等现有导航链路
- 避免顺手重构“返回”体系，防止影响六爻起卦跳转详情、本卦返回等既有流程

## Architecture Design

现有结构为单页静态应用：

- `index.html` 负责页面结构与按钮入口
- `app.js` 负责模块显示切换与查询详情导航逻辑

本次改动只落在视图层文案：

- 模块级返回：首页
- 详情级返回：上一页（八卦选择页）

无需调整系统结构或模块关系。

## Directory Structure

## Directory Structure Summary

本次实现仅修改六十四卦查询详情页中的一个按钮文案，不涉及新增文件或逻辑重构。

d:/project/zhouYiMaster/
├── index.html  # [MODIFY] 六十四卦查询模块页面结构。将 `#cxGuaDetail` 内绑定 `backToBaguaSelect()` 的按钮文字由“← 返回首页”改为“← 返回上一页”，确保与实际返回到八卦选择页的行为一致。
└── app.js      # [AFFECTED] 查询模块导航逻辑文件。本次无需修改，实现上依赖现有 `backToBaguaSelect()` 继续负责返回上一层选择页。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在计划阶段核实六十四卦查询详情页按钮位置、文案和返回逻辑归属
- Expected outcome: 明确本次只需调整 `index.html` 中目标按钮文案，无需改动 `app.js` 逻辑