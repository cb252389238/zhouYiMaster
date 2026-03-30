---
name: complete-all-pinyin-coverage
overview: 补充所有缺失汉字的拼音映射（约217个），确保卦辞爻辞100%拼音覆盖
todos:
  - id: scan-all-characters
    content: 使用 [subagent:code-explorer] 扫描经文获取完整缺失汉字列表
    status: completed
  - id: generate-pinyin-dictionary
    content: 按拼音首字母A-Z生成完整的217个汉字拼音映射代码
    status: completed
    dependencies:
      - scan-all-characters
  - id: update-pinyin-data
    content: 将生成的拼音映射添加到 pinyin-data.js
    status: completed
    dependencies:
      - generate-pinyin-dictionary
  - id: verify-full-coverage
    content: 验证所有经文汉字100%覆盖，检查文件诊断
    status: completed
    dependencies:
      - update-pinyin-data
---

## 用户需求

为易经学习工具中所有显示卦辞爻辞的地方补充完整拼音，实现100%汉字拼音覆盖。

## 当前问题

1. **拼音覆盖率不足**：当前拼音字典仅覆盖263个汉字，经文中有约480个唯一汉字
2. **缺失约217个常见字**：如"之、不、上、下、天、地、人、者、也、以、于、为、其、而、则、所、曰、子、君、吉、凶、龙、飞、首、身、心、德、道、行、言、事、时、日、月、一、二、三、四、五、六、七、八、九、十、小、利、用、狱、鱼"等高频字缺失拼音

## 产品概述

用户进入爻辞卦辞练习或六十四卦查询模块后，所有经文内容（卦辞、爻辞）的每个汉字都应显示上方拼音注音，确保100%覆盖率，提升阅读和学习体验。

## 核心功能

- 补充约217个缺失汉字的拼音映射
- 实现经文100%拼音覆盖
- 保持现有注音渲染逻辑不变
- 确保练习模块和查询模块统一显示

## 技术栈

- 原生HTML + CSS + JavaScript
- 拼音数据源：`pinyin-data.js` 中的 `pinyinMap` 对象
- 注音渲染：`app.js` 中的 `formatTextWithPinyin()` 函数
- 样式文件：`index.html` 中的 `<style>` 标签

## 实现方案

采用"补充拼音字典"的方案完成需求：

1. **全面补充拼音映射**：按拼音首字母A-Z排序，补充约217个缺失汉字
2. **保持渲染逻辑**：复用现有的 `formatTextWithPinyin()` 函数，无需修改
3. **验证覆盖完整性**：通过脚本扫描验证100%覆盖率

## 技术决策

- **为什么不修改渲染逻辑**：现有 `formatTextWithPinyin()` 函数已正确实现，问题仅在字典覆盖不足
- **拼音排序策略**：按拼音首字母分组组织，便于维护和查找
- **向后兼容**：新增拼音映射不影响现有功能

## 性能与可靠性

- 字典查找为O(1)哈希操作，补充200+条目无性能影响
- 未命中字典的字符仍按原字符显示，保持容错性

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 全面扫描经文提取所有汉字，与拼音字典对比，确认缺失清单
- Expected outcome: 获得精确的缺失汉字列表（约217个），按拼音首字母分组