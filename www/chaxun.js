// ==================== 六十四卦查询模块 ====================
let cxCurrentGua = null
let cxChangedYaoci = []
let cxRootGua = null
let cxActiveCharacter = null
let cxInterpretationModalBound = false
let cxToolSidebarBound = false

function initChaXun() {
    cxCurrentGua = {}
    cxChangedYaoci = []
    bindCxToolSidebarEvents()
    closeCharacterPanel()
    document.getElementById('cxBaguaSelect').style.display = 'block'
    document.getElementById('cxGuaDetail').style.display = 'none'
    document.getElementById('cxResult').innerHTML = ''

    const allButtons = document.querySelectorAll('#cxUpperBagua .bagua-btn, #cxLowerBagua .bagua-btn')
    allButtons.forEach(btn => btn.classList.remove('selected'))

    const backToYiceBtn = document.getElementById('cxBackToYiceBtn')
    const backToPrevBtn = document.getElementById('cxBackToPrevBtn')
    const backToRootBtn = document.getElementById('cxBackToRootBtn')
    const backToHomeBtn = document.getElementById('cxBackToHomeBtn')
    const backToLiuYaoBtn = document.getElementById('cxBackToLiuYaoBtn')
    const backToMeihuaBtn = document.getElementById('cxBackToMeihuaBtn')
    const backToHuafuBtn = document.getElementById('cxBackToHuafuBtn')
    if (backToYiceBtn) backToYiceBtn.style.display = 'none'
    if (backToLiuYaoBtn) backToLiuYaoBtn.style.display = 'none'
    if (backToMeihuaBtn) backToMeihuaBtn.style.display = 'none'
    if (backToHuafuBtn) backToHuafuBtn.style.display = 'none'
    if (backToPrevBtn) backToPrevBtn.style.display = 'inline-block'
    if (backToRootBtn) backToRootBtn.style.display = 'none'
    if (backToHomeBtn) backToHomeBtn.style.display = 'inline-block'

    renderBaguaSelect('cxUpperBagua', 'upper')
    renderBaguaSelect('cxLowerBagua', 'lower')
}

function renderBaguaSelect(containerId, position) {
    const container = document.getElementById(containerId)
    container.innerHTML = ''
    const baguaOrder = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']

    baguaOrder.forEach(key => {
        const btn = document.createElement('div')
        btn.className = 'bagua-btn'
        const yaoYinYang = baguaYaoYinYang[key]
        let svgHtml = '<svg class="bagua-svg" viewBox="0 0 60 60" width="40" height="40">'
        for (let i = 2; i >= 0; i--) {
            const isYang = yaoYinYang[i] === 1
            const y = 10 + (2 - i) * 20
            if (isYang) {
                svgHtml += `<line x1="5" y1="${y}" x2="55" y2="${y}" stroke="#333" stroke-width="4"/>`
            } else {
                svgHtml += `<line x1="5" y1="${y}" x2="22" y2="${y}" stroke="#333" stroke-width="4"/><line x1="38" y1="${y}" x2="55" y2="${y}" stroke="#333" stroke-width="4"/>`
            }
        }
        svgHtml += '</svg>'
        btn.innerHTML = `<div>${svgHtml}</div><div style="font-size:0.7em;margin-top:5px;">${key}</div>`
        btn.onclick = event => selectBaguaForChaXun(key, position, event.currentTarget)
        container.appendChild(btn)
    })
}

function selectBaguaForChaXun(baguaName, position, buttonElement) {
    if (position === 'upper') {
        cxCurrentGua.upper = baguaName
        document.querySelectorAll('#cxUpperBagua .bagua-btn').forEach(btn => btn.classList.remove('selected'))
        buttonElement.classList.add('selected')
    } else {
        cxCurrentGua.lower = baguaName
        document.querySelectorAll('#cxLowerBagua .bagua-btn').forEach(btn => btn.classList.remove('selected'))
        buttonElement.classList.add('selected')
    }

    if (cxCurrentGua.upper && cxCurrentGua.lower) {
        setTimeout(() => {
            findGuaByBagua(cxCurrentGua.upper, cxCurrentGua.lower)
        }, 300)
    }
}

function findGuaByBagua(upper, lower) {
    const gua = liushisiGua.find(g => g.upper === upper && g.lower === lower)
    if (gua) {
        showGuaDetail(gua, true)
    }
}

function setElementHtmlFromString(element, html) {
    element.innerHTML = html
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function buildCxInterpretationButton(label, onClick, extraClass = '') {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `cx-interpret-btn${extraClass ? ` ${extraClass}` : ''}`
    button.textContent = label
    button.onclick = event => {
        event.stopPropagation()
        onClick(event)
    }
    return button
}

function buildCxInterpretationSection(title, bodyHtml, sectionClass = '') {
    return `<section class="cx-interpretation-section${sectionClass ? ` ${sectionClass}` : ''}"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`
}

function buildCxParagraphs(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return `<p>${escapeHtml(cxInterpretationFallbackText)}</p>`
    }

    return items.map(item => `<p>${escapeHtml(item)}</p>`).join('')
}

function buildCxList(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return `<p>${escapeHtml(cxInterpretationFallbackText)}</p>`
    }

    const listItems = items.map(item => `<li>${escapeHtml(item)}</li>`).join('')
    return `<ul class="cx-interpretation-list">${listItems}</ul>`
}

function buildCxDetailItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return `<p>${escapeHtml(cxInterpretationFallbackText)}</p>`
    }

    const detailItems = items.map(item => {
        const term = escapeHtml(item.term || item.word || item.char || item.label || '词条')
        const description = escapeHtml(item.description || item.meaning || item.explanation || cxInterpretationFallbackText)
        return `<div class="cx-interpretation-detail-item"><div class="cx-interpretation-detail-term">${term}</div><div class="cx-interpretation-detail-desc">${description}</div></div>`
    }).join('')

    return `<div class="cx-interpretation-detail-list">${detailItems}</div>`
}

function getCxInterpretationSubtitle(gua, type, yaoNum) {
    if (type === 'guaName') {
        return `第${gua.number}卦 ${gua.name}`
    }

    if (type === 'tuanshi') {
        return `第${gua.number}卦 ${gua.name} · 卦辞`
    }

    if (type === 'yaoci') {
        return `第${gua.number}卦 ${gua.name} · 第${yaoNum}爻`
    }

    return gua.name
}

function getCxInterpretationTitle(gua, type, yaoNum) {
    if (type === 'guaName') {
        return `${gua.shortName}卦卦名解读`
    }

    if (type === 'tuanshi') {
        return `${gua.shortName}卦卦辞解读`
    }

    if (type === 'yaoci') {
        return `${gua.shortName}卦第${yaoNum}爻解读`
    }

    return `${gua.shortName}卦解读`
}

