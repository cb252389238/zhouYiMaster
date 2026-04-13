// ==================== 卦名记忆与爻辞卦辞练习模块 ====================
let gmSelectedBagua = []
let gmAnswered = false
let gmClickCount = 0

let ycCurrentStep = 0
let ycAnswered = false

function initGuaMing() {
    nextGuaMing()
}

function nextGuaMing() {
    gmAnswered = false
    gmSelectedBagua = []
    gmClickCount = 0
    document.getElementById('gmResult').innerHTML = ''
    document.getElementById('gmNextBtn').style.display = 'none'
    document.getElementById('gmSelected').innerHTML = ''

    const randomIndex = Math.floor(Math.random() * liushisiGua.length)
    currentGua = liushisiGua[randomIndex]
    document.getElementById('gmGuaName').textContent = `??${currentGua.shortName}卦`

    const baguaContainer = document.getElementById('gmBaguaOptions')
    baguaContainer.innerHTML = ''
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
        btn.onclick = () => selectBagua(key, btn)
        baguaContainer.appendChild(btn)
    })

    questionCount++
    document.getElementById('gmProgress').textContent = `第 ${questionCount} 题`
}

function selectBagua(baguaName, btnElement) {
    if (gmAnswered) return
    if (gmClickCount >= 2) return

    gmSelectedBagua.push(baguaName)
    gmClickCount++
    btnElement.classList.add('selected')
    updateSelectedBaguaDisplay()

    if (gmClickCount === 2) {
        checkGuaMingAnswer()
    }
}

function updateSelectedBaguaDisplay() {
    const display = gmSelectedBagua.map(name => `${name}`).join(' + ')
    document.getElementById('gmSelected').innerHTML = gmSelectedBagua.length > 0 ? `已选：${display}` : ''
}

function checkGuaMingAnswer() {
    gmAnswered = true
    const resultDiv = document.getElementById('gmResult')

    const correctUpper = currentGua.upper
    const correctLower = currentGua.lower
    const isCorrect = (gmSelectedBagua[0] === correctUpper && gmSelectedBagua[1] === correctLower) ||
        (gmSelectedBagua[0] === correctLower && gmSelectedBagua[1] === correctUpper)

    const upperElement = baguaElement[correctUpper]
    const lowerElement = baguaElement[correctLower]
    const guaNameDisplay = correctUpper === correctLower
        ? `${correctUpper}为${upperElement}卦`
        : `${upperElement}${lowerElement}${currentGua.shortName}卦`

    if (isCorrect) {
        resultDiv.className = 'result-area correct'
        resultDiv.innerHTML = `✓ 回答正确！${guaNameDisplay}由${upperElement}卦和${lowerElement}卦组成`
        score++
    } else {
        resultDiv.className = 'result-area wrong'
        resultDiv.innerHTML = `✗ 回答错误。${guaNameDisplay}由${upperElement}卦（上）和${lowerElement}卦（下）组成`
    }

    document.getElementById('gmGuaName').textContent = guaNameDisplay
    document.getElementById('gmNextBtn').style.display = 'inline-block'
}

function initYaoCi() {
    score = 0
    questionCount = 0
    ycCurrentStep = 0
    ycAnswered = false

    const randomIndex = Math.floor(Math.random() * liushisiGua.length)
    currentGua = liushisiGua[randomIndex]

    const ycSymbolEl = document.getElementById('ycSymbol')
    ycSymbolEl.innerHTML = ''
    ycSymbolEl.appendChild(createGuaElement(currentGua.upper, currentGua.lower, []))
    document.getElementById('ycGuaName').textContent = currentGua.name
    document.getElementById('ycScore').textContent = `得分：${score} | 题数：${questionCount}`
    showGuaCiQuestion()
}

function nextYaoCi() {
    ycCurrentStep = 0
    ycAnswered = false
    document.getElementById('ycResult').innerHTML = ''
    document.getElementById('ycNextBtn').style.display = 'none'
    document.getElementById('ycNextBtn').textContent = '继续'

    const randomIndex = Math.floor(Math.random() * liushisiGua.length)
    currentGua = liushisiGua[randomIndex]

    const ycSymbolEl = document.getElementById('ycSymbol')
    ycSymbolEl.innerHTML = ''
    ycSymbolEl.appendChild(createGuaElement(currentGua.upper, currentGua.lower, []))
    document.getElementById('ycGuaName').textContent = currentGua.name
    document.getElementById('ycScore').textContent = `得分：${score} | 题数：${questionCount}`
    showGuaCiQuestion()
}

