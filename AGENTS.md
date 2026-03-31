# AGENTS.md - 易师 (I Ching Learning Tool)

## Project Overview
This is a vanilla HTML/JS/CSS single-page application for learning the I Ching (易经). It includes quiz modules for bagua symbols, hexagram names, and yaoci text.

**Tech Stack**: Vanilla HTML, CSS, JavaScript (no frameworks)
**Data Files**: `app.js`, `yizhou-data.js`, `pinyin-data.js`, `index.html`

---

## Commands

### Running the Project
- **Open in Browser**: Simply open `index.html` in a browser, or serve via any static server:
  ```bash
  npx serve .
  # or
  python3 -m http.server 8000
  ```

### Testing in Browser
- Use browser developer tools (F12) to debug JavaScript
- Console.log for debugging - no formal logging framework
- Test across different browsers (Chrome, Firefox, Edge)

### No Build/Lint/Tests
This is a vanilla JS project with no build system, tests, or linting. No commands available.

---

## Code Style Guidelines

### File Organization
- `index.html` - UI structure and inline CSS
- `app.js` - Main application logic (5400+ lines)
- `yizhou-data.js` - Hexagram/bagua data (300+ lines)
- `pinyin-data.js` - Pinyin pronunciation mappings (680+ lines)
- `image/` - Static images (tongqian.jpg, 无字面.png, 有字面.png)

### JavaScript Conventions
- **Naming**: `camelCase` for variables/functions, `PascalCase` for objects/constants
  - Examples: `baguaData`, `pinyinMap`, `currentModule`, `gxCorrectAnswer`
- **Const/Let**: Use `const` for data objects and constants, `let` for mutable state
- **Global State**: Project uses global variables - maintain this pattern
  - Common globals: `currentModule`, `currentGua`, `score`, `questionCount`
  - Module-specific: `gxCorrectAnswer`, `gmSelectedBagua`, `ycCurrentStep`, etc.
- **No Semicolons**: Omit semicolons at line ends (existing style)
- **Chinese Comments**: Comments in Chinese throughout
  - Example: `// 卦象练习模块变量`, `// 初始化函数`

### HTML/CSS Conventions
- Use Chinese `lang="zh-CN"` attribute on `<html>` tag
- CSS reset: `* { margin: 0; padding: 0; box-sizing: border-box }`
- Class naming: lowercase with hyphens (e.g., `.module-card`, `.container`)
- Use flexbox and CSS grid for layouts
- Responsive design: `repeat(auto-fit, minmax(300px, 1fr))`
- Chinese font: `font-family: 'Microsoft YaHei', Arial, sans-serif`

### Data Structure Patterns
- Object-based data stores (e.g., `baguaData`, `pinyinMap`)
- Hexagram data includes: name, symbol, element, attribute, yaoci content
- Follow existing object patterns when adding new data
- Large data files - be careful with edits to preserve structure

### Error Handling
- No formal error handling pattern exists
- For new features, use `try/catch` for operations that may fail
- Display errors via existing alert/UI patterns
- Consider adding graceful fallbacks for missing data

### Code Formatting
- 4-space indentation (or 2-space - match existing files)
- Max line length: ~100 characters for readability
- Keep functions under 50 lines when possible
- Use meaningful variable names in Chinese/English
- Group related functions together

---

## Existing Module Patterns

### Quiz Modules
1. **GuaXiang (卦象练习)**: Symbol recognition quiz
   - Variables: `gxCorrectAnswer`, `gxAnswered`
   - Shows hexagram symbols, user identifies the name

2. **GuaMing (卦名记忆)**: Name matching quiz
   - Variables: `gmSelectedBagua`, `gmAnswered`, `gmClickCount`
   - Multiple choice or matching format

3. **YaoCi (爻辞卦辞)**: Text comprehension quiz
   - Variables: `ycCurrentStep`, `ycAnswered`
   - Steps: 0 = 卦辞, 1-6 = 爻辞

### Reference Modules
4. **LiuShiSiGuaChaXun (六十四卦查询)**: Hexagram lookup
   - Variables: `cxCurrentGua`, `cxChangedYaoci`, `cxRootGua`, `cxActiveCharacter`
   - Supports 变爻 (changing yao) for deriving 变卦

5. **PinYin (拼音学习)**: Pronunciation helper
   - Uses `pinyinMap` for character-to-pinyin lookup

---

## Project Structure
```
/
├── index.html        # Main HTML entry (~990 lines)
├── app.js            # Application logic (~5400 lines)
├── yizhou-data.js    # Hexagram/bagua data (~300 lines)
├── pinyin-data.js    # Pinyin mappings (~680 lines)
├── image/            # Static images
│   ├── tongqian.jpg
│   ├── 无字面.png
│   └── 有字面.png
└── AGENTS.md         # This file
```

---

## Development Guidelines

### Before Making Changes
1. Read existing code in the relevant section first
2. Understand the data structure being modified
3. Test in browser after any change

### Common Pitfalls
- Breaking data file structure (JSON-like objects)
- Introducing syntax errors in large JS file
- Forgetting to update all references when renaming
- Large monolithic functions - consider breaking up

### Accessibility
- Use semantic HTML where possible
- Consider contrast ratios for Chinese text on backgrounds
- Images include Chinese text - ensure readability

### Performance
- App loads all data upfront (no lazy loading)
- Consider debouncing rapid clicks in quiz modules
- Large data files - be mindful of initialization time

---

## Notes for Agents
- This is a simple static site - no npm, no build, no tests
- All code is in Chinese (UI text, comments, variable names in Chinese)
- Make small, incremental changes and test in browser after each change
- Data files are large - be careful with edits to preserve structure
- Verify any changes work correctly before considering complete