// ==================== 黄道吉日模块 ====================
const huangdaoTypes = ['全部', '嫁娶', '祭祀', '动土', '开市', '开光', '祈福', '求嗣', '出行', '搬家', '安床', '拆卸', '修造', '按门', '挂牑', '纳彩', '扫舍']
const hdZodiacNames = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const hdJianStars = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭']
const hdValueStars = ['青龙', '明堂', '天刑', '朱雀', '金匮', '天德', '白虎', '玉堂', '天牢', '玄武', '司命', '勾陈']
const hdGoodValueStars = new Set(['青龙', '明堂', '金匮', '天德', '玉堂', '司命'])
const hdHourBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const hdHourRanges = ['23:00-00:59', '01:00-02:59', '03:00-04:59', '05:00-06:59', '07:00-08:59', '09:00-10:59', '11:00-12:59', '13:00-14:59', '15:00-16:59', '17:00-18:59', '19:00-20:59', '21:00-22:59']

const hdJianActivityMap = {
    '建': {
        yi: ['祭祀', '祈福', '求嗣', '出行', '纳彩', '开光'],
        ji: ['动土', '开市', '修造', '安床']
    },
    '除': {
        yi: ['祭祀', '扫舍', '拆卸', '修造', '开光'],
        ji: ['嫁娶', '开市', '搬家', '安床']
    },
    '满': {
        yi: ['祭祀', '祈福', '开市', '纳彩', '嫁娶'],
        ji: ['动土', '修造', '搬家', '拆卸']
    },
    '平': {
        yi: ['祭祀', '扫舍', '修造'],
        ji: ['嫁娶', '开市', '祈福', '求嗣']
    },
    '定': {
        yi: ['嫁娶', '纳彩', '安床', '祈福', '开市'],
        ji: ['出行', '搬家', '动土', '拆卸']
    },
    '执': {
        yi: ['祭祀', '祈福', '求嗣', '纳彩', '开光'],
        ji: ['搬家', '出行', '开市', '修造']
    },
    '破': {
        yi: ['拆卸', '扫舍'],
        ji: ['嫁娶', '祭祀', '祈福', '求嗣', '出行', '搬家', '安床', '开市', '动土', '修造', '纳彩']
    },
    '危': {
        yi: ['祭祀', '祈福', '安床', '开光'],
        ji: ['嫁娶', '出行', '搬家', '动土', '开市']
    },
    '成': {
        yi: ['嫁娶', '祭祀', '祈福', '求嗣', '出行', '搬家', '安床', '开市', '开光', '纳彩'],
        ji: ['拆卸', '扫舍']
    },
    '收': {
        yi: ['祭祀', '祈福', '纳彩', '扫舍'],
        ji: ['嫁娶', '开市', '动土', '出行', '搬家']
    },
    '开': {
        yi: ['嫁娶', '祭祀', '祈福', '求嗣', '出行', '搬家', '开市', '开光', '安床', '纳彩', '挂牑'],
        ji: ['动土', '修造', '拆卸']
    },
    '闭': {
        yi: ['祭祀', '扫舍', '修造'],
        ji: ['嫁娶', '祈福', '求嗣', '出行', '搬家', '开市', '开光', '纳彩']
    }
}

const hdGoodGodByBranch = {
    '子': ['天恩', '月德', '福生'],
    '丑': ['天德', '守日', '宝光'],
    '寅': ['天赦', '五合', '鸣吠'],
    '卯': ['母仓', '三合', '临日'],
    '辰': ['天喜', '金匮', '玉宇'],
    '巳': ['天德合', '驿马', '天后'],
    '午': ['月恩', '四相', '阳德'],
    '未': ['六合', '圣心', '青龙'],
    '申': ['司命', '益后', '除神'],
    '酉': ['明堂', '鸣吠', '天仓'],
    '戌': ['月德合', '不将', '要安'],
    '亥': ['玉堂', '生气', '时阳']
}

const hdBadGodByBranch = {
    '子': ['灾煞', '天火', '五虚'],
    '丑': ['月煞', '月虚', '血支'],
    '寅': ['劫煞', '小耗', '归忌'],
    '卯': ['大煞', '土府', '朱雀'],
    '辰': ['月害', '天刑', '四击'],
    '巳': ['重日', '阴错', '往亡'],
    '午': ['天牢', '地火', '大败'],
    '未': ['白虎', '天吏', '月厌'],
    '申': ['河魁', '死神', '天贼'],
    '酉': ['勾陈', '五离', '八专'],
    '戌': ['天狗', '九空', '土符'],
    '亥': ['玄武', '复日', '招摇']
}

const hdShaDirectionByBranch = {
    '子': '南', '丑': '东', '寅': '北', '卯': '西', '辰': '南', '巳': '东',
    '午': '北', '未': '西', '申': '南', '酉': '东', '戌': '北', '亥': '西'
}

