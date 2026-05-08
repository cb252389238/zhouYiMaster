// ==================== 六爻纳甲与干支历工具 ====================
const naJiaTianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const naJiaDiZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const naJiaWuxing = ['木', '火', '土', '金', '水']

const ganWuxing = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
}

const zhiWuxing = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

const baguaGongWuxing = {
    '乾': '金', '兑': '金', '离': '火', '震': '木',
    '巽': '木', '坎': '水', '艮': '土', '坤': '土'
}

const baguaNajia = {
    '乾': {
        inner: [['甲', '子'], ['甲', '寅'], ['甲', '辰']],
        outer: [['壬', '午'], ['壬', '申'], ['壬', '戌']]
    },
    '坤': {
        inner: [['乙', '未'], ['乙', '巳'], ['乙', '卯']],
        outer: [['癸', '丑'], ['癸', '亥'], ['癸', '酉']]
    },
    '震': {
        inner: [['庚', '子'], ['庚', '寅'], ['庚', '辰']],
        outer: [['庚', '午'], ['庚', '申'], ['庚', '戌']]
    },
    '巽': {
        inner: [['辛', '丑'], ['辛', '亥'], ['辛', '酉']],
        outer: [['辛', '未'], ['辛', '巳'], ['辛', '卯']]
    },
    '坎': {
        inner: [['戊', '寅'], ['戊', '辰'], ['戊', '午']],
        outer: [['戊', '申'], ['戊', '戌'], ['戊', '子']]
    },
    '离': {
        inner: [['己', '卯'], ['己', '丑'], ['己', '亥']],
        outer: [['己', '酉'], ['己', '未'], ['己', '巳']]
    },
    '艮': {
        inner: [['丙', '辰'], ['丙', '午'], ['丙', '申']],
        outer: [['丙', '戌'], ['丙', '子'], ['丙', '寅']]
    },
    '兑': {
        inner: [['丁', '巳'], ['丁', '卯'], ['丁', '丑']],
        outer: [['丁', '亥'], ['丁', '酉'], ['丁', '未']]
    }
}

const liushenStartByDayGan = {
    '甲': '青龙', '乙': '青龙',
    '丙': '朱雀', '丁': '朱雀',
    '戊': '勾陈',
    '己': '螣蛇',
    '庚': '白虎', '辛': '白虎',
    '壬': '玄武', '癸': '玄武'
}

const liushenOrder = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']

const guaGongMap = {
    '乾为天': ['乾', 6], '天风姤': ['乾', 1], '天山遁': ['乾', 2], '天地否': ['乾', 3],
    '风地观': ['乾', 4], '山地剥': ['乾', 5], '火地晋': ['乾', 4], '火天大有': ['乾', 3],
    '兑为泽': ['兑', 6], '泽水困': ['兑', 1], '泽地萃': ['兑', 2], '泽山咸': ['兑', 3],
    '水山蹇': ['兑', 4], '地山谦': ['兑', 5], '雷山小过': ['兑', 4], '雷泽归妹': ['兑', 3],
    '离为火': ['离', 6], '火山旅': ['离', 1], '火风鼎': ['离', 2], '火水未济': ['离', 3],
    '山水蒙': ['离', 4], '风水涣': ['离', 5], '天水讼': ['离', 4], '天火同人': ['离', 3],
    '震为雷': ['震', 6], '雷地豫': ['震', 1], '雷水解': ['震', 2], '雷风恒': ['震', 3],
    '地风升': ['震', 4], '水风井': ['震', 5], '泽风大过': ['震', 4], '泽雷随': ['震', 3],
    '巽为风': ['巽', 6], '风天小畜': ['巽', 1], '风火家人': ['巽', 2], '风雷益': ['巽', 3],
    '天雷无妄': ['巽', 4], '火雷噬嗑': ['巽', 5], '山雷颐': ['巽', 4], '山风蛊': ['巽', 3],
    '坎为水': ['坎', 6], '水泽节': ['坎', 1], '水雷屯': ['坎', 2], '水火既济': ['坎', 3],
    '泽火革': ['坎', 4], '雷火丰': ['坎', 5], '地火明夷': ['坎', 4], '地水师': ['坎', 3],
    '艮为山': ['艮', 6], '山火贲': ['艮', 1], '山天大畜': ['艮', 2], '山泽损': ['艮', 3],
    '火泽睽': ['艮', 4], '天泽履': ['艮', 5], '风泽中孚': ['艮', 4], '风山渐': ['艮', 3],
    '坤为地': ['坤', 6], '地雷复': ['坤', 1], '地泽临': ['坤', 2], '地天泰': ['坤', 3],
    '雷天大壮': ['坤', 4], '泽天夬': ['坤', 5], '水天需': ['坤', 4], '水地比': ['坤', 3]
}

