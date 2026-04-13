// ==================== 版本更新检测 ====================
const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/cb252389238/zhouYiMaster/main/version.json'
const FALLBACK_APP_VERSION = '1.0.0.3'

function initAppUpdateCheck() {
    if (document.readyState === 'complete') {
        setTimeout(checkForUpdates, 1000)
    } else {
        window.addEventListener('load', () => {
            setTimeout(checkForUpdates, 1000)
        })
    }
}

async function checkForUpdates() {
    try {
        const currentVersion = await getLocalVersion()
        if (!currentVersion) {
            console.log('本地版本文件不存在')
            return
        }

        const remoteVersion = await getRemoteVersion()
        if (!remoteVersion) {
            console.log('无法获取远程版本')
            return
        }

        if (compareVersions(currentVersion, remoteVersion.version)) {
            showUpdateDialog(remoteVersion)
        }
    } catch (error) {
        console.log('检查更新失败:', error.message)
    }
}

async function getLocalVersion() {
    try {
        const response = await fetch('version.json')
        const data = await response.json()
        return data.version || FALLBACK_APP_VERSION
    } catch (e) {
        return FALLBACK_APP_VERSION
    }
}

async function getRemoteVersion() {
    try {
        const response = await fetch(REMOTE_VERSION_URL, { cache: 'no-cache' })
        if (!response.ok) throw new Error('网络请求失败')
        return await response.json()
    } catch (e) {
        console.log('获取远程版本失败:', e.message)
        return null
    }
}

function compareVersions(current, latest) {
    const curParts = current.split('.').map(Number)
    const latParts = latest.split('.').map(Number)
    const maxLen = Math.max(curParts.length, latParts.length)

    for (let i = 0; i < maxLen; i++) {
        const cur = curParts[i] || 0
        const lat = latParts[i] || 0
        if (lat > cur) return true
        if (lat < cur) return false
    }
    return false
}

function createUpdateActionButton(text, styleText, onClick) {
    const button = document.createElement('button')
    button.style.cssText = styleText
    button.textContent = text
    button.onclick = onClick
    return button
}

function showUpdateDialog(remoteVersion) {
    const existing = document.getElementById('updateDialog')
    if (existing) existing.remove()

    const dialog = document.createElement('div')
    dialog.id = 'updateDialog'
    dialog.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;'

    const panel = document.createElement('div')
    panel.style.cssText = 'background: white; border-radius: 16px; padding: 24px; max-width: 320px; width: 85%; text-align: center;'

    const title = document.createElement('h3')
    title.style.cssText = 'margin: 0 0 16px; font-size: 18px; color: #1a1a1a;'
    title.textContent = '发现新版本'

    const info = document.createElement('p')
    info.style.cssText = 'color: #666; margin-bottom: 20px; font-size: 14px;'
    info.textContent = '最新版本：' + remoteVersion.version

    const updateNowBtn = createUpdateActionButton(
        '立即更新',
        'display: block; width: 100%; padding: 14px; background: #007aff; color: white; border: none; border-radius: 10px; font-size: 16px; margin-bottom: 10px; cursor: pointer;',
        () => {
            dialog.remove()
            downloadAndInstall(remoteVersion.url)
        }
    )

    const updateLaterBtn = createUpdateActionButton(
        '稍后',
        'display: block; width: 100%; padding: 14px; background: #f0f0f0; color: #666; border: none; border-radius: 10px; font-size: 16px; cursor: pointer;',
        () => dialog.remove()
    )

    panel.append(title, info, updateNowBtn, updateLaterBtn)
    dialog.appendChild(panel)
    document.body.appendChild(dialog)
}

function downloadAndInstall(url) {
    window.open(url, '_system')
    showDownloadProgress(url)
}

function showDownloadProgress(url) {
    const progressDialog = document.createElement('div')
    progressDialog.id = 'downloadProgress'
    progressDialog.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;'

    const panel = document.createElement('div')
    panel.style.cssText = 'background: white; border-radius: 16px; padding: 24px; max-width: 300px; width: 85%; text-align: center;'

    const title = document.createElement('h3')
    title.style.cssText = 'margin: 0 0 16px; font-size: 16px;'
    title.textContent = '正在下载更新...'

    const progressTrack = document.createElement('div')
    progressTrack.style.cssText = 'background: #e5e5ea; border-radius: 4px; height: 8px; overflow: hidden; margin-bottom: 12px;'

    const progressBar = document.createElement('div')
    progressBar.id = 'progressBar'
    progressBar.style.cssText = 'background: #007aff; height: 100%; width: 0%; transition: width 0.3s;'
    progressTrack.appendChild(progressBar)

    const progressText = document.createElement('p')
    progressText.id = 'progressText'
    progressText.style.cssText = 'color: #666; font-size: 14px;'
    progressText.textContent = '0%'

    panel.append(title, progressTrack, progressText)
    progressDialog.appendChild(panel)
    document.body.appendChild(progressDialog)

    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'

    xhr.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            progressBar.style.width = percent + '%'
            progressText.textContent = percent + '%'
        }
    }

    xhr.onload = function() {
        if (xhr.status === 200) {
            progressText.textContent = '下载完成，正在安装...'

            const blob = xhr.response
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = '易师更新.apk'
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            setTimeout(() => {
                progressDialog.remove()
                showAppToast('下载完成，请在通知栏找到安装包进行安装')
            }, 1500)
        } else {
            progressDialog.remove()
            showAppToast('下载失败，请点击右上角浏览器图标手动下载')
        }
    }

    xhr.onerror = function() {
        progressDialog.remove()
        showAppToast('下载失败，请点击右上角浏览器图标手动下载')
    }

    xhr.send()
}