function showGuaCiQuestion() {
    const questionDiv = document.getElementById('ycQuestion')
    questionDiv.innerHTML = '<h3 style="margin-bottom:15px;">请选择正确的卦辞：</h3>'

    const options = generateGuaCiOptions(currentGua.tuanshi, 3)
    const optionsContainer = document.createElement('div')
    optionsContainer.className = 'options-grid'
    optionsContainer.style.gridTemplateColumns = '1fr'

    options.forEach(option => {
        const btn = document.createElement('div')
        btn.className = 'yaoci-option'
        btn.dataset.originalText = option
        btn.innerHTML = formatTextWithPinyin(option)
        btn.onclick = () => checkYaoCiAnswer(option, btn, currentGua.tuanshi)
        optionsContainer.appendChild(btn)
    })

    questionDiv.appendChild(optionsContainer)
}

function showYaoCiQuestion(yaoIndex) {
    const questionDiv = document.getElementById('ycQuestion')
    questionDiv.innerHTML = `<h3 style="margin-bottom:15px;">请选择第${yaoIndex}爻的爻辞：</h3>`

    const correctYaoci = currentGua.yaoci[yaoIndex - 1]
    const options = generateYaociOptions(correctYaoci, yaoIndex)
    const optionsContainer = document.createElement('div')
    optionsContainer.className = 'options-grid'
    optionsContainer.style.gridTemplateColumns = '1fr'

    options.forEach(option => {
        const btn = document.createElement('div')
        btn.className = 'yaoci-option'
        btn.dataset.originalText = option
        btn.innerHTML = formatTextWithPinyin(option)
        btn.onclick = () => checkYaoCiAnswer(option, btn, correctYaoci)
        optionsContainer.appendChild(btn)
    })

    questionDiv.appendChild(optionsContainer)
}

function generateYaociOptions(correctAnswer, yaoIndex) {
    const options = [correctAnswer]
    const usedOptions = new Set([correctAnswer])

    while (options.length < 3) {
        const randomGua = liushisiGua[Math.floor(Math.random() * liushisiGua.length)]
        const randomYaoci = randomGua.yaoci[yaoIndex - 1]
        if (!usedOptions.has(randomYaoci)) {
            options.push(randomYaoci)
            usedOptions.add(randomYaoci)
        }
    }

    return options.sort(() => Math.random() - 0.5)
}

function checkYaoCiAnswer(selectedAnswer, btnElement, correctAnswer) {
    if (ycAnswered) return
    ycAnswered = true

    const resultDiv = document.getElementById('ycResult')
    const allButtons = document.querySelectorAll('.yaoci-option')

    if (selectedAnswer === correctAnswer) {
        btnElement.classList.add('correct')
        resultDiv.className = 'result-area correct'
        resultDiv.innerHTML = '✓ 回答正确！'
        score++

        if (ycCurrentStep === 0) {
            document.getElementById('ycNextBtn').textContent = '进入爻辞'
        } else {
            document.getElementById('ycNextBtn').textContent = '继续'
        }
    } else {
        btnElement.classList.add('wrong')
        resultDiv.className = 'result-area wrong'
        resultDiv.innerHTML = `✗ 回答错误。正确答案是：${formatTextWithPinyin(correctAnswer)}`

        allButtons.forEach(btn => {
            if (btn.dataset.originalText === correctAnswer) {
                btn.classList.add('correct')
            }
        })

        document.getElementById('ycNextBtn').textContent = '下一卦'
    }

    document.getElementById('ycNextBtn').style.display = 'inline-block'
    questionCount++
}

function nextYaoCiModule() {
    if (!ycAnswered) return

    if (ycCurrentStep === 0 && document.getElementById('ycNextBtn').textContent === '进入爻辞') {
        ycCurrentStep = 1
        ycAnswered = false
        document.getElementById('ycResult').innerHTML = ''
        document.getElementById('ycNextBtn').style.display = 'none'
        showYaoCiQuestion(1)
    } else if (ycCurrentStep >= 1 && ycCurrentStep < 6) {
        ycCurrentStep++
        ycAnswered = false
        document.getElementById('ycResult').innerHTML = ''
        document.getElementById('ycNextBtn').style.display = 'none'
        showYaoCiQuestion(ycCurrentStep)
    } else {
        initYaoCi()
    }
}

function generateOptions(correctAnswer, count) {
    const options = [correctAnswer]
    const usedOptions = new Set([correctAnswer])

    while (options.length < count) {
        const randomGua = liushisiGua[Math.floor(Math.random() * liushisiGua.length)]
        const randomName = randomGua.name
        if (!usedOptions.has(randomName)) {
            options.push(randomName)
            usedOptions.add(randomName)
        }
    }

    return options.sort(() => Math.random() - 0.5)
}

function generateGuaCiOptions(correctAnswer, count) {
    const options = [correctAnswer]
    const usedOptions = new Set([correctAnswer])

    while (options.length < count) {
        const randomGua = liushisiGua[Math.floor(Math.random() * liushisiGua.length)]
        const randomGuaCi = randomGua.tuanshi
        if (!usedOptions.has(randomGuaCi)) {
            options.push(randomGuaCi)
            usedOptions.add(randomGuaCi)
        }
    }

    return options.sort(() => Math.random() - 0.5)
}