function getCxCleanText(text) {
    return String(text || '').replace(/[：。，“”、；？！,.!\s]/g, '')
}

function getCxUniqueChars(text) {
    const chars = []
    getCxCleanText(text).split('').forEach(char => {
        if (char && !chars.includes(char)) {
            chars.push(char)
        }
    })
    return chars
}

function getCxCharacterInterpretation(char) {
    if (typeof cxCharacterOriginMap !== 'undefined' && cxCharacterOriginMap[char]) {
        const info = cxCharacterOriginMap[char]
        return {
            term: char,
            description: `${info.originalMeaning} ${info.evolution}`
        }
    }

    return {
        term: char,
        description: `该字在当前语境中需要结合整句来理解，后续会补充更细的字源与义项说明。`
    }
}

function buildCxCharacterInterpretationsFromText(text, limit = 6) {
    return getCxUniqueChars(text)
        .slice(0, limit)
        .map(getCxCharacterInterpretation)
}

function createCxAutoEntry(title, originalText, characterInterpretations, traditionalInterpretation, plainMeaning, keyPoints, commonMisunderstandings) {
    return {
        title,
        originalText,
        wordInterpretations: [],
        characterInterpretations,
        traditionalInterpretation,
        plainMeaning,
        keyPoints,
        commonMisunderstandings
    }
}

function buildAutoGuaNameInterpretation(gua) {
    const upperName = baguaData[gua.upper] ? baguaData[gua.upper].name : gua.upper
    const lowerName = baguaData[gua.lower] ? baguaData[gua.lower].name : gua.lower
    const upperElement = baguaElement[gua.upper] || gua.upper
    const lowerElement = baguaElement[gua.lower] || gua.lower
    const isPure = gua.upper === gua.lower
    const pureSummary = isPure
        ? `上下同为${upperName}，卦势纯一，主题格外集中。`
        : `上卦为${upperName}，下卦为${lowerName}，形成“上${upperElement}下${lowerElement}”的复合情境。`

    return createCxAutoEntry(
        getCxInterpretationTitle(gua, 'guaName'),
        gua.name,
        [],
        [
            `${gua.name}之名，先从卦象组合立意。${pureSummary}`,
            `卦名中的“${gua.shortName}”不是单独的标签，而是全卦主旨的集中提示，阅读卦辞与爻辞时都应回到这一主题来把握。`
        ],
        [
            `理解卦名时，可以先看它对应的上下卦，再看它在现实中更像哪一种局面。`,
            `卦名往往就是全卦的总标题：先把主题读对，后面的卦辞和爻辞就更容易顺着理解。`
        ],
        [
            `先看卦名，再看卦辞`,
            `卦名是全卦主题的入口`,
            `${isPure ? '纯卦更重德性本身的展开' : '复卦更重两种力量的互动关系'}`
        ],
        [
            `不要把卦名只当成字面组合，它通常包含整卦的主旨。`,
            `也不要离开上下卦单独理解卦名，否则容易只见字面，不见卦象。`
        ]
    )
}

function buildAutoTuanshiInterpretation(gua) {
    return createCxAutoEntry(
        getCxInterpretationTitle(gua, 'tuanshi'),
        gua.tuanshi,
        buildCxCharacterInterpretationsFromText(gua.tuanshi),
        [
            `卦辞是整卦的总判断，往往用很短的话说明此卦所处的大势、可行之道与吉凶边界。阅读时应结合卦名与卦象，不宜孤立拆句。`,
            `${gua.shortName}卦的卦辞，重点在于先定主旨，再看哪些条件有利、哪些做法需要谨慎；其中判断词与行动词往往是理解重点。`
        ],
        [
            `可以把卦辞看成“这一卦整体在说什么、适合怎么做、什么地方要小心”的总纲。`,
            `如果爻辞像分阶段展开，那卦辞就是总原则。先读懂卦辞，后看六爻会更清楚。`
        ],
        [
            `卦辞先定全局`,
            `判断词常比吉凶字面更重要`,
            `读爻辞时要回看卦辞总纲`
        ],
        [
            `不要把卦辞当成对所有情境都完全一样的结论。`,
            `也不要只盯着“吉”“凶”二字，更要看它为什么吉、为什么凶。`
        ]
    )
}

function buildAutoYaociInterpretation(gua, yaoNum) {
    const yaoci = gua.yaoci[yaoNum - 1] || ''
    const parts = yaoci.split('：')
    const yaoTitle = parts[0] || `第${yaoNum}爻`
    const yaoContent = parts[1] || parts[0] || ''
    const positionText = ['初位，事势刚起', '二位，渐入其位', '三位，进退交界', '四位，近上未上', '五位，居中得尊', '上位，至极当变'][yaoNum - 1]

    return createCxAutoEntry(
        getCxInterpretationTitle(gua, 'yaoci', yaoNum),
        yaoci,
        buildCxCharacterInterpretationsFromText(yaoContent || yaoci),
        [
            `${yaoTitle}所处的是${positionText}的阶段，因此解读这条爻辞，关键要看它在全卦发展中的位置，而不是只看字面吉凶。`,
            `${gua.shortName}卦第${yaoNum}爻更像是在提示：当事情发展到这一层时，应如何把握进退、守持分寸，并避免因失位或失时而生偏差。`
        ],
        [
            `爻辞可以理解成“到了这一阶段，最该注意什么”。`,
            `同一卦六爻不是重复说同一件事，而是在写事情从开始到变化的不同层次。`
        ],
        [
            `先看爻位，再看句意`,
            `爻辞重阶段，不重孤立字面`,
            `理解进退分寸，比直接断吉凶更重要`
        ],
        [
            `不要把单条爻辞直接当成全卦结论。`,
            `也不要忽略它所处的爻位，不同位置说的话，重点完全不同。`
        ]
    )
}

function buildAutoInterpretation(gua, type, yaoNum) {
    if (type === 'guaName') {
        return buildAutoGuaNameInterpretation(gua)
    }

    if (type === 'tuanshi') {
        return buildAutoTuanshiInterpretation(gua)
    }

    return buildAutoYaociInterpretation(gua, yaoNum)
}

function mergeCxInterpretationData(autoData, customData) {
    if (!customData) return autoData

    return {
        ...autoData,
        ...customData,
        wordInterpretations: customData.wordInterpretations || autoData.wordInterpretations,
        characterInterpretations: customData.characterInterpretations || autoData.characterInterpretations,
        traditionalInterpretation: customData.traditionalInterpretation || autoData.traditionalInterpretation,
        plainMeaning: customData.plainMeaning || autoData.plainMeaning,
        keyPoints: customData.keyPoints || autoData.keyPoints,
        commonMisunderstandings: customData.commonMisunderstandings || autoData.commonMisunderstandings
    }
}

