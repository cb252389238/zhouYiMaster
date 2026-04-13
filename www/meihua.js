// ==================== 梅花易数模块 ====================
let mhAnimationId = null
let mhRotationAngleY = 0
let mhRotationAngleX = 0
let mhRotationSpeed = 0.3
let mhIsDivining = false
let mhCurrentGua = null
let mhCurrentDongyao = 0
let mhGuaItems = []
let mhSpherePoints = []
let mhContainerSize = 400
let mhRadius = 150
let mhCurrentRadius = 150
let mhBaseRadius = 150

function fibonacciSphere(count) {
    const points = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2
        const radiusAtY = Math.sqrt(1 - y * y)
        const theta = goldenAngle * i
        const x = Math.cos(theta) * radiusAtY
        const z = Math.sin(theta) * radiusAtY
        points.push({ x, y, z })
    }
    return points
}

function initMeihua() {
    mhRotationAngleY = 0
    mhRotationAngleX = 0
    mhRotationSpeed = 0.3
    mhIsDivining = false
    mhCurrentGua = null
    mhCurrentDongyao = 0

    const circle = document.getElementById('mhGuaCircle')
    if (!circle) return
    circle.innerHTML = ''
    mhGuaItems = []

    const area = document.querySelector('.mh-gua-area')
    if (area) {
        mhContainerSize = Math.min(area.offsetWidth - 20, 400)
        mhBaseRadius = (mhContainerSize / 2) - 50
        mhRadius = mhBaseRadius
        mhCurrentRadius = mhBaseRadius
    }

    circle.style.width = mhContainerSize + 'px'
    circle.style.height = mhContainerSize + 'px'
    mhSpherePoints = fibonacciSphere(64)

    liushisiGua.forEach((gua, index) => {
        const item = document.createElement('div')
        item.className = 'mh-gua-item'
        item.dataset.index = index
        item.innerHTML = createMiniGuaSymbolHtml(gua.upper, gua.lower) + '<div class="mh-gua-name">' + gua.shortName + '</div>'
        circle.appendChild(item)
        mhGuaItems.push(item)
    })

    if (mhAnimationId) cancelAnimationFrame(mhAnimationId)
    startMeihuaAnimation()

    const btn = document.getElementById('mhQiGuaBtn')
    if (btn) {
        btn.disabled = false
        btn.textContent = '☯ 起 卦 ☯'
    }

    document.getElementById('mhInlineYice').style.display = 'none'
}

function createMiniGuaSymbolHtml(upper, lower) {
    const upperYao = baguaYaoYinYang[upper]
    const lowerYao = baguaYaoYinYang[lower]
    if (!upperYao || !lowerYao) return ''

    let html = '<div class="mh-mini-gua">'
    const allYao = [...lowerYao, ...upperYao]
    for (let i = 0; i < 6; i++) {
        html += '<div class="mh-mini-yao ' + (allYao[i] === 1 ? 'yang' : 'yin') + '"></div>'
    }
    html += '</div>'
    return html
}

function startMeihuaAnimation() {
    const centerX = mhContainerSize / 2
    const centerY = mhContainerSize / 2

    function animate() {
        mhRotationAngleY += mhRotationSpeed
        if (mhRotationAngleY >= 360) mhRotationAngleY -= 360

        mhRotationAngleX += mhRotationSpeed * 0.3
        if (mhRotationAngleX >= 360) mhRotationAngleX -= 360

        const time = Date.now() / 1000
        const cosRY = Math.cos(mhRotationAngleY * Math.PI / 180)
        const sinRY = Math.sin(mhRotationAngleY * Math.PI / 180)
        const cosRX = Math.cos(mhRotationAngleX * Math.PI / 180)
        const sinRX = Math.sin(mhRotationAngleX * Math.PI / 180)
        const currentR = mhCurrentRadius
        const perspective = currentR * 2.5

        mhGuaItems.forEach((item, index) => {
            const pt = mhSpherePoints[index]

            const x1 = pt.x * cosRY + pt.z * sinRY
            const z1 = -pt.x * sinRY + pt.z * cosRY
            const y1 = pt.y

            const y2 = y1 * cosRX - z1 * sinRX
            const z2 = y1 * sinRX + z1 * cosRX
            const x2 = x1

            const screenX = centerX + x2 * currentR
            const screenY = centerY + y2 * currentR
            const depthScale = (perspective + z2 * currentR) / perspective
            const clampedScale = Math.max(0.4, Math.min(1.6, depthScale))

            item.style.left = screenX + 'px'
            item.style.top = screenY + 'px'
            item.style.transform = 'translate(-50%, -50%) scale(' + clampedScale + ')'
            item.style.zIndex = Math.round(z2 * 100 + 100)

            if (!mhIsDivining) {
                const depthOpacity = 0.3 + 0.7 * ((z2 + 1) / 2)
                const breathe = 0.7 + 0.3 * Math.abs(Math.sin(time * 0.5 + index * 0.3))
                item.style.opacity = depthOpacity * breathe
            }
        })

        mhAnimationId = requestAnimationFrame(animate)
    }

    animate()
}

