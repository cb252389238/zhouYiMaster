// ==================== 卦象练习模块 ====================
let gxCorrectAnswer = null
let gxAnswered = false

function initGuaXiang() {
    nextGuaXiang()
}

function nextGuaXiang() {
    gxAnswered = false
    document.getElementById('gxResult').innerHTML = ''
    document.getElementById('gxNextBtn').style.display = 'none'

    const randomIndex = Math.floor(Math.random() * liushisiGua.length)
    currentGua = liushisiGua[randomIndex]
    gxCorrectAnswer = currentGua.name

    const gxSymbolEl = document.getElementById('gxSymbol')
    gxSymbolEl.innerHTML = ''
    gxSymbolEl.appendChild(createGuaElement(currentGua.upper, currentGua.lower, []))

    const options = generateOptions(gxCorrectAnswer, 3)
    const optionsContainer = document.getElementById('gxOptions')
    optionsContainer.innerHTML = ''
    options.forEach(option => {
        const btn = document.createElement('button')
        btn.className = 'option-btn'
        btn.textContent = option
        btn.onclick = () => checkGuaXiangAnswer(option, btn)
        optionsContainer.appendChild(btn)
    })

    questionCount++
    document.getElementById('gxProgress').textContent = `第 ${questionCount} 题`
}

function checkGuaXiangAnswer(selectedAnswer, btnElement) {
    if (gxAnswered) return
    gxAnswered = true

    const resultDiv = document.getElementById('gxResult')
    const allButtons = document.querySelectorAll('#gxOptions .option-btn')

    if (selectedAnswer === gxCorrectAnswer) {
        btnElement.classList.add('correct')
        resultDiv.className = 'result-area correct'
        resultDiv.innerHTML = `✓ 回答正确！${gxCorrectAnswer}`
        score++
    } else {
        btnElement.classList.add('wrong')
        resultDiv.className = 'result-area wrong'
        resultDiv.innerHTML = `✗ 回答错误。正确答案是：${gxCorrectAnswer}`

        allButtons.forEach(btn => {
            if (btn.textContent === gxCorrectAnswer) {
                btn.classList.add('correct')
            }
        })
    }

    document.getElementById('gxNextBtn').style.display = 'inline-block'
}