function createCxFallbackInterpretation(gua, type, yaoNum) {
    return buildAutoInterpretation(gua, type, yaoNum)
}

function getCxInterpretationData(gua, type, yaoNum = null) {
    const autoData = buildAutoInterpretation(gua, type, yaoNum)
    const guaData = guaInterpretationMap && guaInterpretationMap[gua.name]
    const tuanshiHandwrittenData = typeof guaTuanshiHandwrittenMap !== 'undefined'
        ? guaTuanshiHandwrittenMap[gua.name]
        : null
    const overrideData = typeof guaInterpretationOverrides !== 'undefined'
        ? guaInterpretationOverrides[gua.name]
        : null

    let customEntry = null
    if (type === 'tuanshi' && tuanshiHandwrittenData) {
        customEntry = tuanshiHandwrittenData
    }

    if (overrideData) {
        if (!customEntry && type === 'guaName' && overrideData.guaName) {
            customEntry = overrideData.guaName
        } else if (!customEntry && type === 'tuanshi' && overrideData.tuanshi) {
            customEntry = overrideData.tuanshi
        } else if (!customEntry && type === 'yaoci' && overrideData.yaoci && overrideData.yaoci[yaoNum]) {
            customEntry = overrideData.yaoci[yaoNum]
        }
    }

    if (customEntry) {
        return mergeCxInterpretationData(autoData, customEntry)
    }

    if (!guaData) {
        return autoData
    }

    if (type === 'guaName' && guaData.guaName) {
        return mergeCxInterpretationData(autoData, guaData.guaName)
    }

    if (type === 'tuanshi' && guaData.tuanshi) {
        return mergeCxInterpretationData(autoData, guaData.tuanshi)
    }

    if (type === 'yaoci' && guaData.yaoci && guaData.yaoci[yaoNum]) {
        return mergeCxInterpretationData(autoData, guaData.yaoci[yaoNum])
    }

    return autoData
}

function renderCxInterpretationContent(data, type) {
    const sections = [
        buildCxInterpretationSection('原文', `<p>${escapeHtml(data.originalText)}</p>`, 'cx-interpretation-original')
    ]

    if (type !== 'guaName') {
        const detailItems = Array.isArray(data.wordInterpretations) && data.wordInterpretations.length > 0
            ? data.wordInterpretations
            : data.characterInterpretations
        const detailTitle = Array.isArray(data.wordInterpretations) && data.wordInterpretations.length > 0
            ? '逐词解读'
            : '逐字解读'

        sections.push(buildCxInterpretationSection(detailTitle, buildCxDetailItems(detailItems)))
    }

    sections.push(
        buildCxInterpretationSection('传统解读', buildCxParagraphs(data.traditionalInterpretation)),
        buildCxInterpretationSection('白话提示', buildCxParagraphs(data.plainMeaning), 'cx-interpretation-plain'),
        buildCxInterpretationSection('学习要点', buildCxList(data.keyPoints)),
        buildCxInterpretationSection('常见误解', buildCxList(data.commonMisunderstandings), 'cx-interpretation-misunderstanding')
    )

    return sections.join('')
}

function openCxInterpretationModal(gua, type, yaoNum = null) {
    const modal = document.getElementById('cxInterpretationModal')
    const titleEl = document.getElementById('cxInterpretationTitle')
    const subtitleEl = document.getElementById('cxInterpretationSubtitle')
    const contentEl = document.getElementById('cxInterpretationContent')
    const data = getCxInterpretationData(gua, type, yaoNum)

    titleEl.textContent = data.title || getCxInterpretationTitle(gua, type, yaoNum)
    subtitleEl.textContent = getCxInterpretationSubtitle(gua, type, yaoNum)
    contentEl.innerHTML = renderCxInterpretationContent(data, type)
    contentEl.scrollTop = 0
    modal.style.display = 'flex'
    modal.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    titleEl.focus({ preventScroll: true })
    requestAnimationFrame(() => {
        contentEl.scrollTop = 0
        contentEl.scrollTo({ top: 0, behavior: 'auto' })
    })
}

function closeCxInterpretationModal() {
    const modal = document.getElementById('cxInterpretationModal')
    if (!modal) return

    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
}

function bindCxInterpretationModalEvents() {
    if (cxInterpretationModalBound) return

    const modal = document.getElementById('cxInterpretationModal')
    const closeBtn = document.getElementById('cxInterpretationClose')
    if (!modal || !closeBtn) return

    closeBtn.addEventListener('click', closeCxInterpretationModal)
    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeCxInterpretationModal()
        }
    })
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeCxInterpretationModal()
        }
    })

    cxInterpretationModalBound = true
}

function toggleCxToolSidebar() {
    setTimeout(openCxToolHome, 0)
}

function closeCxToolSidebar() {
}

function closeCxToolModal() {
    const modal = document.getElementById('cxToolModal')
    if (!modal) return

    closeCxToolGuaModal()
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
    modal.classList.remove('from-sidebar')
    document.body.style.overflow = ''
    closeCxToolSidebar()
}

function closeCxToolGuaModal() {
    const modal = document.getElementById('cxToolGuaModal')
    if (!modal) return

    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
}