const hdTainshenByDayGan = {
    '甲': '门碓外东南', '乙': '碓磨厕外东南', '丙': '厨灶炉外正南', '丁': '仓库门外正南',
    '戊': '房床厕外正南', '己': '占门床外正南', '庚': '碓磨栖外正西', '辛': '厨灶厕外西南',
    '壬': '仓库炉外西北', '癸': '房床门外西南'
}

let hdInitialized = false
let hdCurrentResults = []

function initHuangdao() {
    if (!hdInitialized) {
        initHuangdaoTypeSelect()
        resetHuangdaoForm()
        hdInitialized = true
    }
}

function initHuangdaoTypeSelect() {
    const select = document.getElementById('hdTypeSelect')
    if (!select) return

    select.innerHTML = ''
    huangdaoTypes.forEach(type => {
        const option = document.createElement('option')
        option.value = type
        option.textContent = type
        select.appendChild(option)
    })
}

function resetHuangdaoForm() {
    const today = new Date()
    const nextMonth = addDays(today, 30)
    setInputValue('hdStartDate', formatHuangdaoDateValue(today))
    setInputValue('hdEndDate', formatHuangdaoDateValue(nextMonth))
    setInputValue('hdTypeSelect', '嫁娶')
    setHuangdaoSuitType('yi')
    hdCurrentResults = []
    renderHuangdaoResults([])
    setHuangdaoSummary('请选择类型和宜忌后查询，默认展示未来 30 天范围。')
}

function setInputValue(id, value) {
    const input = document.getElementById(id)
    if (input) input.value = value
}

function searchHuangdaoDays() {
    const startValue = document.getElementById('hdStartDate')?.value || ''
    const endValue = document.getElementById('hdEndDate')?.value || ''
    const type = document.getElementById('hdTypeSelect')?.value || '全部'
    const suitType = getHuangdaoSuitType()

    if (!startValue || !endValue || !suitType) {
        showAppToast('请填写开始时间、结束时间，并选择宜忌')
        return
    }
    if (type === '全部') {
        showAppToast('请选择一个具体类型')
        return
    }

    const startDate = parseHuangdaoDate(startValue)
    const endDate = parseHuangdaoDate(endValue)
    if (!startDate || !endDate) {
        showAppToast('日期格式不正确')
        return
    }
    if (startDate > endDate) {
        showAppToast('开始时间不能晚于结束时间')
        return
    }

    const totalDays = getDateDiffDays(startDate, endDate) + 1
    if (totalDays > 366) {
        showAppToast('单次查询范围最多 366 天')
        return
    }

    const results = []
    for (let index = 0; index < totalDays; index++) {
        const date = addDays(startDate, index)
        const day = getHuangdaoDayInfo(date)
        if (matchesHuangdaoFilter(day, type, suitType)) {
            results.push(day)
        }
    }

    hdCurrentResults = results
    renderHuangdaoResults(results)
    setHuangdaoSummary(`共筛选 ${totalDays} 天，找到 ${results.length} 个${suitType === 'yi' ? '适合' : '不适合'}「${type}」的日子。`)
}

function matchesHuangdaoFilter(day, type, suitType) {
    const yiSet = new Set(day.yi)
    const jiSet = new Set(day.ji)
    const normalizedType = normalizeHuangdaoTerm(type)

    if (suitType === 'yi') {
        return yiSet.has(normalizedType) && !jiSet.has(normalizedType) && day.isAuspicious
    }

    return jiSet.has(normalizedType) || !yiSet.has(normalizedType) || !day.isAuspicious
}

function getHuangdaoSuitType() {
    return document.querySelector('input[name="hdSuitType"]:checked')?.value || ''
}

function setHuangdaoSuitType(value) {
    const input = document.querySelector(`input[name="hdSuitType"][value="${value}"]`)
    if (input) input.checked = true
}

function normalizeHuangdaoTerm(term) {
    if (term === '安门') return '按门'
    return term
}