const guaGongStageMap = {
    '乾为天': '本宫', '天风姤': '一世', '天山遁': '二世', '天地否': '三世',
    '风地观': '四世', '山地剥': '五世', '火地晋': '游魂', '火天大有': '归魂',
    '兑为泽': '本宫', '泽水困': '一世', '泽地萃': '二世', '泽山咸': '三世',
    '水山蹇': '四世', '地山谦': '五世', '雷山小过': '游魂', '雷泽归妹': '归魂',
    '离为火': '本宫', '火山旅': '一世', '火风鼎': '二世', '火水未济': '三世',
    '山水蒙': '四世', '风水涣': '五世', '天水讼': '游魂', '天火同人': '归魂',
    '震为雷': '本宫', '雷地豫': '一世', '雷水解': '二世', '雷风恒': '三世',
    '地风升': '四世', '水风井': '五世', '泽风大过': '游魂', '泽雷随': '归魂',
    '巽为风': '本宫', '风天小畜': '一世', '风火家人': '二世', '风雷益': '三世',
    '天雷无妄': '四世', '火雷噬嗑': '五世', '山雷颐': '游魂', '山风蛊': '归魂',
    '坎为水': '本宫', '水泽节': '一世', '水雷屯': '二世', '水火既济': '三世',
    '泽火革': '四世', '雷火丰': '五世', '地火明夷': '游魂', '地水师': '归魂',
    '艮为山': '本宫', '山火贲': '一世', '山天大畜': '二世', '山泽损': '三世',
    '火泽睽': '四世', '天泽履': '五世', '风泽中孚': '游魂', '风山渐': '归魂',
    '坤为地': '本宫', '地雷复': '一世', '地泽临': '二世', '地天泰': '三世',
    '雷天大壮': '四世', '泽天夬': '五世', '水天需': '游魂', '水地比': '归魂'
}

const jieqiMonthStart = [
    { name: '小寒', monthIndex: 12, constant: 5.4055 },
    { name: '立春', monthIndex: 1, constant: 3.87 },
    { name: '惊蛰', monthIndex: 2, constant: 5.63 },
    { name: '清明', monthIndex: 3, constant: 4.81 },
    { name: '立夏', monthIndex: 4, constant: 5.52 },
    { name: '芒种', monthIndex: 5, constant: 5.678 },
    { name: '小暑', monthIndex: 6, constant: 7.108 },
    { name: '立秋', monthIndex: 7, constant: 7.5 },
    { name: '白露', monthIndex: 8, constant: 7.646 },
    { name: '寒露', monthIndex: 9, constant: 8.318 },
    { name: '立冬', monthIndex: 10, constant: 7.438 },
    { name: '大雪', monthIndex: 11, constant: 7.18 }
]