function bindCxToolSidebarEvents() {
    if (cxToolSidebarBound) return

    const sidebar = document.getElementById('cxToolSidebar')
    const tab = document.getElementById('cxToolSidebarTab')
    if (!sidebar || !tab) return

    let longPressTimer = null
    let pointerDown = false
    let dragging = false
    let downX = 0
    let downY = 0
    let startLeft = 0
    let startTop = 0
    let lastX = 0
    let lastY = 0
    let suppressNextClick = false

    const clearLongPressTimer = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer)
            longPressTimer = null
        }
    }

    const undockSidebar = () => {
        const rect = sidebar.getBoundingClientRect()
        sidebar.classList.remove('cx-tool-dock-left', 'cx-tool-dock-right', 'cx-tool-dock-top', 'cx-tool-dock-bottom')
        sidebar.style.width = ''
        sidebar.style.height = ''
        sidebar.style.left = `${rect.left}px`
        sidebar.style.top = `${rect.top}px`
        sidebar.style.bottom = 'auto'
    }

    const dockSidebar = () => {
        const threshold = 42
        const dockShortSize = 24
        const dockLongSize = 54
        const left = sidebar.offsetLeft
        const top = sidebar.offsetTop
        const right = window.innerWidth - left - sidebar.offsetWidth
        const bottom = window.innerHeight - top - sidebar.offsetHeight
        const minDistance = Math.min(left, right, top, bottom)

        sidebar.classList.remove('cx-tool-dock-left', 'cx-tool-dock-right', 'cx-tool-dock-top', 'cx-tool-dock-bottom')
        if (minDistance > threshold) return

        if (minDistance === left) {
            sidebar.classList.add('cx-tool-dock-left')
            sidebar.style.left = '0px'
            sidebar.style.top = `${Math.min(Math.max(top, 0), Math.max(0, window.innerHeight - dockLongSize))}px`
        } else if (minDistance === right) {
            sidebar.classList.add('cx-tool-dock-right')
            sidebar.style.left = `${window.innerWidth - dockShortSize}px`
            sidebar.style.top = `${Math.min(Math.max(top, 0), Math.max(0, window.innerHeight - dockLongSize))}px`
        } else if (minDistance === top) {
            sidebar.classList.add('cx-tool-dock-top')
            sidebar.style.top = '0px'
            sidebar.style.left = `${Math.min(Math.max(left, 0), Math.max(0, window.innerWidth - dockLongSize))}px`
        } else {
            sidebar.classList.add('cx-tool-dock-bottom')
            sidebar.style.top = `${window.innerHeight - dockShortSize}px`
            sidebar.style.left = `${Math.min(Math.max(left, 0), Math.max(0, window.innerWidth - dockLongSize))}px`
        }
    }

    const startDrag = () => {
        if (!pointerDown) return

        dragging = true
        downX = lastX
        downY = lastY
        undockSidebar()
        startLeft = sidebar.offsetLeft
        startTop = sidebar.offsetTop
        sidebar.classList.add('dragging')
        sidebar.style.left = `${startLeft}px`
        sidebar.style.top = `${startTop}px`
        sidebar.style.bottom = 'auto'
    }

    const moveSidebar = (clientX, clientY) => {
        if (!dragging) return

        const dx = clientX - downX
        const dy = clientY - downY
        const maxLeft = Math.max(0, window.innerWidth - sidebar.offsetWidth)
        const maxTop = Math.max(0, window.innerHeight - sidebar.offsetHeight)
        const nextLeft = Math.min(Math.max(startLeft + dx, 0), maxLeft)
        const nextTop = Math.min(Math.max(startTop + dy, 0), maxTop)

        sidebar.style.left = `${nextLeft}px`
        sidebar.style.top = `${nextTop}px`
    }

    const stopDrag = () => {
        clearLongPressTimer()
        pointerDown = false
        if (dragging) {
            dragging = false
            sidebar.classList.remove('dragging')
            dockSidebar()
        }
    }

    tab.addEventListener('pointerdown', event => {
        pointerDown = true
        dragging = false
        downX = event.clientX
        downY = event.clientY
        lastX = event.clientX
        lastY = event.clientY
        clearLongPressTimer()
        longPressTimer = setTimeout(startDrag, 450)
    })

    window.addEventListener('pointermove', event => {
        if (!pointerDown) return
        lastX = event.clientX
        lastY = event.clientY
        if (dragging) {
            event.preventDefault()
        }
        moveSidebar(event.clientX, event.clientY)
    }, { passive: false })

    window.addEventListener('pointerup', event => {
        if (!pointerDown) return

        const wasDragging = dragging
        clearLongPressTimer()
        if (!wasDragging) {
            pointerDown = false
            return
        }
        suppressNextClick = true
        stopDrag()
        setTimeout(() => {
            suppressNextClick = false
        }, 250)
    })

    window.addEventListener('pointercancel', stopDrag)
    tab.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        if (suppressNextClick) return

        toggleCxToolSidebar()
    })
    tab.addEventListener('contextmenu', event => event.preventDefault())

    const toolModal = document.getElementById('cxToolModal')
    const guaModal = document.getElementById('cxToolGuaModal')
    if (toolModal) {
        toolModal.addEventListener('click', event => {
            if (event.target === toolModal) {
                closeCxToolModal()
            }
        })
    }
    if (guaModal) {
        guaModal.addEventListener('click', event => {
            if (event.target === guaModal) {
                closeCxToolGuaModal()
            }
        })
    }

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return

        if (guaModal && guaModal.style.display === 'flex') {
            closeCxToolGuaModal()
            return
        }
        if (toolModal && toolModal.style.display === 'flex') {
            closeCxToolModal()
        }
    })

    cxToolSidebarBound = true
}

function openCxToolModal(toolName) {
    const modal = document.getElementById('cxToolModal')
    const titleEl = document.getElementById('cxToolModalTitle')
    const subtitleEl = document.getElementById('cxToolModalSubtitle')
    const contentEl = document.getElementById('cxToolModalContent')
    const backBtn = document.getElementById('cxToolModalBack')
    if (!modal || !titleEl || !subtitleEl || !contentEl || !backBtn) return

    const sidebar = document.getElementById('cxToolSidebar')
    if (sidebar) {
        const rect = sidebar.getBoundingClientRect()
        modal.style.setProperty('--cx-tool-origin-x', `${rect.left + rect.width / 2}px`)
        modal.style.setProperty('--cx-tool-origin-y', `${rect.top + rect.height / 2}px`)
    }

    modal.classList.add('from-sidebar')
    modal.style.display = 'flex'
    modal.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'

    if (toolName === 'home') {
        renderCxToolHome(contentEl)
    } else if (toolName === 'bagong') {
        renderCxBagongTool(contentEl)
    } else if (cxRelationToolData[toolName]) {
        renderCxRelationTool(contentEl, cxRelationToolData[toolName])
    }
}

function openCxToolHome() {
    openCxToolModal('home')
}

function backCxToolModal() {
    closeCxToolGuaModal()
    openCxToolModal('home')
}

function setCxToolModalHeader(title, subtitle, showBack) {
    const titleEl = document.getElementById('cxToolModalTitle')
    const subtitleEl = document.getElementById('cxToolModalSubtitle')
    const backBtn = document.getElementById('cxToolModalBack')
    if (titleEl) titleEl.textContent = title
    if (subtitleEl) subtitleEl.textContent = subtitle
    if (backBtn) backBtn.style.display = showBack ? 'inline-flex' : 'none'
}

function renderCxToolHome(container) {
    setCxToolModalHeader('辅助工具', '选择常用小工具，逐层进入具体功能。', false)
    container.innerHTML = `
        <div class="cx-tool-home-grid">
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('bagong')">
                <strong>八宫</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('dizhiLiuchong')">
                <strong>地支六冲</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('dizhiHuiju')">
                <strong>地支会局</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('dizhiLiuhai')">
                <strong>地支六害</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('dizhiLiuhe')">
                <strong>地支六合</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('dizhiSanhe')">
                <strong>地支三合</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('dizhiSixing')">
                <strong>地支四刑</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('tianganXiangchong')">
                <strong>天干相冲</strong>
            </button>
            <button type="button" class="cx-tool-home-card" onclick="openCxToolModal('tianganXianghe')">
                <strong>天干相合</strong>
            </button>
        </div>
    `
}

