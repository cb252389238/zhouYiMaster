const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)

function fail(message) {
    console.error(message)
    process.exit(1)
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n', 'utf8')
}

function parseVersion(version) {
    const parts = version.split('.')
    if (!/^\d+(\.\d+)*$/.test(version) || parts.length < 3) {
        fail('版本号格式无效，应为 x.y.z 或 x.y.z.n')
    }
    return parts.map(Number)
}

function versionToCode(version) {
    const parts = parseVersion(version)
    const normalized = [...parts]
    while (normalized.length < 4) {
        normalized.push(0)
    }
    const [major, minor, patch, build] = normalized
    return major * 1000000 + minor * 10000 + patch * 100 + build
}

const version = args[0]
if (!version) {
    fail('用法: npm run version:sync -- 1.0.0.4')
}

const rootVersionPath = path.join(root, 'version.json')
const webVersionPath = path.join(root, 'www', 'version.json')
const packageJsonPath = path.join(root, 'package.json')
const gradlePath = path.join(root, 'android', 'app', 'build.gradle')

const rootVersion = readJson(rootVersionPath)
const webVersion = readJson(webVersionPath)
const packageJson = readJson(packageJsonPath)

rootVersion.version = version
webVersion.version = version
packageJson.version = version

writeJson(rootVersionPath, rootVersion)
writeJson(webVersionPath, webVersion)
writeJson(packageJsonPath, packageJson)

const versionCode = versionToCode(version)
let gradleText = fs.readFileSync(gradlePath, 'utf8')
gradleText = gradleText.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
gradleText = gradleText.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`)
fs.writeFileSync(gradlePath, gradleText, 'utf8')

console.log(`已同步版本号: ${version}`)
console.log(`Android versionCode: ${versionCode}`)
