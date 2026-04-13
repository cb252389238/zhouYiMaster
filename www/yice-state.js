// ==================== 易策状态层 ====================
let ycRecords = []
let ycCategories = ['事业', '感情', '财运', '学业', '健康', '其他']
let ycCurrentRecord = null
let ycSelectedUpper = null
let ycSelectedLower = null
let ycSelectedDongyao = []
let ycEditUpper = null
let ycEditLower = null
let ycEditDongyao = []
let ycSearchKeyword = ''

let ycCurrentPage = 1
let ycPageSize = 10
let ycFilteredRecords = []
let ycIsLoadingMore = false

let ycWriteQueue = Promise.resolve()
const ycPendingActions = new Set()

function parseYiceJsonArray(value) {
    if (Array.isArray(value)) return value
    if (!value) return []

    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch (e) {
        console.warn('易策数组字段解析失败:', e)
        return []
    }
}

function normalizeYiceText(value) {
    return typeof value === 'string' ? value.trim() : ''
}

function normalizeYiceDate(value, fallback = null) {
    const date = value ? new Date(value) : null
    if (date && !Number.isNaN(date.getTime())) {
        return date.toISOString()
    }
    return fallback || new Date().toISOString()
}

function normalizeDongyaoList(value) {
    const list = parseYiceJsonArray(value)
        .map(item => Number(item))
        .filter(item => Number.isInteger(item) && item >= 1 && item <= 6)

    return [...new Set(list)].sort((a, b) => a - b)
}

function normalizeYiceReplay(replay) {
    return {
        id: normalizeYiceText(replay?.id) || Date.now().toString(),
        content: normalizeYiceText(replay?.content),
        diff: normalizeYiceText(replay?.diff),
        time: normalizeYiceDate(replay?.time)
    }
}

function normalizeYiceRecord(record) {
    return {
        id: normalizeYiceText(record?.id) || Date.now().toString(),
        category: normalizeYiceText(record?.category),
        content: normalizeYiceText(record?.content),
        person: normalizeYiceText(record?.person),
        upper: normalizeYiceText(record?.upper),
        lower: normalizeYiceText(record?.lower),
        dongyao: normalizeDongyaoList(record?.dongyao),
        analysis: normalizeYiceText(record?.analysis),
        createTime: normalizeYiceDate(record?.createTime),
        updateTime: normalizeYiceDate(record?.updateTime, normalizeYiceDate(record?.createTime)),
        accuracy: Math.max(0, Math.min(100, Number(record?.accuracy) || 70)),
        replays: parseYiceJsonArray(record?.replays)
            .map(normalizeYiceReplay)
            .filter(item => item.content)
    }
}

function getButtonByActionName(actionName) {
    const buttonMap = {
        saveYiceRecord: document.querySelector('#yiceAddModule .option-btn[onclick="saveYiceRecord()"]'),
        updateYiceRecord: document.querySelector('#yiceEditModule .option-btn[onclick="updateYiceRecord()"]'),
        saveReplay: document.querySelector('#ycReplayModal .option-btn[onclick="saveReplay()"]'),
        saveLiuYaoInlineYice: document.querySelector('#lyInlineYice .option-btn[onclick="saveLiuYaoInlineYice()"]'),
        saveMeihuaInlineYice: document.querySelector('#mhInlineYice .option-btn[onclick="saveMeihuaInlineYice()"]'),
        saveHuafuInlineYice: document.querySelector('#hfInlineYice .option-btn[onclick="saveHuafuInlineYice()"]'),
        addCategory: document.querySelector('#yiceCategoryModule .option-btn[onclick="addCategory()"]')
    }

    return buttonMap[actionName] || null
}

function setYiceActionLoading(actionName, isLoading) {
    const button = getButtonByActionName(actionName)
    if (!button) return

    if (isLoading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent
        }
        button.disabled = true
        button.style.opacity = '0.6'
        button.style.pointerEvents = 'none'
        button.textContent = '处理中...'
        return
    }

    button.disabled = false
    button.style.opacity = ''
    button.style.pointerEvents = ''
    if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText
    }
}

async function runYiceAction(actionName, action) {
    if (ycPendingActions.has(actionName)) {
        showAppToast('正在处理中，请勿重复操作')
        return false
    }

    ycPendingActions.add(actionName)
    setYiceActionLoading(actionName, true)

    try {
        await action()
        return true
    } catch (e) {
        console.error('易策操作失败:', e)
        showAppToast('操作失败<br><span style="font-size: 12px; color: #666;">' + e.message + '</span>')
        throw e
    } finally {
        ycPendingActions.delete(actionName)
        setYiceActionLoading(actionName, false)
    }
}

function queueYiceWrite(task) {
    const runner = ycWriteQueue.then(task, task)
    ycWriteQueue = runner.catch(() => {})
    return runner
}