const cxRelationToolData = {
    dizhiLiuchong: {
        title: '地支六冲', subtitle: '六冲是十二地支两两相对冲动的关系。', joiner: '冲',
        groups: [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']], type: 'zhi'
    },
    dizhiHuiju: {
        title: '地支会局', subtitle: '三会局按方位之气聚合。', joiner: '会',
        groups: [['寅', '卯', '辰', '东方木'], ['巳', '午', '未', '南方火'], ['申', '酉', '戌', '西方金'], ['亥', '子', '丑', '北方水']], type: 'zhi'
    },
    dizhiLiuhai: {
        title: '地支六害', subtitle: '六害又称六穿，表示相害牵制。', joiner: '害',
        groups: [['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']], type: 'zhi'
    },
    dizhiLiuhe: {
        title: '地支六合', subtitle: '六合是地支两两相合的关系。', joiner: '合',
        groups: [['子', '丑', '土'], ['寅', '亥', '木'], ['卯', '戌', '火'], ['辰', '酉', '金'], ['巳', '申', '水'], ['午', '未', '土']], type: 'zhi'
    },
    dizhiSanhe: {
        title: '地支三合', subtitle: '三合局由长生、帝旺、墓库三支成局。', joiner: '合',
        groups: [['申', '子', '辰', '水局'], ['亥', '卯', '未', '木局'], ['寅', '午', '戌', '火局'], ['巳', '酉', '丑', '金局']], type: 'zhi'
    },
    dizhiSixing: {
        title: '地支四刑', subtitle: '四刑用于查看地支之间的刑伤关系。', joiner: '刑',
        groups: [['寅', '巳', '申', '无恩之刑'], ['丑', '未', '戌', '恃势之刑'], ['子', '卯', '无礼之刑'], ['辰', '午', '酉', '亥', '自刑']], type: 'zhi'
    },
    tianganXiangchong: {
        title: '天干相冲', subtitle: '天干相冲表示五行和方位气机相对。', joiner: '冲',
        groups: [['甲', '庚'], ['乙', '辛'], ['丙', '壬'], ['丁', '癸']], type: 'gan'
    },
    tianganXianghe: {
        title: '天干相合', subtitle: '天干五合表示两干相合及其化气。', joiner: '合',
        groups: [['甲', '己', '土'], ['乙', '庚', '金'], ['丙', '辛', '水'], ['丁', '壬', '木'], ['戊', '癸', '火']], type: 'gan'
    }
}

function renderCxRelationTool(container, data) {
    setCxToolModalHeader(data.title, data.subtitle, true)
    container.innerHTML = `
        <div class="cx-relation-tool-grid">
            ${data.groups.map(group => `
                <div class="cx-relation-tool-card">
                    <div class="cx-relation-tool-pair">
                        ${getCxRelationItems(group, data).map((item, index, arr) => `
                            <span>${item}</span>${index < arr.length - 1 ? `<strong>${data.joiner}</strong>` : ''}
                        `).join('')}
                    </div>
                    <div class="cx-relation-tool-meta">${buildCxRelationMeta(group, data)}</div>
                </div>
            `).join('')}
        </div>
    `
}

function getCxRelationItems(group, data) {
    const wuxingMap = data.type === 'gan' ? ganWuxing : zhiWuxing
    return group.filter(item => wuxingMap[item])
}

function buildCxRelationMeta(group, data) {
    const label = group.find(item => item.includes('局') || item.includes('刑') || naJiaWuxing.includes(item))
    const wuxingMap = data.type === 'gan' ? ganWuxing : zhiWuxing
    const itemText = group.filter(item => wuxingMap[item]).map(item => `${item}属${wuxingMap[item]}`).join('，')
    return label ? `${itemText}；${label}` : itemText
}

function getCxBagongGroups() {
    const groups = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'].map(gong => ({ gong, items: [] }))
    const groupMap = Object.fromEntries(groups.map(group => [group.gong, group]))

    liushisiGua.forEach(gua => {
        const gongInfo = getGuaGongInfo(gua)
        if (groupMap[gongInfo.gong]) {
            groupMap[gongInfo.gong].items.push({ gua, stage: gongInfo.stage })
        }
    })

    return groups
}

function renderCxBagongTool(container) {
    setCxToolModalHeader('八宫', '按本宫、一世、二世、三世、四世、五世、游魂、归魂查看六十四卦。', true)
    container.innerHTML = ''

    const stageOrder = ['本宫', '一世', '二世', '三世', '四世', '五世', '游魂', '归魂']
    const table = document.createElement('table')
    table.className = 'cx-bagong-table'

    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    headerRow.innerHTML = '<th>八宫</th>' + stageOrder.map(stage => `<th>${stage}</th>`).join('')
    thead.appendChild(headerRow)

    const tbody = document.createElement('tbody')
    getCxBagongGroups().forEach(group => {
        const row = document.createElement('tr')
        const gongCell = document.createElement('th')
        gongCell.textContent = `${group.gong}宫`
        row.appendChild(gongCell)

        stageOrder.forEach(stage => {
            const cell = document.createElement('td')
            const item = group.items.find(groupItem => groupItem.stage === stage)
            if (item) {
                const { gua } = item
            const button = document.createElement('button')
            button.type = 'button'
                button.className = 'cx-bagong-table-btn'
                button.textContent = gua.shortName
                button.onclick = () => openCxToolGuaModal(gua, stage)
                cell.appendChild(button)
            }
            row.appendChild(cell)
        })

        tbody.appendChild(row)
    })

    table.append(thead, tbody)
    container.appendChild(table)
}

function openCxToolGuaModal(gua, stage) {
    const modal = document.getElementById('cxToolGuaModal')
    const titleEl = document.getElementById('cxToolGuaTitle')
    const subtitleEl = document.getElementById('cxToolGuaSubtitle')
    const contentEl = document.getElementById('cxToolGuaContent')
    if (!modal || !titleEl || !subtitleEl || !contentEl) return

    titleEl.textContent = `第${gua.number}卦 ${gua.name}`
    subtitleEl.textContent = `${getGuaGongInfo(gua).gong}宫 · ${stage}`
    contentEl.innerHTML = ''
    contentEl.appendChild(createCxNajiaGuaElement(gua, []))
    modal.style.display = 'flex'
    modal.setAttribute('aria-hidden', 'false')
}

function renderCxGuaName(guaNameDisplay, gua) {
    const container = document.getElementById('cxGuaName')
    container.innerHTML = ''

    const row = document.createElement('div')
    row.className = 'cx-gua-name-row'

    const text = document.createElement('div')
    text.innerHTML = formatClickableText(guaNameDisplay, { source: '卦名', large: true })

    const button = buildCxInterpretationButton('解读', () => openCxInterpretationModal(gua, 'guaName'), 'cx-gua-name-interpret-btn')

    row.append(text, button)
    container.appendChild(row)
}

function buildYaociItem(yaoci, yaoNum) {
    const yaoItem = document.createElement('div')
    yaoItem.className = 'yaoci-item'
    yaoItem.dataset.yaoNum = yaoNum
    yaoItem.onclick = event => {
        if (event.target.closest('.cx-char-btn')) {
            return
        }
        toggleYaociChange(yaoNum)
    }

    const parts = yaoci.split('：')
    const yaociTitle = parts[0] || ''
    const yaociContent = parts[1] || parts[0] || ''

    const titleDiv = document.createElement('div')
    titleDiv.className = 'yaoci-title'

    const titleRow = document.createElement('div')
    titleRow.className = 'cx-yaoci-header'

    const titleText = document.createElement('div')
    titleText.className = 'cx-yaoci-header-main'
    setElementHtmlFromString(titleText, `第${yaoNum}爻：${formatClickableText(yaociTitle, { source: `第${yaoNum}爻标题` })}`)

    const interpretationBtn = buildCxInterpretationButton('解读', () => openCxInterpretationModal(cxCurrentGua, 'yaoci', yaoNum), 'cx-corner-interpret-btn')

    titleRow.append(titleText, interpretationBtn)
    titleDiv.appendChild(titleRow)

    const contentDiv = document.createElement('div')
    contentDiv.className = 'yaoci-content'
    setElementHtmlFromString(contentDiv, formatClickableText(yaociContent, { source: `第${yaoNum}爻爻辞` }))

    yaoItem.append(titleDiv, contentDiv)
    return yaoItem
}

function bindCxSymbolYaoClick() {
    const cxSymbolEl = document.getElementById('cxSymbol')
    if (!cxSymbolEl || cxSymbolEl.dataset.yaoClickBound === 'true') return

    cxSymbolEl.addEventListener('click', event => {
        const yaoLine = event.target.closest('.yao-line[data-yao-num]')
        if (!yaoLine || !cxSymbolEl.contains(yaoLine)) return


        toggleYaociChange(Number(yaoLine.dataset.yaoNum))
    })
    cxSymbolEl.dataset.yaoClickBound = 'true'
}

function getCxRelatedGuaItems(gua) {
    const items = []

    if (cxChangedYaoci.length > 0) {
        const bianGua = getBianGua(gua, cxChangedYaoci)
        if (bianGua && bianGua.number !== gua.number) {
            items.push({ type: 'bian', label: '变', title: `变卦：${bianGua.shortName}卦`, gua: bianGua })
        }
    }

    const relatedConfigs = [
        { type: 'hugua', label: '互', title: '互卦', getter: getHuGua },
        { type: 'zonggua', label: '综', title: '综卦', getter: getZongGua },
        { type: 'cuogua', label: '错', title: '错卦', getter: getCuoGua }
    ]

    relatedConfigs.forEach(config => {
        const relatedGua = config.getter(gua)
        if (relatedGua && relatedGua.number !== gua.number) {
            items.push({
                type: config.type,
                label: config.label,
                title: `${config.title}：${relatedGua.shortName}卦`,
                gua: relatedGua
            })
        }
    })

    return items
}

function closeCxRelatedPanel() {
    const foldEl = document.getElementById('cxRelatedFold')
    const panelEl = document.getElementById('cxRelatedPanel')
    if (foldEl) {
        foldEl.querySelectorAll('.cx-related-fold-btn').forEach(btn => btn.classList.remove('active'))
    }
    if (panelEl) {
        panelEl.classList.remove('open')
        panelEl.dataset.activeType = ''
        panelEl.innerHTML = ''
    }
}

function openCxRelatedPanel(item) {
    const foldEl = document.getElementById('cxRelatedFold')
    const panelEl = document.getElementById('cxRelatedPanel')
    if (!foldEl || !panelEl) return

    foldEl.querySelectorAll('.cx-related-fold-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === item.type)
    })

    panelEl.innerHTML = ''
    const titleEl = document.createElement('div')
    titleEl.className = 'cx-related-panel-title'
    titleEl.textContent = item.title

    const symbolEl = document.createElement('div')
    symbolEl.className = 'cx-related-panel-symbol'
    symbolEl.appendChild(createCxNajiaGuaElement(item.gua, []))

    panelEl.append(titleEl, symbolEl)
    panelEl.dataset.activeType = item.type
    panelEl.classList.add('open')
}

