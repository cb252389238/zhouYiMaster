// 全局变量
let currentModule = null;
let currentGua = null;
let score = 0;
let questionCount = 0;

function initApp() {
    initCharacterPanel()
    bindCxToolSidebarEvents()
    initHomeModuleSettings()
}

document.addEventListener('DOMContentLoaded', initApp)

// ==================== 首页功能设置 ====================
const HOME_MODULE_SETTINGS_KEY = 'zhouyi-home-module-settings'
let homeSettingsDraggingItem = null
let homeSettingsPointerState = null
let homeSettingsLongPressTimer = null
let homeSettingsPlaceholder = null

function getDefaultHomeModules() {
    return Array.from(document.querySelectorAll('#homeModule .module-card[data-home-module]')).map(card => ({
        id: card.dataset.homeModule,
        label: card.querySelector('h2') ? card.querySelector('h2').textContent.trim() : card.dataset.homeModule,
        visible: true
    }))
}

function loadHomeModuleSettings() {
    const defaultModules = getDefaultHomeModules()
    let savedModules = []

    try {
        savedModules = JSON.parse(localStorage.getItem(HOME_MODULE_SETTINGS_KEY) || '[]')
    } catch (error) {
        savedModules = []
    }

    const defaultMap = new Map(defaultModules.map(item => [item.id, item]))
    const result = []

    savedModules.forEach(item => {
        if (item && defaultMap.has(item.id)) {
            const defaultItem = defaultMap.get(item.id)
            result.push({
                ...defaultItem,
                visible: item.visible !== false
            })
            defaultMap.delete(item.id)
        }
    })

    defaultMap.forEach(item => result.push(item))
    return result.length ? result : defaultModules
}

function applyHomeModuleSettings() {
    const homeModule = document.getElementById('homeModule')
    if (!homeModule) return

    const settings = loadHomeModuleSettings()
    const cards = new Map(Array.from(homeModule.querySelectorAll('.module-card[data-home-module]')).map(card => [card.dataset.homeModule, card]))

    settings.forEach(item => {
        const card = cards.get(item.id)
        if (!card) return
        card.style.display = item.visible ? '' : 'none'
        homeModule.appendChild(card)
    })
}

function initHomeModuleSettings() {
    applyHomeModuleSettings()
}

function openHomeSettings() {
    renderHomeSettingsList(loadHomeModuleSettings())
    document.getElementById('homeSettingsModal').classList.add('active')
}

function closeHomeSettings() {
    document.getElementById('homeSettingsModal').classList.remove('active')
}

function handleHomeSettingsBackdrop(event) {
    if (event.target && event.target.id === 'homeSettingsModal') {
        closeHomeSettings()
    }
}

function renderHomeSettingsList(settings) {
    const list = document.getElementById('homeSettingsList')
    if (!list) return

    list.innerHTML = ''
    settings.forEach(item => {
        const row = document.createElement('div')
        row.className = 'home-settings-item'
        row.dataset.moduleId = item.id
        row.innerHTML = `
            <div class="home-settings-drag" title="拖动排序">☰</div>
            <label class="home-settings-name">
                <input type="checkbox" ${item.visible ? 'checked' : ''}>
                <span>${item.label}</span>
            </label>
        `
        row.addEventListener('pointerdown', handleHomeSettingsPointerDown)
        list.appendChild(row)
    })
}

function handleHomeSettingsPointerDown(event) {
    if (event.target.closest('input')) return
    if (!event.target.closest('.home-settings-drag')) return

    const row = event.currentTarget.closest('.home-settings-item')
    if (!row) return
    const rect = row.getBoundingClientRect()

    homeSettingsPointerState = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startX: event.clientX,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        row
    }
    clearTimeout(homeSettingsLongPressTimer)
    homeSettingsLongPressTimer = setTimeout(() => {
        startHomeSettingsPointerDrag(row)
    }, 260)
    document.addEventListener('pointermove', handleHomeSettingsPointerMove)
    document.addEventListener('pointerup', handleHomeSettingsPointerUp)
    document.addEventListener('pointercancel', handleHomeSettingsPointerUp)
}

