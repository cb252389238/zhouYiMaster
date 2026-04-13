// ==================== 六爻起卦模块 ====================
let lyYaoci = [] // 存储六爻结果（从下往上）
let lyCurrentYao = 0 // 当前投掷第几爻（1-6）
let lyIsTossing = false // 是否正在投掷

function createActionButton(text, onClick, styles = {}) {
    const button = document.createElement('button')
    button.className = 'option-btn'
    button.textContent = text
    button.onclick = onClick
    Object.assign(button.style, styles)
    return button
}

function renderLiuYaoButtonArea(buttons) {
    const buttonArea = document.getElementById('lyButtonArea')
    buttonArea.innerHTML = ''
    buttons.forEach(button => buttonArea.appendChild(button))
}

function appendInlineGuaDisplay(containerId, gua, dongyao, nameSize = '1.5em', symbolSize = '4em') {
    const container = document.getElementById(containerId)
    if (!container) return

    container.innerHTML = ''
    const nameDiv = document.createElement('div')
    nameDiv.style.fontSize = nameSize
    nameDiv.style.marginBottom = '10px'
    nameDiv.textContent = getGuaNameBy上下(gua.upper, gua.lower)

    const symbolDiv = document.createElement('div')
    symbolDiv.style.fontSize = symbolSize
    symbolDiv.appendChild(createGuaElement(gua.upper, gua.lower, dongyao))

    container.append(nameDiv, symbolDiv)
}

function initLiuYao() {
    lyYaoci = []
    lyCurrentYao = 0
    lyIsTossing = false

    document.getElementById('lyTossArea').style.display = 'block'
    document.getElementById('lyGuaDiv').style.display = 'none'
    document.getElementById('lyCoin1').src = 'image/有字面.png'
    document.getElementById('lyCoin2').src = 'image/有字面.png'
    document.getElementById('lyCoin3').src = 'image/有字面.png'
    document.getElementById('lyResult').innerHTML = ''
    document.getElementById('lyYaoDisplay').innerHTML = ''
    document.getElementById('lyFinalResult').style.display = 'none'
    renderLiuYaoButtonArea([
        createActionButton('投掷铜钱', tossCoins, {})
    ])
    document.getElementById('lyButtonArea').firstChild.id = 'lyTossBtn'
    document.getElementById('lyProgress').textContent = '第 1 爻'
    document.getElementById('lyInlineYice').style.display = 'none'
}

function updateLiuYaoProgress() {
    document.getElementById('lyProgress').textContent = `第 ${lyCurrentYao} 爻`
}

function getGuaNameByYaoci(yaoci) {
    const gua = findGuaByYaoci(yaoci)
    if (!gua) return ''

    const upperElement = baguaElement[gua.upper]
    const lowerElement = baguaElement[gua.lower]

    if (gua.upper === gua.lower) {
        return `${gua.upper}为${baguaElement[gua.upper]}卦`
    }
    return `${upperElement}${lowerElement}${gua.shortName}卦`
}

function renderYaoSymbol(total) {
    const isYang = total === 7 || total === 9
    const isOld = total === 6 || total === 9

    let className = 'yao-line'
    if (isYang) {
        className += isOld ? ' old yang' : ' normal yang'
    } else {
        className += isOld ? ' old' : ' normal'
    }

    const container = document.getElementById('lyYaoDisplay')
    const yaoDiv = document.createElement('div')
    yaoDiv.className = className
    container.appendChild(yaoDiv)
}

function tossCoins() {
    if (lyIsTossing) return
    lyIsTossing = true

    if (lyCurrentYao === 0) {
        lyCurrentYao = 1
        updateLiuYaoProgress()
    }

    const coins = [
        document.getElementById('lyCoin1'),
        document.getElementById('lyCoin2'),
        document.getElementById('lyCoin3')
    ]

    coins.forEach((coin, index) => {
        const wrapper = coin.parentElement
        wrapper.classList.remove('rolling')
        wrapper.offsetHeight
        wrapper.style.animationDelay = `${index * 70}ms`
        wrapper.classList.add('rolling')
    })

    setTimeout(() => {
        coins.forEach(coin => {
            const wrapper = coin.parentElement
            wrapper.classList.remove('rolling')
            wrapper.style.animationDelay = ''
        })

        let total = 0
        coins.forEach(coin => {
            const value = Math.random() < 0.5 ? 2 : 3
            total += value
            coin.src = value === 2 ? 'image/有字面.png' : 'image/无字面.png'
        })

        lyYaoci.push(total)
        renderYaoSymbol(total)

        setTimeout(() => {
            if (lyCurrentYao < 6) {
                lyCurrentYao++
                updateLiuYaoProgress()
                lyIsTossing = false
            } else {
                showLiuYaoResult()
            }
        }, 500)
    }, 800)
}