function stopMeihuaAnimation() {
    if (mhAnimationId) {
        cancelAnimationFrame(mhAnimationId)
        mhAnimationId = null
    }
}

function startMeihuaDivination() {
    if (mhIsDivining) return
    mhIsDivining = true

    const btn = document.getElementById('mhQiGuaBtn')
    if (btn) {
        btn.disabled = true
        btn.textContent = '起卦中...'
    }

    const maxRadius = mhBaseRadius * 2.2
    const accelerateStart = Date.now()
    const accelerateDuration = 2500

    function accelerate() {
        const elapsed = Date.now() - accelerateStart
        const progress = Math.min(elapsed / accelerateDuration, 1)

        mhRotationSpeed = 0.3 + progress * progress * 25
        mhCurrentRadius = mhBaseRadius + (maxRadius - mhBaseRadius) * progress * progress

        if (progress < 1) {
            requestAnimationFrame(accelerate)
        } else {
            setTimeout(() => {
                const result = meihuaCalculate()
                mhCurrentGua = result.gua
                mhCurrentDongyao = result.dongyao
                decelerateAndShowResult(result)
            }, 1500)
        }
    }

    accelerate()
}

function meihuaCalculate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const second = now.getSeconds()
    const millisecond = now.getMilliseconds()

    const upperSum = year + month + day + hour + minute + second
    const upperRemainder = upperSum % 8
    const lowerSum = year + month + day + hour + minute + second + millisecond
    const lowerRemainder = lowerSum % 8
    const xiantianMap = { 1: '乾', 2: '兑', 3: '离', 4: '震', 5: '巽', 6: '坎', 7: '艮', 0: '坤' }

    const upperBagua = xiantianMap[upperRemainder]
    const lowerBagua = xiantianMap[lowerRemainder]
    const dongyaoRemainder = lowerSum % 6
    const dongyao = dongyaoRemainder === 0 ? 6 : dongyaoRemainder
    const gua = liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua)

    return { gua, dongyao, upperBagua, lowerBagua }
}

function decelerateAndShowResult(result) {
    const decelerateStart = Date.now()
    const decelerateDuration = 2500
    const startRadius = mhCurrentRadius

    function decelerate() {
        const elapsed = Date.now() - decelerateStart
        const progress = Math.min(elapsed / decelerateDuration, 1)
        const eased = 1 - (1 - progress) * (1 - progress)

        mhRotationSpeed = 25 * (1 - eased)
        mhCurrentRadius = startRadius + (mhBaseRadius - startRadius) * eased

        if (progress < 1) {
            requestAnimationFrame(decelerate)
        } else {
            mhRotationSpeed = 0
            mhCurrentRadius = mhBaseRadius
            flyOutSelectedHexagram(result)
        }
    }

    decelerate()
}

function flyOutSelectedHexagram(result) {
    if (!result.gua) {
        showAppToast('起卦失败，请重试')
        resetMeihuaState()
        return
    }

    const guaIndex = liushisiGua.findIndex(g => g.upper === result.gua.upper && g.lower === result.gua.lower)
    if (guaIndex === -1) {
        showAppToast('起卦失败，请重试')
        resetMeihuaState()
        return
    }

    const selectedItem = mhGuaItems[guaIndex]
    const rect = selectedItem.getBoundingClientRect()
    const viewCenterX = window.innerWidth / 2
    const viewCenterY = window.innerHeight / 2

    mhGuaItems.forEach((item, index) => {
        if (index !== guaIndex) {
            item.style.transition = 'opacity 0.5s'
            item.style.opacity = '0'
        }
    })

    const flyOut = document.createElement('div')
    flyOut.className = 'mh-flyout'
    flyOut.innerHTML = selectedItem.innerHTML
    flyOut.style.left = (rect.left + rect.width / 2) + 'px'
    flyOut.style.top = (rect.top + rect.height / 2) + 'px'
    flyOut.style.transform = 'translate(-50%, -50%) scale(1)'
    flyOut.style.fontSize = '0.7em'
    document.body.appendChild(flyOut)

    selectedItem.style.opacity = '0'
    stopMeihuaAnimation()

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            flyOut.style.left = viewCenterX + 'px'
            flyOut.style.top = viewCenterY + 'px'
            flyOut.style.transform = 'translate(-50%, -50%) scale(5)'
            flyOut.style.fontSize = '1em'
        })
    })

    setTimeout(() => {
        if (flyOut.parentNode) {
            document.body.removeChild(flyOut)
        }
        showMeihuaResult(result)
    }, 1000)
}