function startHomeSettingsPointerDrag(row) {
    if (!homeSettingsPointerState || homeSettingsDraggingItem) return

    const rect = row.getBoundingClientRect()
    const list = row.parentElement

    homeSettingsPlaceholder = document.createElement('div')
    homeSettingsPlaceholder.className = 'home-settings-placeholder'
    homeSettingsPlaceholder.style.height = `${rect.height}px`
    list.insertBefore(homeSettingsPlaceholder, row.nextSibling)

    homeSettingsDraggingItem = row
    row.classList.add('dragging')
    row.style.position = 'fixed'
    row.style.left = `${rect.left}px`
    row.style.top = `${rect.top}px`
    row.style.width = `${rect.width}px`
    row.style.transform = 'scale(1.035)'
}

function handleHomeSettingsPointerMove(event) {
    event.preventDefault()
    if (!homeSettingsPointerState) return

    const movedX = Math.abs(event.clientX - homeSettingsPointerState.startX)
    const movedY = Math.abs(event.clientY - homeSettingsPointerState.startY)
    if (!homeSettingsDraggingItem && (movedX > 8 || movedY > 8)) {
        clearTimeout(homeSettingsLongPressTimer)
        return
    }

    if (!homeSettingsDraggingItem) return

    const list = homeSettingsPlaceholder.parentElement
    homeSettingsDraggingItem.style.top = `${event.clientY - homeSettingsPointerState.offsetY}px`
    homeSettingsDraggingItem.style.left = `${event.clientX - homeSettingsPointerState.offsetX}px`

    const target = getHomeSettingsDragTarget(list, event.clientY)
    if (!target) {
        if (homeSettingsPlaceholder.nextElementSibling) {
            moveHomeSettingsPlaceholder(list, null)
        }
        return
    }

    if (target !== homeSettingsPlaceholder) {
        moveHomeSettingsPlaceholder(list, target)
    }
}

function moveHomeSettingsPlaceholder(list, beforeNode) {
    const items = Array.from(list.querySelectorAll('.home-settings-item'))
    const firstRects = new Map(items.map(item => [item, item.getBoundingClientRect()]))

    list.insertBefore(homeSettingsPlaceholder, beforeNode)

    items.forEach(item => {
        if (item === homeSettingsDraggingItem) return

        const firstRect = firstRects.get(item)
        const lastRect = item.getBoundingClientRect()
        const deltaY = firstRect.top - lastRect.top

        if (!deltaY) return

        item.classList.remove('sort-animating')
        item.style.transform = `translateY(${deltaY}px)`
        item.getBoundingClientRect()
        item.classList.add('sort-animating')
        item.style.transform = ''

        item.addEventListener('transitionend', () => {
            item.classList.remove('sort-animating')
        }, { once: true })
    })
}

function handleHomeSettingsPointerUp(event) {
    clearTimeout(homeSettingsLongPressTimer)
    if (homeSettingsDraggingItem) {
        const list = homeSettingsPlaceholder.parentElement
        homeSettingsDraggingItem.classList.remove('dragging')
        homeSettingsDraggingItem.style.position = ''
        homeSettingsDraggingItem.style.left = ''
        homeSettingsDraggingItem.style.top = ''
        homeSettingsDraggingItem.style.width = ''
        homeSettingsDraggingItem.style.transform = ''
        list.insertBefore(homeSettingsDraggingItem, homeSettingsPlaceholder)
        homeSettingsPlaceholder.remove()
        homeSettingsPlaceholder = null
    }
    document.removeEventListener('pointermove', handleHomeSettingsPointerMove)
    document.removeEventListener('pointerup', handleHomeSettingsPointerUp)
    document.removeEventListener('pointercancel', handleHomeSettingsPointerUp)
    homeSettingsDraggingItem = null
    homeSettingsPointerState = null
}

function getHomeSettingsDragTarget(list, pointerY) {
    const items = Array.from(list.children).filter(item => item !== homeSettingsDraggingItem && item !== homeSettingsPlaceholder)

    return items.find(item => {
        const rect = item.getBoundingClientRect()
        return pointerY < rect.top + rect.height / 2
    })
}

