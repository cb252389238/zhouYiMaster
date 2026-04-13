// ==================== 六十四卦查询模块 ====================
let cxCurrentGua = null
let cxChangedYaoci = []
let cxRootGua = null
let cxActiveCharacter = null

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
    setElementHtmlFromString(titleDiv, `第${yaoNum}爻：${formatClickableText(yaociTitle, { source: `第${yaoNum}爻标题` })}`)

    const contentDiv = document.createElement('div')
    contentDiv.className = 'yaoci-content'
    setElementHtmlFromString(contentDiv, formatClickableText(yaociContent, { source: `第${yaoNum}爻爻辞` }))

    yaoItem.append(titleDiv, contentDiv)
    return yaoItem
}

function showGuaDetail(gua, isRootGua = false) {
    cxCurrentGua = gua

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
    cxSymbolEl.appendChild(createGuaElement(gua.upper, gua.lower, cxChangedYaoci || []))

    const upperElement = baguaElement[gua.upper]
    const lowerElement = baguaElement[gua.lower]
    const guaNameDisplay = gua.upper === gua.lower
        ? `${gua.upper}为${baguaElement[gua.upper]}卦`
        : `${upperElement}${lowerElement}${gua.shortName}卦`

    setElementHtmlFromString(document.getElementById('cxGuaName'), formatClickableText(guaNameDisplay, { source: '卦名', large: true }))
    setElementHtmlFromString(document.getElementById('cxTuanshi'), formatClickableText(gua.tuanshi, { source: '卦辞' }))

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
    cxSymbolEl.appendChild(createGuaElement(cxCurrentGua.upper, cxCurrentGua.lower, cxChangedYaoci))
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

function getHuGua(gua) {
    const yaoyin = gua.yaoci.map(y => y.includes('九') ? 1 : 0)
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
    const yaoyin = gua.yaoci.map(y => y.includes('九') ? 1 : 0)
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
    const yaoyin = gua.yaoci.map(y => y.includes('九') ? 1 : 0)
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