function getHuangdaoDayInfo(date) {
    const ganzhi = getCurrentGanzhiTime(date)
    const dayBranch = ganzhi.day[1]
    const dayBranchIndex = naJiaDiZhi.indexOf(dayBranch)
    const monthBranchIndex = naJiaDiZhi.indexOf(ganzhi.month[1])
    const jianStar = hdJianStars[((dayBranchIndex - monthBranchIndex) % 12 + 12) % 12]
    const valueStar = hdValueStars[dayBranchIndex]
    const base = hdJianActivityMap[jianStar] || { yi: [], ji: [] }
    const yi = mergeUnique(base.yi, getExtraYiByValueStar(valueStar), getExtraYiByDayBranch(dayBranch))
    const ji = mergeUnique(base.ji, getExtraJiByValueStar(valueStar), getExtraJiByDayBranch(dayBranch))
    const conflictIndex = (dayBranchIndex + 6) % 12
    const conflictBranch = naJiaDiZhi[conflictIndex]
    const conflictZodiac = hdZodiacNames[conflictIndex]

    return {
        id: formatHuangdaoDateValue(date),
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        solar: formatHuangdaoSolarDate(date),
        lunar: formatHuangdaoLunarDate(date),
        ganzhi,
        yi,
        ji,
        chong: `冲${conflictZodiac}`,
        sha: `煞${hdShaDirectionByBranch[dayBranch] || ''}`,
        zhengchong: `${ganzhi.day}日冲${conflictBranch}${conflictZodiac}`,
        taishen: hdTainshenByDayGan[ganzhi.day[0]] || '占门外',
        valueStar,
        jianStar,
        goodGods: mergeUnique(hdGoodGodByBranch[dayBranch] || [], hdGoodValueStars.has(valueStar) ? [valueStar] : []),
        badGods: mergeUnique(hdBadGodByBranch[dayBranch] || [], hdGoodValueStars.has(valueStar) ? [] : [valueStar]),
        isAuspicious: hdGoodValueStars.has(valueStar) && !['破', '闭'].includes(jianStar)
    }
}

function getExtraYiByValueStar(valueStar) {
    if (hdGoodValueStars.has(valueStar)) return ['祭祀', '祈福', '求嗣']
    return []
}

function getExtraJiByValueStar(valueStar) {
    if (hdGoodValueStars.has(valueStar)) return []
    return ['嫁娶', '开市', '搬家']
}

function getExtraYiByDayBranch(dayBranch) {
    if (['寅', '午', '戌'].includes(dayBranch)) return ['出行', '开光']
    if (['申', '子', '辰'].includes(dayBranch)) return ['搬家', '安床']
    if (['亥', '卯', '未'].includes(dayBranch)) return ['嫁娶', '纳彩']
    return ['修造', '按门']
}

function getExtraJiByDayBranch(dayBranch) {
    if (['子', '午', '卯', '酉'].includes(dayBranch)) return ['动土']
    if (['辰', '戌', '丑', '未'].includes(dayBranch)) return ['出行']
    return ['扫舍']
}

function mergeUnique(...groups) {
    const result = []
    groups.flat().forEach(item => {
        if (item && !result.includes(item)) result.push(item)
    })
    return result
}

function renderHuangdaoResults(results) {
    const list = document.getElementById('hdResultList')
    if (!list) return

    list.innerHTML = ''
    if (!results.length) {
        const empty = document.createElement('div')
        empty.className = 'hd-empty'
        empty.textContent = '暂无符合条件的黄道吉日，请调整日期范围或宜忌事项。'
        list.appendChild(empty)
        return
    }

    results.forEach(day => {
        const card = document.createElement('article')
        card.className = 'hd-day-card'
        card.innerHTML = `
            <div class="hd-day-top">
                <div>
                    <div class="hd-solar">${escapeHuangdaoHtml(day.solar)}</div>
                    <div class="hd-lunar">${escapeHuangdaoHtml(day.lunar)}</div>
                </div>
                <button type="button" class="hd-hour-btn" onclick="openHuangdaoHourModal('${day.id}')">今日吉时</button>
            </div>
            <div class="hd-ganzhi-row">
                <span>年柱：${escapeHuangdaoHtml(day.ganzhi.year)}</span>
                <span>月柱：${escapeHuangdaoHtml(day.ganzhi.month)}</span>
                <span>日柱：${escapeHuangdaoHtml(day.ganzhi.day)}</span>
            </div>
            ${renderHuangdaoField('宜', day.yi.join('、'), 'good')}
            ${renderHuangdaoField('忌', day.ji.join('、'), 'bad')}
            <div class="hd-meta-grid">
                <span><strong>冲：</strong>${escapeHuangdaoHtml(day.chong)}</span>
                <span><strong>煞：</strong>${escapeHuangdaoHtml(day.sha)}</span>
                <span><strong>正冲：</strong>${escapeHuangdaoHtml(day.zhengchong)}</span>
                <span><strong>胎神：</strong>${escapeHuangdaoHtml(day.taishen)}</span>
                <span><strong>值星：</strong>${escapeHuangdaoHtml(day.valueStar)}（${escapeHuangdaoHtml(day.jianStar)}日）</span>
            </div>
            ${renderHuangdaoField('吉神宜趋', day.goodGods.join('、'), 'good')}
            ${renderHuangdaoField('凶神宜忌', day.badGods.join('、'), 'bad')}
        `
        list.appendChild(card)
    })
}

function renderHuangdaoField(label, text, type) {
    return `
        <div class="hd-text-row ${type}">
            <strong>${label}：</strong>
            <span>${escapeHuangdaoHtml(text || '无')}</span>
        </div>
    `
}