function collectHomeSettingsDraft() {
    const defaultMap = new Map(getDefaultHomeModules().map(item => [item.id, item]))
    return Array.from(document.querySelectorAll('#homeSettingsList .home-settings-item')).map(row => {
        const defaultItem = defaultMap.get(row.dataset.moduleId)
        return {
            id: row.dataset.moduleId,
            label: defaultItem ? defaultItem.label : row.dataset.moduleId,
            visible: row.querySelector('input[type="checkbox"]').checked
        }
    })
}

function saveHomeSettings() {
    const settings = collectHomeSettingsDraft()
    if (!settings.some(item => item.visible)) {
        showAppToast('至少保留一个首页功能')
        return
    }

    localStorage.setItem(HOME_MODULE_SETTINGS_KEY, JSON.stringify(settings.map(item => ({
        id: item.id,
        visible: item.visible
    }))))
    applyHomeModuleSettings()
    closeHomeSettings()
    showAppToast('首页功能设置已保存')
}

function resetHomeSettingsDraft() {
    renderHomeSettingsList(getDefaultHomeModules())
}

// ==================== 应用逻辑 ====================

// 六十四卦查询模块变量
// 易策模块变量
// 易策模块数据库变量已在上方声明，此处不再重复声明
// yiceDB 用于 IndexedDB 数据库实例
// let ycCurrentPage = 1;
// let ycPageSize = 10;
let ycTotalCount = 0;
// let ycRecords = [];
// let ycCategories = [];
let ycEditingId = null;
// let ycCurrentRecord = null;
let ycSelectedGua = { upper: null, lower: null, name: null, changeYao: 0 };
let ycUpperBagua = null;
let ycLowerBagua = null;

function showHome() {
    if (currentModule === 'meihua') {
        stopMeihuaAnimation()
    }
    if (currentModule === 'fengshuiCompass') {
        stopFengshuiCompass()
    }
    hideAllModules();
    document.getElementById('homeModule').style.display = 'grid';
    currentModule = null;
}


// 隐藏所有模块
function hideAllModules() {
    document.getElementById('homeModule').style.display = 'none';
    document.querySelectorAll('.practice-area').forEach(area => {
        area.classList.remove('active');
    });
}

// 显示指定模块
function showModule(moduleName) {
    if (currentModule === 'meihua') {
        stopMeihuaAnimation()
    }
    if (currentModule === 'fengshuiCompass') {
        stopFengshuiCompass()
    }
    hideAllModules();
    currentModule = moduleName;
    
    if (moduleName === 'guaxiang') {
        document.getElementById('guaxiangModule').classList.add('active');
        initGuaXiang();
    } else if (moduleName === 'guaming') {
        document.getElementById('guamingModule').classList.add('active');
        initGuaMing();
    } else if (moduleName === 'yaoci') {
        document.getElementById('yaociModule').classList.add('active');
        initYaoCi();
    } else if (moduleName === 'chaxun') {
        // 获取跳转状态（在initChaXun之前）
        const fromYice = window.fromYiceDetail === true;
        
        document.getElementById('chaxunModule').classList.add('active');
        
        // 始终调用initChaXun重置查询模块
        initChaXun();
        
        // 如果是从易策跳转过来的，需要重新显示详情
        if (fromYice) {
            // 保持当前状态（卦象详情已显示）
            document.getElementById('cxBaguaSelect').style.display = 'none';
            document.getElementById('cxGuaDetail').style.display = 'block';
            // 不重置fromYiceDetail，让showGuaDetail使用
        } else {
            // 正常重置
            window.fromYiceDetail = false;
        }
    } else if (moduleName === 'gualibrary') {
        document.getElementById('gualibraryModule').classList.add('active');
        initGuaLibrary();
    } else if (moduleName === 'liuyao') {
        document.getElementById('liuyaoModule').classList.add('active');
        if (window.fromLiuYaoDetail) {
            window.fromLiuYaoDetail = false;
            if (window.lyCurrentGua && lyYaoci.length === 6) {
                showLiuYaoResult();
            }
        } else {
            initLiuYao();
        }
    } else if (moduleName === 'yice') {
        document.getElementById('yiceModule').classList.add('active');
        initYice();
    } else if (moduleName === 'meihua') {
        document.getElementById('meihuaModule').classList.add('active');
        if (window.fromMeihuaDetail) {
            window.fromMeihuaDetail = false;
            resetMeihuaState();
        } else {
            initMeihua();
        }
    } else if (moduleName === 'huafu') {
        document.getElementById('huafuModule').classList.add('active');
        if (window.fromHuafuDetail) {
            window.fromHuafuDetail = false;
        } else {
            initHuafu();
        }
    } else if (moduleName === 'fengshuiCompass') {
        document.getElementById('fengshuiCompassModule').classList.add('active');
        initFengshuiCompass();
    } else if (moduleName === 'huangdao') {
        document.getElementById('huangdaoModule').classList.add('active');
        initHuangdao();
    }
}

