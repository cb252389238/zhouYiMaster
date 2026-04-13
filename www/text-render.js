// ==================== 文本渲染公共层 ====================
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function isChineseChar(char) {
    return /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(char)
}

function formatTextWithPinyin(text) {
    if (!text) return ''

    return Array.from(text).map(char => {
        if (!isChineseChar(char)) {
            return escapeHtml(char)
        }

        const pinyin = (typeof pinyinMap !== 'undefined' && pinyinMap[char]) ? pinyinMap[char] : ''
        if (!pinyin) {
            return `<span class="plain-char">${escapeHtml(char)}</span>`
        }

        return `<ruby class="pinyin-ruby"><rb>${escapeHtml(char)}</rb><rt>${escapeHtml(pinyin)}</rt></ruby>`
    }).join('')
}

function renderClickableCharacter(char, options = {}) {
    const { source = '', large = false } = options

    if (!isChineseChar(char)) {
        return escapeHtml(char)
    }

    const pinyin = (typeof pinyinMap !== 'undefined' && pinyinMap[char]) ? pinyinMap[char] : ''
    const sizeClass = large ? ' cx-char-btn-large' : ''
    const sourceAttr = escapeHtml(source)
    const charAttr = escapeHtml(char)

    if (!pinyin) {
        return `<button type="button" class="cx-char-btn${sizeClass}" data-char="${charAttr}" data-source="${sourceAttr}" aria-label="查看汉字${charAttr}的字源解释"><span class="cx-char-glyph">${charAttr}</span></button>`
    }

    return `<button type="button" class="cx-char-btn${sizeClass}" data-char="${charAttr}" data-source="${sourceAttr}" aria-label="查看汉字${charAttr}的字源解释"><ruby class="pinyin-ruby cx-char-ruby"><rb>${charAttr}</rb><rt>${escapeHtml(pinyin)}</rt></ruby></button>`
}

function formatClickableText(text, options = {}) {
    if (!text) return ''
    return Array.from(text).map(char => renderClickableCharacter(char, options)).join('')
}
