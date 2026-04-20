// ==================== 画符起卦模块 ====================
let hfCanvas = null
let hfCtx = null
let hfIsDrawing = false
let hfPenSize = 2
let hfStrokeCount = 0
let hfTotalLength = 0
let hfStartTime = 0
let hfLastX = 0
let hfLastY = 0
let hfHasDrawn = false
let hfCurrentGua = null
let hfCurrentDongyao = 0
let hfUpperBagua = ''
let hfLowerBagua = ''
let hfUpperInk = 0
let hfLowerInk = 0
let hfCanvasHeight = 400

function initHuafu() {
    hfCanvas = document.getElementById('hfCanvas')
    if (!hfCanvas) return

    hfCtx = hfCanvas.getContext('2d')
    hfResetState()

    hfCanvas.removeEventListener('pointerdown', hfOnPointerDown)
    hfCanvas.removeEventListener('pointermove', hfOnPointerMove)
    hfCanvas.removeEventListener('pointerup', hfOnPointerUp)
    hfCanvas.removeEventListener('pointerleave', hfOnPointerUp)

    hfCanvas.addEventListener('pointerdown', hfOnPointerDown)
    hfCanvas.addEventListener('pointermove', hfOnPointerMove)
    hfCanvas.addEventListener('pointerup', hfOnPointerUp)
    hfCanvas.addEventListener('pointerleave', hfOnPointerUp)

    document.getElementById('hfInlineYice').style.display = 'none'

    const btn = document.getElementById('hfQiGuaBtn')
    if (btn) {
        btn.disabled = false
        btn.textContent = '🖌️ 确定起卦'
    }

    requestAnimationFrame(() => {
        hfResizeCanvas()
    })
}

function hfResizeCanvas() {
    const wrapper = hfCanvas.parentElement
    const rect = wrapper.getBoundingClientRect()
    const cssWidth = rect.width > 0 ? rect.width : wrapper.offsetWidth
    const cssHeight = hfCanvas.offsetHeight > 0 ? hfCanvas.offsetHeight : 400
    hfCanvasHeight = cssHeight

    hfCanvas.style.width = cssWidth + 'px'
    hfCanvas.style.height = cssHeight + 'px'
    hfCanvas.width = cssWidth
    hfCanvas.height = cssHeight

    hfCtx.lineCap = 'round'
    hfCtx.lineJoin = 'round'
    hfCtx.strokeStyle = '#222'
    hfCtx.lineWidth = hfPenSize
}

function hfResetState() {
    hfStrokeCount = 0
    hfTotalLength = 0
    hfStartTime = 0
    hfHasDrawn = false
    hfCurrentGua = null
    hfCurrentDongyao = 0
    hfUpperBagua = ''
    hfLowerBagua = ''
    hfUpperInk = 0
    hfLowerInk = 0

    if (hfCtx && hfCanvas) {
        hfCtx.clearRect(0, 0, hfCanvas.width, hfCanvas.height)
        hfCtx.lineCap = 'round'
        hfCtx.lineJoin = 'round'
        hfCtx.strokeStyle = '#222'
        hfCtx.lineWidth = hfPenSize
    }

    const hint = document.getElementById('hfHint')
    if (hint) hint.classList.remove('hidden')
}

function hfOnPointerDown(e) {
    e.preventDefault()
    hfIsDrawing = true

    if (!hfHasDrawn) {
        hfStartTime = Date.now()
        hfHasDrawn = true
        const hint = document.getElementById('hfHint')
        if (hint) hint.classList.add('hidden')
    }

    const rect = hfCanvas.getBoundingClientRect()
    hfLastX = e.clientX - rect.left
    hfLastY = e.clientY - rect.top

    hfRecordInk(hfLastX, hfLastY)

    hfCtx.beginPath()
    hfCtx.moveTo(hfLastX, hfLastY)
    hfCtx.lineWidth = hfPenSize
}

function hfOnPointerMove(e) {
    if (!hfIsDrawing) return
    e.preventDefault()

    const rect = hfCanvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const dx = x - hfLastX
    const dy = y - hfLastY
    const dist = Math.sqrt(dx * dx + dy * dy)
    hfTotalLength += dist

    const steps = Math.max(1, Math.floor(dist))
    for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const ix = hfLastX + dx * t
        const iy = hfLastY + dy * t
        hfRecordInk(ix, iy)
    }

    hfCtx.lineTo(x, y)
    hfCtx.stroke()
    hfCtx.beginPath()
    hfCtx.moveTo(x, y)

    hfLastX = x
    hfLastY = y
}

function hfRecordInk(x, y) {
    const halfH = hfCanvasHeight / 2
    const inkAmount = hfPenSize
    if (y < halfH) {
        hfUpperInk += inkAmount
    } else {
        hfLowerInk += inkAmount
    }
}

function hfOnPointerUp() {
    if (!hfIsDrawing) return
    hfIsDrawing = false
    hfStrokeCount++
}

function hfSetPenSize(size, btn) {
    hfPenSize = size
    document.querySelectorAll('.hf-pen-btn').forEach(b => b.classList.remove('hf-pen-active'))
    btn.classList.add('hf-pen-active')
}

function hfClearCanvas() {
    hfResetState()
}

