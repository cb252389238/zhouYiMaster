// 风水罗盘模块
let fsCompassHeading = 0
let fsCompassActive = false

const fsCompassDirections = [
    { label: '北', angle: 0 },
    { label: '东北', angle: 45 },
    { label: '东', angle: 90 },
    { label: '东南', angle: 135 },
    { label: '南', angle: 180 },
    { label: '西南', angle: 225 },
    { label: '西', angle: 270 },
    { label: '西北', angle: 315 }
]

const fsCompassBagua = [
    { label: '坎', symbol: '☵', angle: 0, element: 'water' },
    { label: '艮', symbol: '☶', angle: 45, element: 'earth' },
    { label: '震', symbol: '☳', angle: 90, element: 'wood' },
    { label: '巽', symbol: '☴', angle: 135, element: 'wood' },
    { label: '离', symbol: '☲', angle: 180, element: 'fire' },
    { label: '坤', symbol: '☷', angle: 225, element: 'earth' },
    { label: '兑', symbol: '☱', angle: 270, element: 'metal' },
    { label: '乾', symbol: '☰', angle: 315, element: 'metal' }
]

const fsCompassMountains = [
    { label: '子', element: 'water' }, { label: '癸', element: 'water' },
    { label: '丑', element: 'earth' }, { label: '艮', element: 'earth' },
    { label: '寅', element: 'wood' }, { label: '甲', element: 'wood' },
    { label: '卯', element: 'wood' }, { label: '乙', element: 'wood' },
    { label: '辰', element: 'earth' }, { label: '巽', element: 'wood' },
    { label: '巳', element: 'fire' }, { label: '丙', element: 'fire' },
    { label: '午', element: 'fire' }, { label: '丁', element: 'fire' },
    { label: '未', element: 'earth' }, { label: '坤', element: 'earth' },
    { label: '申', element: 'metal' }, { label: '庚', element: 'metal' },
    { label: '酉', element: 'metal' }, { label: '辛', element: 'metal' },
    { label: '戌', element: 'earth' }, { label: '乾', element: 'metal' },
    { label: '亥', element: 'water' }, { label: '壬', element: 'water' }
]

function initFengshuiCompass() {
    renderFengshuiCompassMarks()
    updateFengshuiCompass(0, false)
    setFengshuiCompassStatus('点击“开始使用罗盘”读取设备方向。')
}

async function startFengshuiCompass() {
    if (!window.DeviceOrientationEvent) {
        setFengshuiCompassStatus('当前设备不支持方向传感器，无法使用罗盘。')
        return
    }

    try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            const permission = await DeviceOrientationEvent.requestPermission()
            if (permission !== 'granted') {
                setFengshuiCompassStatus('未获得方向传感器权限。')
                return
            }
        }

        stopFengshuiCompass()
        window.addEventListener('deviceorientationabsolute', handleFengshuiCompassOrientation, true)
        window.addEventListener('deviceorientation', handleFengshuiCompassOrientation, true)
        fsCompassActive = true
        setFengshuiCompassStatus('罗盘已启动，请保持手机水平并缓慢转动。')
    } catch (error) {
        setFengshuiCompassStatus('启动罗盘失败，请检查浏览器或系统权限。')
    }
}

function stopFengshuiCompass() {
    window.removeEventListener('deviceorientationabsolute', handleFengshuiCompassOrientation, true)
    window.removeEventListener('deviceorientation', handleFengshuiCompassOrientation, true)
    fsCompassActive = false
}

function handleFengshuiCompassOrientation(event) {
    const rawHeading = getFengshuiCompassHeading(event)
    if (rawHeading === null) return

    const heading = smoothFengshuiCompassHeading(rawHeading)
    updateFengshuiCompass(heading, true)
}

function getFengshuiCompassHeading(event) {
    if (typeof event.webkitCompassHeading === 'number') {
        return normalizeFengshuiCompassAngle(event.webkitCompassHeading)
    }

    if (typeof event.alpha === 'number') {
        return normalizeFengshuiCompassAngle(360 - event.alpha)
    }

    return null
}

function smoothFengshuiCompassHeading(nextHeading) {
    const current = fsCompassHeading
    const diff = ((nextHeading - current + 540) % 360) - 180
    fsCompassHeading = normalizeFengshuiCompassAngle(current + diff * 0.18)
    return fsCompassHeading
}

function updateFengshuiCompass(heading, isActive) {
    const degree = Math.round(normalizeFengshuiCompassAngle(heading))
    const direction = getFengshuiCompassSector(fsCompassDirections, degree, 45)
    const bagua = getFengshuiCompassSector(fsCompassBagua, degree, 45)
    const mountain = getFengshuiCompassMountain(degree)
    const dial = document.getElementById('fsCompassDial')

    if (dial) {
        dial.style.setProperty('--fs-compass-rotate', `${-degree}deg`)
    }

    setText('fsCompassDegree', isActive ? `${degree}°` : '--°')
    setText('fsCompassDirection', isActive ? direction : '未启动')
    setText('fsCompassDetail', isActive ? `${bagua}卦 · ${mountain}山` : '点击下方按钮开始')
    setText('fsCurrentDirection', isActive ? direction : '--')
    setText('fsCurrentBagua', isActive ? bagua : '--')
    setText('fsCurrentMountain', isActive ? `${mountain}山` : '--')
}

function getFengshuiCompassSector(items, heading, sectorSize) {
    const index = Math.floor((heading + sectorSize / 2) / sectorSize) % items.length
    return items[index].label
}

function getFengshuiCompassMountain(heading) {
    const sectorSize = 360 / fsCompassMountains.length
    const index = Math.floor((heading + sectorSize / 2) / sectorSize) % fsCompassMountains.length
    return fsCompassMountains[index].label
}

function normalizeFengshuiCompassAngle(angle) {
    return ((angle % 360) + 360) % 360
}

function renderFengshuiCompassMarks() {
    renderFengshuiCompassTicks()
    renderFengshuiCompassRing('fsCompassDegrees', Array.from({ length: 36 }, (_, index) => ({
        label: `${index * 10}`,
        angle: index * 10
    })))
    renderFengshuiCompassRing('fsCompassMountains', fsCompassMountains.map((mountain, index) => ({
        ...mountain,
        angle: index * 15
    })))
    renderFengshuiCompassRing('fsCompassBagua', fsCompassBagua)
    renderFengshuiCompassRing('fsCompassDirections', fsCompassDirections)
}

function renderFengshuiCompassRing(elementId, items) {
    const ring = document.getElementById(elementId)
    if (!ring || ring.dataset.rendered === 'true') return

    ring.innerHTML = items.map(item => (
        `<span style="--mark-angle: ${item.angle}deg"><b class="${item.element ? `fs-element-${item.element}` : ''}">${item.symbol ? `${item.symbol}<em>${item.label}</em>` : item.label}</b></span>`
    )).join('')
    ring.dataset.rendered = 'true'
}

function renderFengshuiCompassTicks() {
    const ring = document.getElementById('fsCompassTicks')
    if (!ring || ring.dataset.rendered === 'true') return

    ring.innerHTML = Array.from({ length: 360 }, (_, index) => {
        const tickClass = index % 10 === 0 ? ' major' : index % 5 === 0 ? ' medium' : ''
        return `<i class="fs-tick${tickClass}" style="--tick-angle: ${index}deg"></i>`
    }).join('')
    ring.dataset.rendered = 'true'
}

function setFengshuiCompassStatus(message) {
    setText('fsCompassStatus', message)
}

function setText(elementId, text) {
    const element = document.getElementById(elementId)
    if (element) element.textContent = text
}