function showMeihuaResult(result) {
    const modal = document.getElementById('mhResultModal')
    const symbolDiv = document.getElementById('mhResultSymbol')
    const nameDiv = document.getElementById('mhResultName')
    const infoDiv = document.getElementById('mhResultInfo')

    if (!result.gua) {
        showAppToast('起卦失败，请重试')
        closeMeihuaResult()
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

function closeMeihuaResult() {
    document.getElementById('mhResultModal').style.display = 'none'
    resetMeihuaState()
}

function resetMeihuaState() {
    mhIsDivining = false
    mhRotationSpeed = 0.3
    mhCurrentRadius = mhBaseRadius

    const btn = document.getElementById('mhQiGuaBtn')
    if (btn) {
        btn.disabled = false
        btn.textContent = '☯ 起 卦 ☯'
    }

    mhGuaItems.forEach(item => {
        item.style.transition = 'opacity 0.5s'
        item.style.opacity = '1'
        setTimeout(() => {
            item.style.transition = ''
        }, 500)
    })

    if (!mhAnimationId) {
        startMeihuaAnimation()
    }
}

function showMeihuaDetail() {
    if (!mhCurrentGua) return

    window.fromMeihuaDetail = true
    document.getElementById('mhResultModal').style.display = 'none'
    stopMeihuaAnimation()
    showModule('chaxun')
    showGuaDetail(mhCurrentGua, true)
    toggleYaociChange(mhCurrentDongyao)
}

function addMeihuaToYice() {
    if (!mhCurrentGua) {
        showAppToast('请先起卦')
        return
    }

    document.getElementById('mhResultModal').style.display = 'none'
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    document.getElementById('mhYiceTime').value = `${year}-${month}-${day}T${hour}:${minute}`

    document.getElementById('mhYiceCategory').value = ''
    document.getElementById('mhYiceContent').value = ''
    document.getElementById('mhYicePerson').value = ''
    document.getElementById('mhYiceAnalysis').value = ''
    document.getElementById('mhYiceAccuracy').value = 70
    document.getElementById('mhYiceAccuracyVal').textContent = '70%'

    loadCategoriesToSelect('mhYiceCategory')
    appendInlineGuaDisplay('mhYiceGuaDisplay', mhCurrentGua, [mhCurrentDongyao])

    document.getElementById('mhInlineYice').style.display = 'block'
    document.getElementById('mhInlineYice').scrollIntoView({ behavior: 'smooth' })
}

async function saveMeihuaInlineYice() {
    await runYiceAction('saveMeihuaInlineYice', async () => {
        if (!mhCurrentGua) {
            showAppToast('请先起卦')
            return
        }

        const record = normalizeYiceRecord({
            id: Date.now().toString(),
            category: document.getElementById('mhYiceCategory').value,
            content: document.getElementById('mhYiceContent').value,
            person: document.getElementById('mhYicePerson').value,
            upper: mhCurrentGua.upper,
            lower: mhCurrentGua.lower,
            dongyao: [mhCurrentDongyao],
            analysis: document.getElementById('mhYiceAnalysis').value,
            createTime: document.getElementById('mhYiceTime').value,
            updateTime: new Date().toISOString(),
            accuracy: parseInt(document.getElementById('mhYiceAccuracy').value) || 70,
            replays: []
        })

        await queueYiceWrite(async () => {
            await loadYiceData()
            await insertYiceRecordToDB(record)
            ycRecords.unshift(record)
        })

        showAppToast('保存成功')
        cancelMeihuaInlineYice()
    })
}

function cancelMeihuaInlineYice() {
    document.getElementById('mhInlineYice').style.display = 'none'
    resetMeihuaState()
}
