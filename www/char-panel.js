// ==================== 字符面板公共层 ====================
function buildGenericCharacterOriginInfo(char) {
    const natureChars = '天地山水火风雷泽日月云雨冰霜雪川河泉井田野谷丘渊郊陆海'
    const bodyChars = '人女子君王母父兄弟夫妻身心目耳口手足首面腹背血肉骨皮'
    const actionChars = '行止进退出入往来履见观言语食饮祭射击取纳执守征战'
    const ritualChars = '孚贞吉凶亨咎厉悔祀祭福祉禴庙筮占'

    let origin = `“${char}”见于六十四卦相关文本中，当前未单列专门条目，先按古文字常见构形与《易经》语境提供通用说明。`
    let originalMeaning = `“${char}”的早期本义通常需要结合甲骨文、金文、小篆及先秦用例综合判断。`
    let evolution = `在《易经》里，“${char}”多会随着卦名、卦辞、爻辞上下文，延伸为象意、德性判断或吉凶辞气的一部分。`

    if (natureChars.includes(char)) {
        origin = `“${char}”多属于自然物候或地理意象字，古文字往往直接摹写其形态、状态或环境特征。`
        originalMeaning = `其早期意义通常与自然现象、地貌、水火气象或时令变化有关。`
        evolution = `进入《易经》后，这类字常进一步承担取象功能，用来表达天地运行、时位变化与处境趋势。`
    } else if (bodyChars.includes(char)) {
        origin = `“${char}”多属于人体、亲属或身份称谓字，古文字常从人形、器官特征或社会关系会意。`
        originalMeaning = `其本义一般和身体部位、亲属身份、人格角色或人伦秩序相关。`
        evolution = `在《易经》里，这类字常从具体人物关系扩展到德行、处世位置与社会角色判断。`
    } else if (actionChars.includes(char)) {
        origin = `“${char}”多属于动作行为字，古文字常借手足动作、行进姿态或施为场景来构形。`
        originalMeaning = `其早期意义通常直接指某种动作、过程、施行方式或互动行为。`
        evolution = `在《易经》语境中，这类字往往进一步承担行动建议、处置方式与时机判断的功能。`
    } else if (ritualChars.includes(char)) {
        origin = `“${char}”多和占筮、祭祀、判断或礼仪表达相关，古文字背景常与上古宗教文化密切相连。`
        originalMeaning = `其本义通常靠近占问、吉凶判断、祭仪行为或祈福祝辞。`
        evolution = `进入《易经》后，这类字逐步稳定为判断辞、伦理辞或解释卦爻状态的核心术语。`
    }

    return { origin, originalMeaning, evolution }
}

function getCharacterOriginInfo(char) {
    const data = cxCharacterOriginMap[char]
    if (data) {
        return data
    }
    return buildGenericCharacterOriginInfo(char)
}

function closeCharacterPanel() {
    const panel = document.getElementById('cxCharPanel')
    const buttons = document.querySelectorAll('.cx-char-btn.active')
    buttons.forEach(btn => btn.classList.remove('active'))
    cxActiveCharacter = null

    if (panel) {
        panel.classList.remove('active', 'cx-char-panel-left', 'cx-char-panel-right', 'cx-char-panel-mobile')
        panel.style.left = ''
        panel.style.top = ''
        panel.style.visibility = ''
    }
}