function getApproxJieqiDate(year, month, constant) {
    const y = year % 100
    const day = Math.floor(y * 0.2422 + constant) - Math.floor((y - 1) / 4)
    return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function getGanzhiIndex(index) {
    const normalized = ((index % 60) + 60) % 60
    return `${naJiaTianGan[normalized % 10]}${naJiaDiZhi[normalized % 12]}`
}

function getGanzhiYear(date) {
    const year = date.getFullYear()
    const lichun = getApproxJieqiDate(year, 2, 3.87)
    const ganzhiYear = date >= lichun ? year : year - 1
    return getGanzhiIndex(ganzhiYear - 1984)
}

function getGanzhiMonth(date, yearGan) {
    const year = date.getFullYear()
    let currentMonthIndex = 12

    jieqiMonthStart.forEach(item => {
        const jieDate = getApproxJieqiDate(year, item.name === '小寒' ? 1 : item.monthIndex + 1, item.constant)
        if (date >= jieDate) {
            currentMonthIndex = item.monthIndex
        }
    })

    const lichun = getApproxJieqiDate(year, 2, 3.87)
    if (date < lichun) {
        const xiaohan = getApproxJieqiDate(year, 1, 5.4055)
        currentMonthIndex = date >= xiaohan ? 12 : 11
    }

    const yearGanIndex = naJiaTianGan.indexOf(yearGan)
    const yinMonthGanIndex = ((yearGanIndex % 5) * 2 + 2) % 10
    const ganIndex = (yinMonthGanIndex + currentMonthIndex - 1) % 10
    const zhiIndex = (currentMonthIndex + 1) % 12
    return `${naJiaTianGan[ganIndex]}${naJiaDiZhi[zhiIndex]}`
}

function getGanzhiDay(date) {
    const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    const days = Math.floor(utc / 86400000)
    return getGanzhiIndex(days + 40)
}

function getGanzhiHour(date, dayGan) {
    const hour = date.getHours()
    const zhiIndex = Math.floor((hour + 1) / 2) % 12
    const dayGanIndex = naJiaTianGan.indexOf(dayGan)
    const ziHourGanIndex = ((dayGanIndex % 5) * 2) % 10
    const ganIndex = (ziHourGanIndex + zhiIndex) % 10
    return `${naJiaTianGan[ganIndex]}${naJiaDiZhi[zhiIndex]}`
}

function getCurrentGanzhiTime(date = new Date()) {
    const year = getGanzhiYear(date)
    const month = getGanzhiMonth(date, year[0])
    const day = getGanzhiDay(date)
    const hour = getGanzhiHour(date, day[0])

    return { date, year, month, day, hour }
}

function getXunKong(ganzhi) {
    const ganIndex = naJiaTianGan.indexOf(ganzhi[0])
    const zhiIndex = naJiaDiZhi.indexOf(ganzhi[1])
    if (ganIndex < 0 || zhiIndex < 0) return ''

    const xunStartZhiIndex = ((zhiIndex - ganIndex) % 12 + 12) % 12
    const firstKongIndex = (xunStartZhiIndex + 10) % 12
    const secondKongIndex = (xunStartZhiIndex + 11) % 12
    return `${naJiaDiZhi[firstKongIndex]}${naJiaDiZhi[secondKongIndex]}`
}

function getRelationByWuxing(gongWuxing, yaoWuxing) {
    if (gongWuxing === yaoWuxing) return '兄弟'

    const gongIndex = naJiaWuxing.indexOf(gongWuxing)
    const yaoIndex = naJiaWuxing.indexOf(yaoWuxing)
    if ((gongIndex + 1) % 5 === yaoIndex) return '子孙'
    if ((yaoIndex + 1) % 5 === gongIndex) return '父母'
    if ((gongIndex + 2) % 5 === yaoIndex) return '妻财'
    return '官鬼'
}

function getGuaGongInfo(gua) {
    const config = guaGongMap[gua.name]
    if (!config) return {
        gong: gua.lower,
        element: baguaGongWuxing[gua.lower],
        shi: 6,
        ying: 3,
        stage: gua.upper === gua.lower ? '本宫' : '未定'
    }

    const shi = config[1]
    const ying = shi > 3 ? shi - 3 : shi + 3
    return {
        gong: config[0],
        element: baguaGongWuxing[config[0]],
        shi,
        ying,
        stage: guaGongStageMap[gua.name] || `${shi}世`
    }
}

function getLiushenByDayGan(dayGan) {
    const start = liushenStartByDayGan[dayGan] || '青龙'
    const startIndex = liushenOrder.indexOf(start)
    return Array.from({ length: 6 }, (_, index) => liushenOrder[(startIndex + index) % 6])
}

function getNajiaRows(gua, ganzhiTime = getCurrentGanzhiTime()) {
    const lowerNajia = baguaNajia[gua.lower]?.inner || []
    const upperNajia = baguaNajia[gua.upper]?.outer || []
    const allNajia = [...lowerNajia, ...upperNajia]
    const gongInfo = getGuaGongInfo(gua)
    const liushen = getLiushenByDayGan(ganzhiTime.day[0])
    const lowerYao = baguaYaoYinYang[gua.lower] || []
    const upperYao = baguaYaoYinYang[gua.upper] || []
    const allYao = [...lowerYao, ...upperYao]

    return allNajia.map(([gan, zhi], index) => {
        const yaoNum = index + 1
        const wuxing = zhiWuxing[zhi]
        return {
            yaoNum,
            isYang: allYao[index] === 1,
            liushen: liushen[index],
            shiYing: yaoNum === gongInfo.shi ? '世' : (yaoNum === gongInfo.ying ? '应' : ''),
            gan,
            zhi,
            wuxing,
            liuqin: getRelationByWuxing(gongInfo.element, wuxing)
        }
    })
}

function getWuxingStateByMonthBranch(monthBranch) {
    const monthWuxing = zhiWuxing[monthBranch]
    const monthIndex = naJiaWuxing.indexOf(monthWuxing)
    return {
        wang: monthWuxing,
        xiang: naJiaWuxing[(monthIndex + 4) % 5],
        xiu: naJiaWuxing[(monthIndex + 1) % 5],
        qiu: naJiaWuxing[(monthIndex + 3) % 5],
        si: naJiaWuxing[(monthIndex + 2) % 5]
    }
}

function formatCxCurrentTime(date) {
    return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    })
}

