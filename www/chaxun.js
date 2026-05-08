// ==================== 六十四卦查询模块 ====================
let cxCurrentGua = null
let cxChangedYaoci = []
let cxRootGua = null
let cxActiveCharacter = null
let cxInterpretationModalBound = false

function initChaXun() {
    cxCurrentGua = {}
    cxChangedYaoci = []
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
        btn.onclick = () => selectBaguaForChaXun(key, position)
        container.appendChild(btn)
    })
}

function selectBaguaForChaXun(baguaName, position) {
    if (position === 'upper') {
        cxCurrentGua = {}
        cxCurrentGua.upper = baguaName
        document.querySelectorAll('#cxUpperBagua .bagua-btn').forEach(btn => btn.classList.remove('selected'))
        event.currentTarget.classList.add('selected')
    } else {
        cxCurrentGua.lower = baguaName
        document.querySelectorAll('#cxLowerBagua .bagua-btn').forEach(btn => btn.classList.remove('selected'))
        event.currentTarget.classList.add('selected')
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

    const cxSymbolEl = document.getElementById('cxSymbol')
    cxSymbolEl.innerHTML = ''
    cxSymbolEl.appendChild(createCxNajiaGuaElement(gua, cxChangedYaoci || []))
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

    const changeGuaBtn = document.getElementById('cxChangeGuaBtn')
    if (changeGuaBtn) {
        if (isRootGua && cxChangedYaoci.length > 0) {
            const bianGua = getBianGua(cxCurrentGua, cxChangedYaoci)
            if (bianGua) {
                changeGuaBtn.textContent = `变卦：${bianGua.shortName}卦`
                changeGuaBtn.style.display = 'inline-block'
            }
        } else {
            changeGuaBtn.style.display = 'none'
        }
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
    const yaoItem = document.querySelector(`.yaoci-item[data-yao-num="${yaoNum}"]`)

    if (index > -1) {
        cxChangedYaoci.splice(index, 1)
        yaoItem.classList.remove('changed')
    } else {
        cxChangedYaoci.push(yaoNum)
        yaoItem.classList.add('changed')
    }

    const changeGuaBtn = document.getElementById('cxChangeGuaBtn')
    if (cxChangedYaoci.length > 0) {
        const bianGua = getBianGua(cxCurrentGua, cxChangedYaoci)
        if (bianGua) {
            changeGuaBtn.textContent = `变卦：${bianGua.shortName}卦`
            changeGuaBtn.style.display = 'inline-block'
        }
    } else {
        changeGuaBtn.style.display = 'none'
    }

    const cxSymbolEl = document.getElementById('cxSymbol')
    cxSymbolEl.innerHTML = ''
    cxSymbolEl.appendChild(createCxNajiaGuaElement(cxCurrentGua, cxChangedYaoci))
    renderCxNajiaInfo(cxCurrentGua)
}

function updateGuaButtons(gua) {
    const hugua = getHuGua(gua)
    const zonggua = getZongGua(gua)
    const cuogua = getCuoGua(gua)

    const huguaBtn = document.getElementById('cxHuguaBtn')
    const zongguaBtn = document.getElementById('cxZongguaBtn')
    const cuoguaBtn = document.getElementById('cxCuoguaBtn')

    huguaBtn.textContent = `互卦：${hugua.shortName}卦`
    zongguaBtn.textContent = `综卦：${zonggua.shortName}卦`
    cuoguaBtn.textContent = `错卦：${cuogua.shortName}卦`

    huguaBtn.dataset.guaName = hugua.name
    zongguaBtn.dataset.guaName = zonggua.name
    cuoguaBtn.dataset.guaName = cuogua.name
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
        if (targetGua) {
            showGuaDetail(targetGua, false)
            cxChangedYaoci = savedChangedYaoci
        }
    }
}

function jumpToBianGua() {
    if (cxChangedYaoci.length === 0) return
    const savedChangedYaoci = [...cxChangedYaoci]
    const bianGua = getBianGua(cxCurrentGua, cxChangedYaoci)
    if (bianGua) {
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
    window.yiceRecordId = null

    const backToYiceBtn = document.getElementById('cxBackToYiceBtn')
    if (backToYiceBtn) backToYiceBtn.style.display = 'none'
}

function backToRootGua() {
    if (cxRootGua) {
        showGuaDetail(cxRootGua, true)
    }
}