function hfStartDivination() {
    if (!hfHasDrawn) {
        showAppToast('请先在画布上书写或作画')
        return
    }

    const drawDuration = Date.now() - hfStartTime
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const second = now.getSeconds()
    const timeBase = year + month + day + hour + minute

    const a = hfUpperInk + hfStrokeCount * 7 + Math.floor(drawDuration / 100) + timeBase
    const b = hfLowerInk + (Math.floor(hfTotalLength) % 100) + Math.floor(drawDuration / 37) + timeBase + second

    const upperRemainder = ((a % 8) + 8) % 8
    const lowerRemainder = ((b % 8) + 8) % 8
    const xiantianMap = { 1: '乾', 2: '兑', 3: '离', 4: '震', 5: '巽', 6: '坎', 7: '艮', 0: '坤' }

    hfUpperBagua = xiantianMap[upperRemainder]
    hfLowerBagua = xiantianMap[lowerRemainder]

    if (!hfUpperBagua || !hfLowerBagua) {
        showAppToast('起卦计算异常，请重试')
        return
    }

    const dongyaoRemainder = ((a + b) % 6 + 6) % 6
    const dongyaoMap = [1, 2, 3, 4, 5, 6]
    hfCurrentDongyao = dongyaoMap[dongyaoRemainder]

    const gua = liushisiGua.find(g => g.upper === hfUpperBagua && g.lower === hfLowerBagua)
    if (!gua) {
        showAppToast('未找到对应卦象，请重试')
        return
    }

    hfCurrentGua = gua
    showHuafuResult({ gua, dongyao: hfCurrentDongyao, upperBagua: hfUpperBagua, lowerBagua: hfLowerBagua })
}

function showHuafuResult(result) {
    const modal = document.getElementById('hfResultModal')
    const symbolDiv = document.getElementById('hfResultSymbol')
    const nameDiv = document.getElementById('hfResultName')
    const infoDiv = document.getElementById('hfResultInfo')

    if (!result.gua) {
        showAppToast('起卦失败，请重试')
        return
    }

    symbolDiv.innerHTML = ''
    symbolDiv.appendChild(createGuaElement(result.gua.upper, result.gua.lower, [result.dongyao]))

    const upperElement = baguaElement[result.gua.upper]
    const lowerElement = baguaElement[result.gua.lower]
    const guaNameDisplay = result.gua.upper === result.gua.lower
        ? result.gua.upper + '为' + baguaElement[result.gua.upper]
        : upperElement + lowerElement + result.gua.shortName
    nameDiv.textContent = guaNameDisplay

    const yaoNames = ['初', '二', '三', '四', '五', '上']
    const dongyaoName = yaoNames[result.dongyao - 1]
    const allYao = [...baguaYaoYinYang[result.gua.lower], ...baguaYaoYinYang[result.gua.upper]]
    const yaoValue = allYao[result.dongyao - 1]
    const yaoPrefix = yaoValue === 1 ? '九' : '六'

    infoDiv.innerHTML = '上卦：' + result.upperBagua + '（' + baguaElement[result.upperBagua] + '）<br>' +
        '下卦：' + result.lowerBagua + '（' + baguaElement[result.lowerBagua] + '）<br>' +
        '动爻：<span class="mh-result-dongyao">' + yaoPrefix + dongyaoName + '</span>'

    modal.style.display = 'flex'
}

function closeHuafuResult() {
    document.getElementById('hfResultModal').style.display = 'none'
}

function showHuafuDetail() {
    if (!hfCurrentGua) return

    window.fromHuafuDetail = true
    document.getElementById('hfResultModal').style.display = 'none'
    showModule('chaxun')
    showGuaDetail(hfCurrentGua, true)
    toggleYaociChange(hfCurrentDongyao)
}

function addHuafuToYice() {
    if (!hfCurrentGua) {
        showAppToast('请先起卦')
        return
    }

    document.getElementById('hfResultModal').style.display = 'none'
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    document.getElementById('hfYiceTime').value = `${year}-${month}-${day}T${hour}:${minute}`

    document.getElementById('hfYiceCategory').value = ''
    document.getElementById('hfYiceContent').value = ''
    document.getElementById('hfYicePerson').value = ''
    document.getElementById('hfYiceAnalysis').value = ''
    document.getElementById('hfYiceAccuracy').value = 70
    document.getElementById('hfYiceAccuracyVal').textContent = '70%'

    loadCategoriesToSelect('hfYiceCategory')
    appendInlineGuaDisplay('hfYiceGuaDisplay', hfCurrentGua, [hfCurrentDongyao])

    document.getElementById('hfInlineYice').style.display = 'block'
    document.getElementById('hfInlineYice').scrollIntoView({ behavior: 'smooth' })
}

async function saveHuafuInlineYice() {
    await runYiceAction('saveHuafuInlineYice', async () => {
        if (!hfCurrentGua) {
            showAppToast('请先起卦')
            return
        }

        const record = normalizeYiceRecord({
            id: Date.now().toString(),
            category: document.getElementById('hfYiceCategory').value,
            content: document.getElementById('hfYiceContent').value,
            person: document.getElementById('hfYicePerson').value,
            upper: hfCurrentGua.upper,
            lower: hfCurrentGua.lower,
            dongyao: [hfCurrentDongyao],
            analysis: document.getElementById('hfYiceAnalysis').value,
            createTime: document.getElementById('hfYiceTime').value,
            updateTime: new Date().toISOString(),
            accuracy: (() => {
                const accuracy = parseInt(document.getElementById('hfYiceAccuracy').value, 10)
                return Number.isNaN(accuracy) ? 70 : accuracy
            })(),
            replays: []
        })

        await queueYiceWrite(async () => {
            await loadYiceData()
            await insertYiceRecordToDB(record)
            ycRecords.unshift(record)
        })

        showAppToast('保存成功')
        cancelHuafuInlineYice()
    })
}

function cancelHuafuInlineYice() {
    document.getElementById('hfInlineYice').style.display = 'none'
}