async function saveLiuYaoInlineYice() {
    await runYiceAction('saveLiuYaoInlineYice', async () => {
        if (!window.lyCurrentGua) {
            showAppToast('请先起卦')
            return
        }

        const gua = window.lyCurrentGua
        const record = normalizeYiceRecord({
            id: Date.now().toString(),
            category: document.getElementById('lyYiceCategory').value,
            content: document.getElementById('lyYiceContent').value,
            person: document.getElementById('lyYicePerson').value,
            upper: gua.upper,
            lower: gua.lower,
            dongyao: [...(window._lyInlineDongyao || [])],
            analysis: document.getElementById('lyYiceAnalysis').value,
            createTime: document.getElementById('lyYiceTime').value,
            updateTime: new Date().toISOString(),
            verifyStatus: document.getElementById('lyYiceVerifyStatus').value,
            replays: []
        })

        await queueYiceWrite(async () => {
            await loadYiceData()
            await insertYiceRecordToDB(record)
            ycRecords.unshift(record)
        })

        showAppToast('保存成功')
        cancelLiuYaoInlineYice()
    })
}

function cancelLiuYaoInlineYice() {
    document.getElementById('lyInlineYice').style.display = 'none'
}

// ==================== 六十四卦卦库模块 ====================
function initGuaLibrary() {
    const container = document.getElementById('guaLibraryList')
    container.innerHTML = ''

    liushisiGua.forEach(gua => {
        const row = document.createElement('div')
        row.className = 'gua-library-row'
        row.dataset.keywords = `${gua.number} ${gua.name} ${gua.shortName} ${gua.upper}${gua.lower}`

        const symbolDiv = document.createElement('div')
        symbolDiv.className = 'gua-library-symbol'
        symbolDiv.appendChild(createGuaElement(gua.upper, gua.lower))
        row.appendChild(symbolDiv)

        const nameSpan = document.createElement('span')
        nameSpan.className = 'gua-library-name'
        nameSpan.textContent = `${gua.number}.${gua.name}`
        row.appendChild(nameSpan)

        row.addEventListener('click', () => showGuaFromLibrary(gua))
        container.appendChild(row)
    })

    const searchInput = document.getElementById('guaLibrarySearch')
    if (searchInput) {
        searchInput.oninput = function () {
            const keyword = this.value.trim().toLowerCase()
            document.querySelectorAll('#guaLibraryList .gua-library-row').forEach(row => {
                const match = row.dataset.keywords.toLowerCase().includes(keyword)
                row.style.display = !keyword || match ? '' : 'none'
            })
        }
    }
}

function showGuaFromLibrary(gua) {
    window.fromGuaLibrary = true
    window.fromYiceDetail = true
    window.yiceDongyao = []
    window.yiceMeasureTime = null
    window.yiceRecordId = null
    showModule('chaxun')
    showGuaDetail(gua, true)
}

function backToGuaLibrary() {
    document.getElementById('cxBackToGuaLibraryBtn').style.display = 'none'
    window.fromGuaLibrary = false
    window.fromYiceDetail = false
    showModule('gualibrary')
}


