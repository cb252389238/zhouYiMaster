const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
}

function readText(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function extractGradleValue(text, key) {
    const match = text.match(new RegExp(`${key}\\s+"?([^"\\n]+)"?`))
    return match ? match[1] : null
}

function ensure(condition, message) {
    if (!condition) {
        throw new Error(message)
    }
}

function runCheck(command) {
    execSync(command, { cwd: root, stdio: 'inherit' })
}

try {
    const rootVersion = readJson('version.json').version
    const webVersion = readJson('www/version.json').version
    const packageVersion = readJson('package.json').version
    const gradleText = readText('android/app/build.gradle')
    const gradleVersionName = extractGradleValue(gradleText, 'versionName')
    const gradleVersionCode = extractGradleValue(gradleText, 'versionCode')

    ensure(rootVersion === webVersion, `version.json 与 www/version.json 不一致: ${rootVersion} / ${webVersion}`)
    ensure(rootVersion === packageVersion, `package.json version 与 version.json 不一致: ${packageVersion} / ${rootVersion}`)
    ensure(rootVersion === gradleVersionName, `Gradle versionName 与 version.json 不一致: ${gradleVersionName} / ${rootVersion}`)
    ensure(Boolean(gradleVersionCode), '未找到 Gradle versionCode')

    runCheck('node --check "www/app.js"')
    runCheck('node --check "www/ui-common.js"')
    runCheck('node --check "www/gua-common.js"')
    runCheck('node --check "www/text-render.js"')
    runCheck('node --check "www/char-panel.js"')
    runCheck('node --check "www/update.js"')
    runCheck('node --check "www/guaxiang.js"')
    runCheck('node --check "www/practice-memory.js"')
    runCheck('node --check "www/chaxun.js"')
    runCheck('node --check "www/liuyao.js"')
    runCheck('node --check "www/meihua.js"')
    runCheck('node --check "www/huafu.js"')
    runCheck('node --check "www/yice-state.js"')
    runCheck('node --check "www/yice-db.js"')
    runCheck('node --check "www/yice-ui.js"')

    console.log('发布检查通过')
    console.log(`当前版本: ${rootVersion}`)
    console.log(`Android versionCode: ${gradleVersionCode}`)
} catch (error) {
    console.error('发布检查失败: ' + error.message)
    process.exit(1)
}