function toggleCxRelatedPanel(item) {
    const panelEl = document.getElementById('cxRelatedPanel')
    if (panelEl && panelEl.classList.contains('open') && panelEl.dataset.activeType === item.type) {
        closeCxRelatedPanel()
        return
    }

    openCxRelatedPanel(item)
}

function renderCxRelatedFold(gua) {
    const foldEl = document.getElementById('cxRelatedFold')
    const panelEl = document.getElementById('cxRelatedPanel')
    if (!foldEl || !panelEl) return

    const items = getCxRelatedGuaItems(gua)
    foldEl.innerHTML = ''
    closeCxRelatedPanel()

    if (items.length === 0) {
        foldEl.style.display = 'none'
        return
    }

    foldEl.style.display = 'flex'
    items.forEach(item => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'cx-related-fold-btn'
        button.dataset.type = item.type
        button.textContent = item.label
        button.title = item.title
        button.onclick = () => {
            button.blur()
            toggleCxRelatedPanel(item)
        }
        foldEl.appendChild(button)
    })
}

function updateCxChangeGuaButton() {
    const changeGuaBtn = document.getElementById('cxChangeGuaBtn')
    if (changeGuaBtn) {
        if (cxChangedYaoci.length > 0) {
            const bianGua = getBianGua(cxCurrentGua, cxChangedYaoci)
            if (bianGua) {
                changeGuaBtn.textContent = `变:${bianGua.shortName}`
                changeGuaBtn.style.display = 'inline-block'
                updateChangeGuaButtonState(changeGuaBtn, cxCurrentGua, bianGua)
            }
        } else {
            changeGuaBtn.style.display = 'none'
            changeGuaBtn.disabled = false
            changeGuaBtn.classList.remove('disabled')
            changeGuaBtn.title = ''
        }
    }

    renderCxRelatedFold(cxCurrentGua)
}