function setHuangdaoSummary(text) {
    const summary = document.getElementById('hdResultSummary')
    if (summary) summary.textContent = text
}

function openHuangdaoHourModal(dayId) {
    const day = hdCurrentResults.find(item => item.id === dayId) || getHuangdaoDayInfo(parseHuangdaoDate(dayId))
    if (!day) return

    const modal = document.getElementById('hdHourModal')
    const title = document.getElementById('hdHourTitle')
    const subtitle = document.getElementById('hdHourSubtitle')
    const list = document.getElementById('hdHourList')
    if (!modal || !title || !subtitle || !list) return

    title.textContent = '今日吉时'
    subtitle.textContent = `${day.solar} ${day.lunar}，日柱 ${day.ganzhi.day}`
    list.innerHTML = ''

    const hours = getHuangdaoLuckyHours(day)
    if (!hours.length) {
        const empty = document.createElement('div')
        empty.className = 'hd-empty'
        empty.textContent = '本地规则未筛出明确吉时。'
        list.appendChild(empty)
    } else {
        hours.forEach(hour => {
            const item = document.createElement('div')
            item.className = 'hd-hour-item'
            item.innerHTML = `
                <div class="hd-hour-name">
                    <strong>${escapeHuangdaoHtml(hour.branch)}时</strong>
                    <span>${escapeHuangdaoHtml(hour.range)}｜${escapeHuangdaoHtml(hour.ganzhi)}</span>
                </div>
                <div class="hd-hour-detail good"><strong>宜：</strong>${escapeHuangdaoHtml(hour.yi.join('、'))}</div>
                <div class="hd-hour-detail bad"><strong>忌：</strong>${escapeHuangdaoHtml(hour.ji.join('、'))}</div>
            `
            list.appendChild(item)
        })
    }

    modal.classList.add('active')
    modal.setAttribute('aria-hidden', 'false')
}

function closeHuangdaoHourModal() {
    const modal = document.getElementById('hdHourModal')
    if (!modal) return
    modal.classList.remove('active')
    modal.setAttribute('aria-hidden', 'true')
}

function handleHuangdaoHourBackdrop(event) {
    if (event.target && event.target.id === 'hdHourModal') {
        closeHuangdaoHourModal()
    }
}

function getHuangdaoLuckyHours(day) {
    const dayGan = day.ganzhi.day[0]
    const dayGanIndex = naJiaTianGan.indexOf(dayGan)
    const ziHourGanIndex = ((dayGanIndex % 5) * 2) % 10
    const dayBranchIndex = naJiaDiZhi.indexOf(day.ganzhi.day[1])

    return hdHourBranches.map((branch, index) => {
        const valueStar = hdValueStars[(index + dayBranchIndex) % 12]
        const gan = naJiaTianGan[(ziHourGanIndex + index) % 10]
        const isLucky = hdGoodValueStars.has(valueStar)
        return {
            branch,
            range: hdHourRanges[index],
            ganzhi: `${gan}${branch}`,
            valueStar,
            isLucky,
            yi: mergeUnique(day.yi.slice(0, 5), isLucky ? ['会友', '谋事'] : []),
            ji: mergeUnique(day.ji.slice(0, 4), branch === naJiaDiZhi[(dayBranchIndex + 6) % 12] ? ['冲日'] : [])
        }
    }).filter(hour => hour.isLucky)
}

function formatHuangdaoDateValue(date) {
    const pad = value => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseHuangdaoDate(value) {
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return null
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    if (Number.isNaN(date.getTime())) return null
    return date
}

function addDays(date, days) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    next.setDate(next.getDate() + days)
    return next
}

function getDateDiffDays(startDate, endDate) {
    const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const end = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    return Math.round((end - start) / 86400000)
}

function formatHuangdaoSolarDate(date) {
    return formatHuangdaoDateValue(date)
}

function formatHuangdaoLunarDate(date) {
    try {
        const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).formatToParts(date)
        const year = parts.find(part => part.type === 'relatedYear')?.value || String(date.getFullYear())
        const month = parts.find(part => part.type === 'month')?.value || ''
        const day = parts.find(part => part.type === 'day')?.value || ''
        return `${formatHuangdaoChineseYear(year)}年${month}${formatHuangdaoChineseLunarDay(day)}`
    } catch (error) {
        return '农历日期暂不可用'
    }
}

function formatHuangdaoChineseYear(year) {
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    return String(year).split('').map(char => digits[Number(char)] || char).join('')
}

function formatHuangdaoChineseLunarDay(day) {
    const value = Number(day)
    if (!Number.isFinite(value) || value < 1 || value > 30) return String(day)
    const names = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
    return names[value - 1]
}

function escapeHuangdaoHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}