function createNajiaYaoLine(isYang, isOld = false) {
    const line = createYaoElement(isYang, isOld)
    return line
}

function createCxNajiaGuaElement(gua, changedIndices = []) {
    const ganzhiTime = getCurrentGanzhiTime()
    const rows = getNajiaRows(gua, ganzhiTime)
    const container = document.createElement('div')
    container.className = 'cx-najia-gua'

    const guaElement = createGuaElement(gua.upper, gua.lower, changedIndices)
    guaElement.classList.add('cx-najia-original-gua')

    const leftList = document.createElement('div')
    leftList.className = 'cx-najia-left-list'

    const rightList = document.createElement('div')
    rightList.className = 'cx-najia-right-list'

    rows.slice().reverse().forEach(row => {
        const isChanged = changedIndices.includes(row.yaoNum)
        const leftRow = document.createElement('div')
        leftRow.className = `cx-najia-side-row cx-najia-left-row${isChanged ? ' changed' : ''}`
        leftRow.innerHTML = `
            <span class="cx-najia-liushen">${row.liushen}</span>
            <span class="cx-najia-wuxing">${row.wuxing}</span>
            <strong class="cx-najia-shiying">${row.shiYing}</strong>
        `

        const rightRow = document.createElement('div')
        rightRow.className = `cx-najia-side-row cx-najia-right-row${isChanged ? ' changed' : ''}`
        rightRow.innerHTML = `
            <span class="cx-najia-ganzhi">${row.gan}${row.zhi}</span>
            <span class="cx-najia-liuqin">${row.liuqin}</span>
        `

        leftList.appendChild(leftRow)
        rightList.appendChild(rightRow)
    })

    container.append(leftList, guaElement, rightList)
    return container
}

function renderCxNajiaInfo(gua) {
    const timeEl = document.getElementById('cxGanzhiTime')
    const stateEl = document.getElementById('cxWuxingState')
    if (!timeEl || !stateEl) return

    const ganzhiTime = getCurrentGanzhiTime()
    const monthBranch = ganzhiTime.month[1]
    const state = getWuxingStateByMonthBranch(monthBranch)
    const gongInfo = getGuaGongInfo(gua)
    const xunKong = getXunKong(ganzhiTime.day)

    timeEl.innerHTML = `
        <div class="cx-ganzhi-now">当前时间：${formatCxCurrentTime(ganzhiTime.date)}</div>
        <div class="cx-ganzhi-pill-list">
            <span class="cx-ganzhi-pill-year">年柱：${ganzhiTime.year}</span>
            <span class="cx-ganzhi-pill-month">月柱：${ganzhiTime.month}</span>
            <span class="cx-ganzhi-pill-day">日柱：${ganzhiTime.day}</span>
            <span class="cx-ganzhi-pill-hour">时柱：${ganzhiTime.hour}</span>
            <span class="cx-ganzhi-pill-gong">${gongInfo.gong}宫${gongInfo.element}</span>
            <span class="cx-ganzhi-pill-stage">${gongInfo.stage}</span>
            <span class="cx-ganzhi-pill-xunkong">旬空：${xunKong}</span>
        </div>
    `

    stateEl.innerHTML = `
        <h3>五行旺衰</h3>
        <div class="cx-wuxing-state-grid">
            <span class="cx-wuxing-state-wang">旺：${state.wang}</span>
            <span class="cx-wuxing-state-xiang">相：${state.xiang}</span>
            <span class="cx-wuxing-state-xiu">休：${state.xiu}</span>
            <span class="cx-wuxing-state-qiu">囚：${state.qiu}</span>
            <span class="cx-wuxing-state-si">死：${state.si}</span>
        </div>
    `
}
