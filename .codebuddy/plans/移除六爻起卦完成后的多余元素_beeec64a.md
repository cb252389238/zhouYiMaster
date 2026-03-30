---
name: 移除六爻起卦完成后的多余元素
overview: 移除六爻起卦完成后显示的卦象图、变卦信息和灰色按钮,只保留底部绿色的"重新起卦"和"卦象详情"按钮
todos:
  - id: modify-result-display
    content: 修改app.js中showLiuYaoResult函数，清空resultDiv内容，移除卦象图、变卦信息和灰色按钮
    status: completed
  - id: verify-buttons
    content: 验证只保留绿色按钮，功能正常
    status: completed
    dependencies:
      - modify-result-display
---

## 用户需求

移除六爻起卦完成后红色框选中的元素：

1. 灰色"重新起卦"和"卦象详情"按钮
2. 卦象图
3. 变卦信息（变卦：天地否卦）

## 保留内容

- 底部的绿色"重新起卦"和"卦象详情"按钮
- 卦名显示（显示在进度区域lyProgress）

## 目标

简化结果展示页面，只保留操作按钮，卦象和变卦信息不再显示在当前页面（可在卦象详情页查看）。

## 技术栈

- 纯前端项目：HTML + CSS + JavaScript
- 项目位置：`d:/project/zhouYiMaster/`

## 实现方案

修改`showLiuYaoResult`函数（app.js 972-1060行）：

1. 清空`resultDiv.innerHTML`，不再渲染卦象图、变卦信息、灰色按钮
2. 保留`buttonArea.innerHTML`的绿色按钮渲染逻辑
3. 保持卦名显示在`lyProgress`区域的逻辑不变

## 关键代码定位

- 目标文件：`d:/project/zhouYiMaster/app.js`
- 目标函数：`showLiuYaoResult`，行号972-1060
- 需要修改的内容：resultDiv.innerHTML的赋值语句（1039-1051行）

## 变更范围

- 只修改`showLiuYaoResult`函数
- 不再计算和渲染变卦信息（bianGuaHtml）
- 不再渲染卦象符号（gua.symbol）
- 不再渲染灰色按钮（next-btn）