function updateCxYaociChangeState(yaoNum, isChanged) {
    const yaoItem = document.querySelector(`.yaoci-item[data-yao-num="${yaoNum}"]`)
    if (yaoItem) {
        yaoItem.classList.toggle('changed', isChanged)
    }
}

function showGuaDetail(gua, isRootGua = false) {
    cxCurrentGua = gua
    bindCxInterpretationModalEvents()

    const fromYice = window.fromYiceDetail
    const fromLiuYao = window.fromLiuYaoDetail
    const fromMeihua = window.fromMeihuaDetail
    const fromHuafu = window.fromHuafuDetail
    const yiceDongyao = window.yiceDongyao ? [...window.yiceDongyao] : []

    if (!isRootGua) {
        cxChangedYaoci = []
    }
    closeCharacterPanel()
    initCharacterPanel()

    if (isRootGua) {
        cxRootGua = gua
    }

    if (fromYice && isRootGua && yiceDongyao.length > 0) {
        cxChangedYaoci = yiceDongyao
    }

    if (fromYice && isRootGua && typeof setCxNajiaSelectedDate === 'function') {
        setCxNajiaSelectedDate(new Date(window.yiceMeasureTime))
    }

    const backToYiceBtn = document.getElementById('cxBackToYiceBtn')
    const backToPrevBtn = document.getElementById('cxBackToPrevBtn')
    const backToRootBtn = document.getElementById('cxBackToRootBtn')
    const backToHomeBtn = document.getElementById('cxBackToHomeBtn')
    const backToLiuYaoBtn = document.getElementById('cxBackToLiuYaoBtn')
    const backToMeihuaBtn = document.getElementById('cxBackToMeihuaBtn')
    const backToHuafuBtn = document.getElementById('cxBackToHuafuBtn')

    if (backToLiuYaoBtn) backToLiuYaoBtn.style.display = 'none'
    if (backToMeihuaBtn) backToMeihuaBtn.style.display = 'none'
    if (backToHuafuBtn) backToHuafuBtn.style.display = 'none'

    if (fromYice && isRootGua) {
        if (backToYiceBtn) backToYiceBtn.style.display = 'inline-block'
        if (backToPrevBtn) backToPrevBtn.style.display = 'none'
        if (backToRootBtn) backToRootBtn.style.display = 'none'
        if (backToHomeBtn) backToHomeBtn.style.display = 'none'
    } else if (fromLiuYao && isRootGua) {
        if (backToYiceBtn) backToYiceBtn.style.display = 'none'
        if (backToLiuYaoBtn) backToLiuYaoBtn.style.display = 'inline-block'
        if (backToPrevBtn) backToPrevBtn.style.display = 'none'
        if (backToRootBtn) backToRootBtn.style.display = 'none'
        if (backToHomeBtn) backToHomeBtn.style.display = 'none'
    } else if (fromMeihua && isRootGua) {
        if (backToYiceBtn) backToYiceBtn.style.display = 'none'
        if (backToMeihuaBtn) backToMeihuaBtn.style.display = 'inline-block'
        if (backToPrevBtn) backToPrevBtn.style.display = 'none'
        if (backToRootBtn) backToRootBtn.style.display = 'none'
        if (backToHomeBtn) backToHomeBtn.style.display = 'none'
    } else if (fromHuafu && isRootGua) {
        if (backToYiceBtn) backToYiceBtn.style.display = 'none'
        if (backToHuafuBtn) backToHuafuBtn.style.display = 'inline-block'
        if (backToPrevBtn) backToPrevBtn.style.display = 'none'
        if (backToRootBtn) backToRootBtn.style.display = 'none'
        if (backToHomeBtn) backToHomeBtn.style.display = 'none'
    } else {
        if (backToYiceBtn) backToYiceBtn.style.display = 'none'
        if (backToPrevBtn) backToPrevBtn.style.display = 'inline-block'
        if (backToHomeBtn) backToHomeBtn.style.display = 'inline-block'
        if (backToRootBtn) {
            backToRootBtn.style.display = (cxRootGua && cxRootGua.number !== gua.number) ? 'inline-block' : 'none'
        }
    }

    document.getElementById('cxBaguaSelect').style.display = 'none'
    document.getElementById('cxGuaDetail').style.display = 'block'

    bindCxSymbolYaoClick()
    renderCxNajiaGuaSymbol(gua)
    renderCxNajiaInfo(gua)

    const upperElement = baguaElement[gua.upper]
    const lowerElement = baguaElement[gua.lower]
    const guaNameDisplay = gua.upper === gua.lower
        ? `${gua.upper}为${baguaElement[gua.upper]}卦`
        : `${upperElement}${lowerElement}${gua.shortName}卦`

    renderCxGuaName(guaNameDisplay, gua)
    setElementHtmlFromString(document.getElementById('cxTuanshi'), formatClickableText(gua.tuanshi, { source: '卦辞' }))

    const tuanshiBtn = document.getElementById('cxTuanshiInterpretBtn')
    if (tuanshiBtn) {
        tuanshiBtn.onclick = event => {
            event.stopPropagation()
            openCxInterpretationModal(gua, 'tuanshi')
        }
    }

    renderYaociList(gua)
    updateGuaButtons(gua)

    const relatedGuaActions = document.querySelector('.related-gua-actions')
    if (relatedGuaActions) {
        relatedGuaActions.style.display = isRootGua ? 'flex' : 'none'
    }

    if (isRootGua) {
        updateCxChangeGuaButton()
    } else {
        const changeGuaBtn = document.getElementById('cxChangeGuaBtn')
        if (changeGuaBtn) {
            changeGuaBtn.style.display = 'none'
            changeGuaBtn.disabled = false
            changeGuaBtn.classList.remove('disabled')
            changeGuaBtn.title = ''
        }
        renderCxRelatedFold(gua)
    }
}

function renderYaociList(gua) {
    const container = document.getElementById('cxYaociList')
    container.innerHTML = ''

    gua.yaoci.forEach((yaoci, index) => {
        container.appendChild(buildYaociItem(yaoci, index + 1))
    })

    cxChangedYaoci.forEach(yaoNum => {
        const yaoItem = document.querySelector(`.yaoci-item[data-yao-num="${yaoNum}"]`)
        if (yaoItem) {
            yaoItem.classList.add('changed')
        }
    })
}

