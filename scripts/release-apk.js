const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const releaseDir = path.join(root, 'release')
const sourceApk = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')

function run(command, cwd = root) {
    execSync(command, { cwd, stdio: 'inherit' })
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

function copyReleaseApk(version) {
    if (!fs.existsSync(sourceApk)) {
        throw new Error('未找到 release APK 输出文件')
    }

    ensureDir(releaseDir)

    const versionedApk = path.join(releaseDir, `zhouYiMaster-${version}.apk`)
    const latestApk = path.join(releaseDir, 'zhouYiMaster-release.apk')

    fs.copyFileSync(sourceApk, versionedApk)
    fs.copyFileSync(sourceApk, latestApk)

    console.log('已生成发布产物:')
    console.log(`- ${versionedApk}`)
    console.log(`- ${latestApk}`)
}

try {
    const versionJson = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'))
    const version = versionJson.version

    run('npm run check:release')
    run('npx cap sync android')
    run('./gradlew assembleRelease', path.join(root, 'android'))
    copyReleaseApk(version)

    console.log(`APK 发布辅助流程完成，当前版本: ${version}`)
} catch (error) {
    console.error('APK 发布辅助流程失败: ' + error.message)
    process.exit(1)
}