function positionCharacterPanel(panel, triggerElement) {
    if (!panel || !triggerElement) return

    const gap = 10
    const mobileWidth = 768
    const scrollX = window.scrollX || window.pageXOffset
    const scrollY = window.scrollY || window.pageYOffset
    const triggerRect = triggerElement.getBoundingClientRect()
    const panelWidth = panel.offsetWidth
    const panelHeight = panel.offsetHeight
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const isMobile = viewportWidth <= mobileWidth

    panel.classList.remove('cx-char-panel-left', 'cx-char-panel-right', 'cx-char-panel-mobile')

    if (isMobile) {
        const left = scrollX + Math.max(10, (viewportWidth - panelWidth) / 2)
        const preferredTop = triggerRect.bottom + scrollY + 14
        let top = preferredTop

        if (top + panelHeight > scrollY + viewportHeight - 12) {
            top = scrollY + Math.max(12, (viewportHeight - panelHeight) / 2)
        }
        if (top < scrollY + 12) {
            top = scrollY + 12
        }

        panel.classList.add('cx-char-panel-mobile')
        panel.style.left = `${left}px`
        panel.style.top = `${top}px`
        return
    }

    let left = triggerRect.right + scrollX + gap
    let top = triggerRect.top + scrollY + (triggerRect.height - panelHeight) / 2
    let sideClass = 'cx-char-panel-right'

    if (left + panelWidth > scrollX + viewportWidth - 16) {
        left = triggerRect.left + scrollX - panelWidth - gap
        sideClass = 'cx-char-panel-left'
    }
    if (left < scrollX + 12) {
        left = scrollX + Math.max(12, (viewportWidth - panelWidth) / 2)
        sideClass = 'cx-char-panel-right'
    }
    if (top + panelHeight > scrollY + viewportHeight - 16) {
        top = scrollY + viewportHeight - panelHeight - 16
    }
    if (top < scrollY + 12) {
        top = scrollY + 12
    }

    panel.classList.add(sideClass)
    panel.style.left = `${left}px`
    panel.style.top = `${top}px`
}

function openCharacterPanel(char, triggerElement) {
    const panel = document.getElementById('cxCharPanel')
    if (!panel) return

    const info = getCharacterOriginInfo(char)
    const bigChar = panel.querySelector('.cx-char-panel-glyph')
    const title = panel.querySelector('.cx-char-panel-title')
    const origin = panel.querySelector('[data-field="origin"]')
    const originalMeaning = panel.querySelector('[data-field="originalMeaning"]')
    const evolution = panel.querySelector('[data-field="evolution"]')

    document.querySelectorAll('.cx-char-btn.active').forEach(btn => btn.classList.remove('active'))
    if (triggerElement) {
        triggerElement.classList.add('active')
    }

    cxActiveCharacter = char
    bigChar.textContent = char
    title.textContent = `“${char}”字释义`
    origin.textContent = info.origin
    originalMeaning.textContent = info.originalMeaning
    evolution.textContent = info.evolution
    panel.classList.add('active')
    panel.style.visibility = 'hidden'
    panel.style.left = '0px'
    panel.style.top = '0px'
    positionCharacterPanel(panel, triggerElement)
    panel.style.visibility = 'visible'
}

function handleCharacterClick(event) {
    const target = event.target.closest('.cx-char-btn')
    if (!target) return

    event.preventDefault()
    event.stopPropagation()

    const char = target.dataset.char
    if (!char) return

    if (target.classList.contains('active') && cxActiveCharacter === char) {
        closeCharacterPanel()
        return
    }

    openCharacterPanel(char, target)
}

function bindCharacterPanelEvents() {
    const detail = document.getElementById('cxGuaDetail')
    const closeBtn = document.getElementById('cxCharPanelClose')

    if (detail && !detail.dataset.charPanelBound) {
        detail.addEventListener('click', handleCharacterClick)
        detail.dataset.charPanelBound = 'true'
    }

    if (closeBtn && !closeBtn.dataset.bound) {
        closeBtn.addEventListener('click', closeCharacterPanel)
        closeBtn.dataset.bound = 'true'
    }

    if (!document.body.dataset.cxCharPanelDocBound) {
        document.addEventListener('click', event => {
            const clickedButton = event.target.closest('.cx-char-btn')
            const clickedPanel = event.target.closest('#cxCharPanel')
            if (!clickedButton && !clickedPanel) {
                closeCharacterPanel()
            }
        })

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeCharacterPanel()
            }
        })

        window.addEventListener('resize', () => {
            const activeButton = document.querySelector('.cx-char-btn.active')
            const panel = document.getElementById('cxCharPanel')
            if (panel && panel.classList.contains('active') && activeButton) {
                positionCharacterPanel(panel, activeButton)
            }
        })

        window.addEventListener('scroll', () => {
            const activeButton = document.querySelector('.cx-char-btn.active')
            const panel = document.getElementById('cxCharPanel')
            if (panel && panel.classList.contains('active') && activeButton) {
                positionCharacterPanel(panel, activeButton)
            }
        }, true)

        document.body.dataset.cxCharPanelDocBound = 'true'
    }
}

function initCharacterPanel() {
    bindCharacterPanelEvents()
}