function showLiuYaoResult() {
    const resultDiv = document.getElementById('lyFinalResult')
    resultDiv.style.display = 'block'
    const gua = findGuaByYaoci(lyYaoci)

    if (gua) {
        window.lyCurrentGua = gua
        const upperElement = baguaElement[gua.upper]
        const lowerElement = baguaElement[gua.lower]
        const guaNameDisplay = gua.upper === gua.lower
            ? `${gua.upper}为${baguaElement[gua.upper]}卦`
            : `${upperElement}${lowerElement}${gua.shortName}卦`

        const progressDiv = document.getElementById('lyProgress')
        progressDiv.textContent = guaNameDisplay
        progressDiv.style.fontSize = '1.5em'
        progressDiv.style.fontWeight = 'bold'
        progressDiv.style.color = '#667eea'

        resultDiv.innerHTML = ''
        renderLiuYaoButtonArea([
            createActionButton('重新起卦', resetLiuYao, { display: 'block', width: '100%', marginBottom: '10px' }),
            createActionButton('卦象详情', showLiuYaoDetail, { display: 'block', width: '100%', marginBottom: '10px' }),
            createActionButton('添加到易策', addToYiceFromLiuYao, { display: 'block', width: '100%', background: '#34c759' })
        ])
    }
}

function addToYiceFromLiuYao() {
    if (!window.lyCurrentGua) {
        showAppToast('请先起卦')
        return
    }

    const gua = window.lyCurrentGua
    const dongyao = []
    lyYaoci.forEach((value, index) => {
        if (value === 6 || value === 9) {
            dongyao.push(index + 1)
        }
    })

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    document.getElementById('lyYiceTime').value = `${year}-${month}-${day}T${hour}:${minute}`

    document.getElementById('lyYiceCategory').value = ''
    document.getElementById('lyYiceContent').value = ''
    document.getElementById('lyYicePerson').value = ''
    document.getElementById('lyYiceAnalysis').value = ''
    document.getElementById('lyYiceAccuracy').value = 70
    document.getElementById('lyYiceAccuracyVal').textContent = '70%'

    loadCategoriesToSelect('lyYiceCategory')
    appendInlineGuaDisplay('lyYiceGuaDisplay', gua, dongyao)

    window._lyInlineDongyao = dongyao
    document.getElementById('lyInlineYice').style.display = 'block'
    document.getElementById('lyInlineYice').scrollIntoView({ behavior: 'smooth' })
}

function showAddYicePreFill() {
    const fromData = window.yiceFromLiuYao
    showAddYice(true)

    if (fromData) {
        setTimeout(() => {
            ycSelectedUpper = fromData.upper
            ycSelectedLower = fromData.lower
            ycSelectedDongyao = [...fromData.dongyao]

            document.getElementById('ycSelectedGuaText').style.display = 'none'
            const display = document.getElementById('ycSelectedGuaDisplay')
            display.style.display = 'block'
            appendGuaDisplay(display, getGuaNameBy上下(ycSelectedUpper, ycSelectedLower), createGuaElement(ycSelectedUpper, ycSelectedLower, ycSelectedDongyao), '1.5em', '4em')

            document.getElementById('ycDongyaoSelect').style.display = 'block'
            renderDongyaoButtons('ycDongyaoButtons', 'ycAdd')
        }, 100)
    }
}

function findGuaByYaoci(yaoci) {
    const yaoyin = yaoci.map(y => (y === 7 || y === 9) ? 1 : 0)
    const lowerYao = [yaoyin[0], yaoyin[1], yaoyin[2]]
    const upperYao = [yaoyin[3], yaoyin[4], yaoyin[5]]

    const lowerBagua = findBaguaByYaoYinYang(lowerYao)
    const upperBagua = findBaguaByYaoYinYang(upperYao)

    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua)
    }

    return null
}

function showLiuYaoDetail() {
    if (!window.lyCurrentGua) return

    window.fromLiuYaoDetail = true
    showModule('chaxun')
    showGuaDetail(window.lyCurrentGua, true)

    lyYaoci.forEach((yaoValue, index) => {
        const yaoNum = index + 1
        if (yaoValue === 6 || yaoValue === 9) {
            toggleYaociChange(yaoNum)
        }
    })
}

function resetLiuYao() {
    initLiuYao()
}
