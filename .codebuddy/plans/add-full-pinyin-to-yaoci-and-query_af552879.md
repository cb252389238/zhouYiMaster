---
name: add-full-pinyin-to-yaoci-and-query
overview: 为爻辞卦辞练习与六十四卦查询中的卦辞、爻辞补齐并统一显示正确拼音，同时补全拼音映射数据以覆盖经文中的生僻字。
todos:
  - id: audit-pinyin-coverage
    content: 使用 [subagent:code-explorer] 复核经文渲染链路与拼音缺失范围
    status: completed
  - id: update-practice-pinyin-render
    content: 修改 app.js 中练习模块卦辞爻辞选项与答案提示注音渲染
    status: completed
    dependencies:
      - audit-pinyin-coverage
  - id: preserve-answer-matching
    content: 调整 app.js 正确答案高亮逻辑以兼容注音 HTML
    status: completed
    dependencies:
      - update-practice-pinyin-render
  - id: extend-pinyin-dictionary
    content: 补齐 pinyin-data.js 中卦辞爻辞所需拼音映射
    status: completed
    dependencies:
      - audit-pinyin-coverage
  - id: verify-query-and-practice
    content: 检查两个模块的卦辞爻辞注音完整性与文件诊断
    status: completed
    dependencies:
      - preserve-answer-matching
      - extend-pinyin-dictionary
---

## User Requirements

需要为两个模块中的经文内容统一补上正确拼音：

- `爻辞卦辞练习` 中展示的卦辞选项、爻辞选项，以及答错后显示的正确答案，都要显示拼音注音
- `六十四卦查询` 中展示的卦辞、爻辞都要确保带有正确拼音，不遗漏生僻字

## Product Overview

页面中所有卦辞、爻辞在阅读和练习时，都应以“汉字上方拼音”的形式展示。用户进入练习题或查询详情后，看到的是完整、统一、可读性强的注音经文，而不是部分有拼音、部分无拼音，或有字缺失拼音。

## Core Features

- 为爻辞卦辞练习模块的卦辞题目、爻辞题目和正确答案提示接入拼音渲染
- 保持练习判题逻辑基于原始经文字符串，不因改为 HTML 注音而误判
- 补齐拼音字典中卦辞、爻辞涉及的缺失汉字映射，提升六十四卦查询与练习模块的注音完整度
- 保持现有详情页卦辞、爻辞注音展示方式一致，视觉上继续使用 ruby 注音效果

## Tech Stack Selection

- 现有项目技术栈：原生 HTML + CSS + JavaScript
- 数据来源：`yizhou-data.js` 中的六十四卦卦辞、爻辞文本
- 注音机制：`app.js` 中 `formatTextWithPinyin(text)` + `pinyin-data.js` 中 `pinyinMap`

## Implementation Approach

采用“复用现有注音渲染函数 + 补齐字典覆盖”的方案完成需求。已有 `六十四卦查询` 已接入 `formatTextWithPinyin()`，本次重点把 `爻辞卦辞练习` 的题目与答案提示切换为同一套注音渲染，并扩充 `pinyin-data.js` 中经文实际用字的拼音映射，保证两个模块输出一致。

关键技术决策：

- 继续复用 `formatTextWithPinyin()`，避免新增第二套注音逻辑，降低维护成本
- 练习题按钮由 `textContent` 改为 `innerHTML` 渲染注音，但点击回调仍传原始 `option` 字符串，确保判题比较逻辑不变
- “标出正确答案”不再依赖按钮文本与原文精确比对，而应采用原始答案值或数据标记进行匹配，避免 ruby 注音后的 DOM 文本影响正确项高亮
- 仅补充经文所需拼音映射，不改动原始卦辞/爻辞数据内容，控制影响面

性能与可靠性：

- 题目渲染和详情渲染均为线性字符遍历，单段经文复杂度为 O(n)，文本量很小，性能开销可忽略
- 主要风险点在于拼音字典缺字与 HTML 渲染后判题高亮失效；前者通过扫描数据源补齐映射，后者通过保留原始答案值解决
- 保持向后兼容：未命中字典的字符仍按原字符显示，不阻断页面功能

## Implementation Notes

- 练习模块只修改经文展示相关节点，不调整题目流程、得分、翻题逻辑
- 查询模块已有卦辞/爻辞注音逻辑应保持不动，重点验证是否因字典缺失导致个别字未注音
- `pinyin-data.js` 当前注释表明它原本偏“详情页阅读辅助”，本次需要扩展为覆盖两模块经文的统一拼音字典
- 修改后应优先检查 `app.js` 中 `checkYaoCiAnswer()` 的正确项标记逻辑和 `pinyin-data.js` 语法完整性

## Architecture Design

当前结构已满足本次需求，无需新增模块：

- `yizhou-data.js`：提供经文原始文本
- `pinyin-data.js`：提供汉字到拼音的静态映射
- `app.js`
- `formatTextWithPinyin()`：统一注音渲染入口
- `showGuaCiQuestion()` / `showYaoCiQuestion()`：练习模块题目渲染
- `checkYaoCiAnswer()`：练习模块答案反馈
- `showGuaDetail()` / `renderYaociList()`：查询模块详情渲染

本次是在既有渲染链路上补齐覆盖，不引入新架构。

## Directory Structure

## Directory Structure Summary

本次实现基于现有原生前端结构，主要修改练习模块的经文渲染逻辑，并扩展拼音字典覆盖范围。

d:/project/zhouYiMaster/
├── app.js  # [MODIFY] 经文注音渲染主逻辑文件。为爻辞卦辞练习模块的卦辞选项、爻辞选项、错误提示接入 `formatTextWithPinyin()`；同时调整正确答案高亮逻辑，避免 `innerHTML` 注音后因文本比较失效而误判。
├── pinyin-data.js  # [MODIFY] 拼音映射字典。补齐六十四卦卦辞、爻辞涉及的缺失汉字拼音，确保查询与练习模块中的经文尽可能完整显示正确注音。
└── yizhou-data.js  # [AFFECTED] 六十四卦原始数据源。作为字典补齐的核对依据，原则上不直接修改内容。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 复核经文渲染入口、题目判定链路与数据覆盖范围，帮助锁定需要修改的具体代码位置
- Expected outcome: 明确 `app.js` 与 `pinyin-data.js` 的精确改动范围，确保方案既完整又不影响现有练习逻辑