function toggleYaociChange(yaoNum) {
    const activeElement = document.activeElement
    if (activeElement && activeElement.classList && activeElement.classList.contains('cx-char-btn')) {
        return
    }

    const index = cxChangedYaoci.indexOf(yaoNum)

    if (index > -1) {
        cxChangedYaoci.splice(index, 1)
        updateCxYaociChangeState(yaoNum, false)
    } else {
        cxChangedYaoci.push(yaoNum)
        updateCxYaociChangeState(yaoNum, true)
    }

    updateCxChangeGuaButton()
    renderCxNajiaGuaSymbol(cxCurrentGua)
    renderCxNajiaInfo(cxCurrentGua)
}

function updateGuaButtons(gua) {
    const hugua = getHuGua(gua)
    const zonggua = getZongGua(gua)
    const cuogua = getCuoGua(gua)

    const huguaBtn = document.getElementById('cxHuguaBtn')
    const zongguaBtn = document.getElementById('cxZongguaBtn')
    const cuoguaBtn = document.getElementById('cxCuoguaBtn')

    if (huguaBtn) {
        huguaBtn.textContent = `互:${hugua.shortName}`
        huguaBtn.dataset.guaName = hugua.name
        updateRelatedGuaButtonState(huguaBtn, gua, hugua)
    }

    if (zongguaBtn) {
        zongguaBtn.textContent = `综:${zonggua.shortName}`
        zongguaBtn.dataset.guaName = zonggua.name
        updateRelatedGuaButtonState(zongguaBtn, gua, zonggua)
    }

    if (cuoguaBtn) {
        cuoguaBtn.textContent = `错:${cuogua.shortName}`
        cuoguaBtn.dataset.guaName = cuogua.name
        updateRelatedGuaButtonState(cuoguaBtn, gua, cuogua)
    }

    renderCxRelatedFold(gua)
}

function updateRelatedGuaButtonState(button, currentGua, targetGua) {
    const disabled = !targetGua || targetGua.number === currentGua.number
    button.disabled = disabled
    button.classList.toggle('disabled', disabled)
    button.title = disabled ? '该卦与当前卦相同，无需跳转' : ''
}

function updateChangeGuaButtonState(button, currentGua, targetGua) {
    updateRelatedGuaButtonState(button, currentGua, targetGua)
}

function getYaoYinYangFromYaoci(yaoci) {
    const prefix = String(yaoci || '').split('：')[0]

    if (prefix.includes('九')) {
        return 1
    }

    if (prefix.includes('六')) {
        return 0
    }

    return null
}

function getHuGua(gua) {
    const yaoyin = gua.yaoci.map(getYaoYinYangFromYaoci)
    const lowerYao = [yaoyin[1], yaoyin[2], yaoyin[3]]
    const upperYao = [yaoyin[2], yaoyin[3], yaoyin[4]]
    const lowerBagua = findBaguaByYaoYinYang(lowerYao)
    const upperBagua = findBaguaByYaoYinYang(upperYao)

    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua) || gua
    }
    return gua
}

function getZongGua(gua) {
    const yaoyin = gua.yaoci.map(getYaoYinYangFromYaoci)
    const reversedYao = yaoyin.reverse()
    const lowerYao = [reversedYao[0], reversedYao[1], reversedYao[2]]
    const upperYao = [reversedYao[3], reversedYao[4], reversedYao[5]]
    const lowerBagua = findBaguaByYaoYinYang(lowerYao)
    const upperBagua = findBaguaByYaoYinYang(upperYao)

    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua) || gua
    }
    return gua
}

function getCuoGua(gua) {
    const baguaMap = {
        '乾': '坤', '坤': '乾',
        '震': '巽', '巽': '震',
        '坎': '离', '离': '坎',
        '艮': '兑', '兑': '艮'
    }

    const newUpper = baguaMap[gua.upper]
    const newLower = baguaMap[gua.lower]
    return liushisiGua.find(g => g.upper === newUpper && g.lower === newLower) || gua
}

function findBaguaByYaoYinYang(yaoArray) {
    for (const [baguaName, yaoYinYang] of Object.entries(baguaYaoYinYang)) {
        if (JSON.stringify(yaoYinYang) === JSON.stringify(yaoArray)) {
            return baguaName
        }
    }
    return null
}

function getBianGua(gua, changedYaoci) {
    const yaoyin = gua.yaoci.map(getYaoYinYangFromYaoci)
    changedYaoci.forEach(yaoNum => {
        const index = yaoNum - 1
        yaoyin[index] = yaoyin[index] === 1 ? 0 : 1
    })

    const lowerYao = [yaoyin[0], yaoyin[1], yaoyin[2]]
    const upperYao = [yaoyin[3], yaoyin[4], yaoyin[5]]
    const lowerBagua = findBaguaByYaoYinYang(lowerYao)
    const upperBagua = findBaguaByYaoYinYang(upperYao)

    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua) || gua
    }
    return gua
}

function jumpToGua(type) {
    let targetGuaName = ''
    const savedChangedYaoci = [...cxChangedYaoci]

    if (type === 'hugua') {
        targetGuaName = getHuGua(cxCurrentGua).name
    } else if (type === 'zonggua') {
        targetGuaName = getZongGua(cxCurrentGua).name
    } else if (type === 'cuogua') {
        targetGuaName = getCuoGua(cxCurrentGua).name
    }

    if (targetGuaName) {
        const targetGua = liushisiGua.find(g => g.name === targetGuaName)
        if (targetGua && targetGua.number !== cxCurrentGua.number) {
            showGuaDetail(targetGua, false)
            cxChangedYaoci = savedChangedYaoci
        }
    }
}

function jumpToBianGua() {
    if (cxChangedYaoci.length === 0) return
    const savedChangedYaoci = [...cxChangedYaoci]
    const bianGua = getBianGua(cxCurrentGua, cxChangedYaoci)
    if (bianGua && bianGua.number !== cxCurrentGua.number) {
        showGuaDetail(bianGua, false)
        cxChangedYaoci = savedChangedYaoci
    }
}

function backToBaguaSelect() {
    document.getElementById('cxBaguaSelect').style.display = 'block'
    document.getElementById('cxGuaDetail').style.display = 'none'
    closeCxInterpretationModal()
    cxChangedYaoci = []
    cxCurrentGua = {}
    cxRootGua = null

    document.querySelectorAll('#cxUpperBagua .bagua-btn, #cxLowerBagua .bagua-btn').forEach(btn => btn.classList.remove('selected'))

    window.fromYiceDetail = false
    window.yiceDongyao = null
    window.yiceMeasureTime = null
    window.yiceRecordId = null

    const backToYiceBtn = document.getElementById('cxBackToYiceBtn')
    if (backToYiceBtn) backToYiceBtn.style.display = 'none'
}

function backToRootGua() {
    if (cxRootGua) {
        showGuaDetail(cxRootGua, true)
    }
}
