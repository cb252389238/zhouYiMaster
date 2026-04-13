// ==================== 通用卦象工具 ====================
function createYaoElement(isYang, isOld = false) {
    const div = document.createElement('div')
    let className = 'yao-line'
    if (isYang) {
        className += isOld ? ' old yang' : ' normal yang'
    } else {
        className += isOld ? ' old' : ' normal'
    }
    div.className = className
    return div
}

function createGuaElement(upper, lower, changedIndices = []) {
    const container = document.createElement('div')
    container.className = 'gua-symbol-container'

    const upperYao = baguaYaoYinYang[upper]
    const lowerYao = baguaYaoYinYang[lower]
    if (!upperYao || !lowerYao) return container

    for (let i = 0; i <= 2; i++) {
        const isYang = lowerYao[i] === 1
        const yaoNum = i + 1
        const isOld = changedIndices.includes(yaoNum)
        container.appendChild(createYaoElement(isYang, isOld))
    }

    for (let i = 0; i <= 2; i++) {
        const isYang = upperYao[i] === 1
        const yaoNum = 4 + i
        const isOld = changedIndices.includes(yaoNum)
        container.appendChild(createYaoElement(isYang, isOld))
    }

    return container
}
