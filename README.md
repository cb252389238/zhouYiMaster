# 易师

易师是一个面向移动端的周易学习与占测记录工具，当前基于 `Vanilla HTML + CSS + JavaScript + Capacitor Android` 实现。

项目包含以下核心模块：

- 卦象练习
- 卦名记忆
- 爻辞卦辞练习
- 六十四卦查询
- 六爻起卦
- 梅花易数起卦
- 画符起卦
- 易策记录与复盘
- 拼音辅助学习

## 项目结构

```text
.
├── www/
│   ├── index.html          # 主页面结构
│   ├── app.js              # 应用入口与剩余公共壳层
│   ├── base.css            # 基础样式
│   ├── components.css      # 通用组件样式
│   ├── yice.css            # 易策样式
│   ├── meihua.css          # 梅花样式
│   ├── huafu.css           # 画符样式
│   ├── ui-common.js        # 通用提示/交互工具
│   ├── gua-common.js       # 通用卦象构建工具
│   ├── text-render.js      # 注音与可点击文本渲染
│   ├── char-panel.js       # 汉字释义面板
│   ├── update.js           # 版本更新检测
│   ├── guaxiang.js         # 卦象练习模块
│   ├── practice-memory.js  # 卦名/爻辞练习模块
│   ├── chaxun.js           # 六十四卦查询模块
│   ├── liuyao.js           # 六爻模块
│   ├── meihua.js           # 梅花模块
│   ├── huafu.js            # 画符模块
│   ├── yice-state.js       # 易策状态层
│   ├── yice-db.js          # 易策数据层
│   ├── yice-ui.js          # 易策界面层
│   ├── yizhou-data.js      # 卦象数据
│   ├── pinyin-data.js      # 拼音数据
│   └── image/              # 静态资源
├── android/                # Capacitor Android 工程
├── scripts/                # 工程化脚本
├── capacitor.config.json   # Capacitor 配置
├── version.json            # 应用版本信息
└── package.json            # Node 依赖
```

## 本地运行

这是一个静态前端项目，开发调试时直接启动静态服务器即可。

### 方式一

```bash
npx serve .
```

### 方式二

```bash
python3 -m http.server 8000
```

然后浏览器打开 `http://localhost:8000/www/` 或按你的静态服务目录结构访问页面。

## Android 打包

## 工程化脚本

### 同步版本号

将一个版本号同步到以下位置：

- `version.json`
- `www/version.json`
- `package.json`
- `android/app/build.gradle`

其中 Android `versionCode` 会根据版本号自动计算，无需手工维护。

```bash
npm run version:sync -- 1.0.0.4
```

### 发布前检查

检查内容包括：

- 所有核心 JS 模块语法检查
- `version.json` / `www/version.json` / `package.json` / `android/app/build.gradle` 版本一致性检查

```bash
npm run check:release
```

### 一键 APK 发布辅助流程

会自动执行：

- 发布前检查
- `npx cap sync android`
- Android release 构建
- 将 APK 复制到 `release/` 目录

```bash
npm run release:apk
```

## Android 打包

### 1. 同步 Web 资源到 Android 工程

```bash
npx cap sync android
```

### 2. 构建 release APK

```bash
cd android
./gradlew assembleRelease
```

生成产物通常位于：

```text
android/app/build/outputs/apk/release/app-release.apk
```

如果需要放到项目根目录，可手动复制：

```bash
cp android/app/build/outputs/apk/release/app-release.apk ./zhouYiMaster-release.apk
```

### 推荐发布流程

```bash
npm run version:sync -- 1.0.0.4
npm run release:apk
```

## 易策数据说明

易策当前使用 SQLite 持久化，数据库文件名为 `yishi.db`。

### 已存储的数据

- 易策记录
- 易策分类
- 复盘记录

### 主要数据表

- `yice_records`
- `yice_categories`
- `yice_meta`

### 备份行为

当前备份导出的是整个 SQLite 数据库文件，因此会同时包含：

- 易策记录
- 自定义分类
- 复盘数据

### 升级安装行为

正常覆盖安装新版本时，只要满足以下条件，易策数据会保留：

- 包名不变
- 签名不变
- 没有先卸载旧版

以下情况可能导致数据丢失：

- 卸载应用后重新安装
- 手动清除应用存储
- 更换包名
- 更换签名导致不能覆盖安装

## 当前开发现状

项目已完成一轮较大规模的前端模块化整理，核心业务和公共层已拆分为多个脚本与样式文件。后续仍建议继续推进以下优化：

- 增加数据库版本迁移机制
- 继续减少残留 `innerHTML` 与内联样式
- 为 Android 打包增加更完整的自动化脚本
- 整理发布产物目录与资源目录

## 注意事项

- 当前 Android release 签名依赖 `android/keystore.properties`
- 如果项目需要公开分发，建议尽快把签名文件和密码移出仓库
- 发布前建议至少执行一次语法检查和 Android release 构建验证

## 最小检查清单

发布前建议确认：

1. `npm run version:sync -- <版本号>`
2. `npm run check:release`
3. `npx cap sync android`
4. `cd android && ./gradlew assembleRelease`
5. 安装 APK 后验证易策新增、编辑、复盘、备份与导入
