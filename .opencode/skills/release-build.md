---
name: release-build
description: Build release APK for the project
trigger: "(?i)(打[包]|build|[rR]elease|[A]PK|构[建]|[编]译)"
---

# Release Build (Android APK)

Build the production release APK for the zhouYiMaster app.

## Steps

### 1. Copy web assets to Android

```bash
cd /mnt/d/myProject/zhouYiMaster
npx @capacitor/cli@5 copy android --inline
```

### 2. Set up Java environment

```bash
export JAVA_HOME=/tmp/jdk-21.0.12+8
```

### 3. Build release APK

```bash
cd /mnt/d/myProject/zhouYiMaster/android
./gradlew assembleRelease
```

### 4. Copy APK to release directory

```bash
cp /mnt/d/myProject/zhouYiMaster/android/app/build/outputs/apk/release/app-release.apk \
   /mnt/d/myProject/zhouYiMaster/release/zhouYiMaster-$(node -e "console.log(require('/mnt/d/myProject/zhouYiMaster/www/version.json').version)").apk
```

## Notes

- Version is read from `www/version.json` and `package.json`
- The APK is signed with the debug keystore at `android/debug.keystore`
- JDK 21 is required (available at `/tmp/jdk-21.0.12+8`)
- Capacitor CLI v5 is used (compatible with Node 18)
- Output: `release/zhouYiMaster-{version}.apk`
- If JAVA_HOME is not set, export it in the same shell before running gradlew
