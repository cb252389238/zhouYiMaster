// ==================== 易策界面层 ====================
function initYice() {
    return (async () => {
        await initYiceDB()
        await loadYiceData()
        loadCategoriesToSelect('ycAddCategory')
        await renderYiceList()
        setupYiceScrollListener()
    })()
}

function getGuaSymbolHtml(upper, lower, size = 35, dongyao = []) {
    const upperYao = baguaYaoYinYang[upper]
    const lowerYao = baguaYaoYinYang[lower]
    if (!upperYao || !lowerYao) return ''

    const lineHeight = 11
    const totalHeight = lineHeight * 6
    const startY = lineHeight * 0.5

    let svgHtml = `<svg class="gua-symbol-svg" viewBox="0 0 ${size} ${totalHeight}" width="${size}" height="${totalHeight}">`

    for (let i = 0; i <= 2; i++) {
        const isYang = lowerYao[i] === 1
        const yaoNum = i + 1
        const isDong = dongyao.includes(yaoNum)
        const strokeColor = isDong ? '#e74c3c' : '#333'
        const y = startY + (5 - i) * lineHeight
        if (isYang) {
            svgHtml += `<line x1="2" y1="${y}" x2="${size - 2}" y2="${y}" stroke="${strokeColor}" stroke-width="2"/>`
        } else {
            svgHtml += `<line x1="2" y1="${y}" x2="${size * 0.35}" y2="${y}" stroke="${strokeColor}" stroke-width="2"/><line x1="${size * 0.65}" y1="${y}" x2="${size - 2}" y2="${y}" stroke="${strokeColor}" stroke-width="2"/>`
        }
    }

    for (let i = 0; i <= 2; i++) {
        const isYang = upperYao[i] === 1
        const yaoNum = 4 + i
        const isDong = dongyao.includes(yaoNum)
        const strokeColor = isDong ? '#e74c3c' : '#333'
        const y = startY + (2 - i) * lineHeight
        if (isYang) {
            svgHtml += `<line x1="2" y1="${y}" x2="${size - 2}" y2="${y}" stroke="${strokeColor}" stroke-width="2"/>`
        } else {
            svgHtml += `<line x1="2" y1="${y}" x2="${size * 0.35}" y2="${y}" stroke="${strokeColor}" stroke-width="2"/><line x1="${size * 0.65}" y1="${y}" x2="${size - 2}" y2="${y}" stroke="${strokeColor}" stroke-width="2"/>`
        }
    }

    svgHtml += '</svg>'
    return svgHtml
}

function createYiceRecordCard(record) {
    const card = document.createElement('div')
    card.className = 'yc-record-card'
    card.onclick = () => showYiceDetailById(record.id)
    card.oncontextmenu = event => {
        event.preventDefault()
        confirmDeleteYice(record.id)
    }
    card.ontouchstart = event => startLongPress(record.id, event)
    card.ontouchend = () => endLongPress()
    card.ontouchmove = () => cancelLongPress()

    const guaName = getGuaNameBy上下(record.upper, record.lower)
    const time = new Date(record.createTime).toLocaleDateString('zh-CN')
    const accuracy = record.accuracy ?? 70
    const accuracyClass = accuracy <= 30 ? 'low' : (accuracy <= 60 ? 'medium' : (accuracy <= 80 ? 'good' : 'high'))
    const accuracyColor = accuracy <= 30 ? '#e74c3c' : (accuracy <= 60 ? '#f39c12' : (accuracy <= 80 ? '#3498db' : '#27ae60'))

    const topRow = document.createElement('div')
    topRow.style.display = 'flex'
    topRow.style.alignItems = 'center'
    topRow.style.marginBottom = '8px'

    const symbolWrapper = document.createElement('div')
    symbolWrapper.innerHTML = getGuaSymbolHtml(record.upper, record.lower, 36, record.dongyao || [])
    topRow.appendChild(symbolWrapper)

    const nameSpan = document.createElement('span')
    nameSpan.style.fontSize = '1.2em'
    nameSpan.style.fontWeight = 'bold'
    nameSpan.style.marginLeft = '10px'
    nameSpan.textContent = guaName
    topRow.appendChild(nameSpan)

    const accuracySpan = document.createElement('span')
    accuracySpan.className = 'accuracy-badge ' + accuracyClass
    accuracySpan.style.marginLeft = 'auto'
    accuracySpan.style.color = accuracyColor
    accuracySpan.textContent = accuracy + '%'
    topRow.appendChild(accuracySpan)

    const header = document.createElement('div')
    header.className = 'yc-record-header'

    const timeSpan = document.createElement('span')
    timeSpan.className = 'yc-record-time'
    timeSpan.textContent = time
    header.appendChild(timeSpan)

    const categorySpan = document.createElement('span')
    categorySpan.className = 'yc-record-category'
    categorySpan.textContent = record.category || '未分类'
    header.appendChild(categorySpan)

    const contentDiv = document.createElement('div')
    contentDiv.className = 'yc-record-content'
    contentDiv.textContent = record.content || '无测算内容'

    const tip = document.createElement('div')
    tip.style.color = '#999'
    tip.style.fontSize = '11px'
    tip.style.marginTop = '4px'
    tip.textContent = '长按删除'

    card.append(topRow, header, contentDiv, tip)
    return card
}

async function renderYiceList(isLoadMore = false) {
    let records = [...ycRecords]
    const searchKeyword = document.getElementById('ycSearchInput')?.value || ''
    const searchCategory = document.getElementById('ycSearchCategory')?.value || ''
    const startDate = document.getElementById('ycSearchStartDate')?.value || ''
    const endDate = document.getElementById('ycSearchEndDate')?.value || ''

    if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase()
        records = records.filter(r => {
            const guaName = getGuaNameBy上下(r.upper, r.lower)
            return (r.category && r.category.toLowerCase().includes(keyword)) ||
                (r.content && r.content.toLowerCase().includes(keyword)) ||
                (r.person && r.person.toLowerCase().includes(keyword)) ||
                (guaName && guaName.toLowerCase().includes(keyword))
        })
    }

    if (searchCategory) {
        records = records.filter(r => r.category === searchCategory)
    }

    if (startDate || endDate) {
        records = records.filter(r => {
            const recordDate = new Date(r.createTime)
            if (startDate && recordDate < new Date(startDate)) return false
            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59)
                if (recordDate > end) return false
            }
            return true
        })
    }

    records.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    ycFilteredRecords = records
    if (!isLoadMore) ycCurrentPage = 1

    const displayRecords = records.slice(0, ycCurrentPage * ycPageSize)
    const listArea = document.getElementById('ycListArea')
    listArea.innerHTML = ''

    if (displayRecords.length === 0) {
        const empty = document.createElement('div')
        empty.style.textAlign = 'center'
        empty.style.padding = '40px'
        empty.style.color = '#666'
        empty.textContent = '暂无占卜记录，点击下方按钮添加'
        listArea.appendChild(empty)
    } else {
        const fragment = document.createDocumentFragment()
        displayRecords.forEach(record => fragment.appendChild(createYiceRecordCard(record)))
        listArea.appendChild(fragment)
    }

    let loadMoreTip = document.getElementById('ycLoadMoreTip')
    if (!loadMoreTip) {
        loadMoreTip = document.createElement('div')
        loadMoreTip.id = 'ycLoadMoreTip'
        loadMoreTip.style.cssText = 'text-align: center; padding: 20px; color: #999;'
        listArea.parentNode.appendChild(loadMoreTip)
    }

    const hasMore = records.length > ycCurrentPage * ycPageSize
    loadMoreTip.textContent = hasMore
        ? '上滑加载更多...'
        : (records.length > 0 ? '已加载全部 ' + records.length + ' 条记录' : '')
}

let longPressTimer = null
let longPressTarget = null

function startLongPress(recordId, event) {
    longPressTarget = recordId
    longPressTimer = setTimeout(() => {
        confirmDeleteYice(recordId)
        longPressTimer = null
        longPressTarget = null
    }, 500)
}

function cancelLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
    }
}

function endLongPress() {
    cancelLongPress()
}

function confirmDeleteYice(recordId) {
    showAppConfirm('确定要删除这条记录吗？', function() {
        deleteYiceRecord(recordId)
    })
}

async function deleteYiceRecord(recordId) {
    await runYiceAction('deleteYiceRecord_' + recordId, async () => {
        await queueYiceWrite(async () => {
            await loadYiceData()
            ycRecords = ycRecords.filter(r => r.id !== recordId)
            await deleteYiceRecordFromDB(recordId)
        })
        await renderYiceList()
        showAppToast('删除成功')
    })
}

function getGuaNameBy上下(upper, lower) {
    const gua = liushisiGua.find(g => g.upper === upper && g.lower === lower)
    return gua ? gua.name : upper + lower
}

function searchYice() {
    renderYiceList()
}

function clearYiceSearch() {
    document.getElementById('ycSearchInput').value = ''
    const searchCat = document.getElementById('ycSearchCategory')
    if (searchCat) searchCat.value = ''
    const startDate = document.getElementById('ycSearchStartDate')
    const endDate = document.getElementById('ycSearchEndDate')
    if (startDate) startDate.value = ''
    if (endDate) endDate.value = ''
    ycSearchKeyword = ''
    renderYiceList()
}

function toggleYcActions() {
    const menu = document.getElementById('ycActionMenu')
    const btn = document.getElementById('ycFloatingBtn')
    if (menu.style.display === 'none') {
        menu.style.display = 'block'
        btn.style.transform = 'rotate(45deg)'
    } else {
        menu.style.display = 'none'
        btn.style.transform = 'rotate(0)'
    }
}

function showAddYice(keepData = false) {
    document.getElementById('ycActionMenu').style.display = 'none'
    document.getElementById('ycFloatingBtn').style.transform = 'rotate(0)'

    if (!keepData) {
        document.getElementById('ycAddCategory').value = ''
        document.getElementById('ycAddContent').value = ''
        document.getElementById('ycAddPerson').value = ''
        document.getElementById('ycAddAnalysis').value = ''
        document.getElementById('ycSelectedGuaText').style.display = 'block'
        document.getElementById('ycSelectedGuaDisplay').style.display = 'none'
        document.getElementById('ycDongyaoSelect').style.display = 'none'
        ycSelectedUpper = null
        ycSelectedLower = null
        ycSelectedDongyao = []
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    document.getElementById('ycAddCreateTime').value = `${year}-${month}-${day}T${hour}:${minute}`

    loadCategoriesToSelect('ycAddCategory')

    const backBtn = document.getElementById('yiceAddBackBtn')
    backBtn.textContent = '← 返回列表'
    backBtn.onclick = showYiceList

    document.getElementById('liuyaoModule').classList.remove('active')
    document.getElementById('yiceModule').classList.remove('active')
    document.getElementById('yiceAddModule').classList.add('active')
}

function resetSelectOptions(select, placeholder) {
    select.innerHTML = ''
    const option = document.createElement('option')
    option.value = ''
    option.textContent = placeholder
    select.appendChild(option)
}

function appendCategoryOptions(select, categories) {
    const fragment = document.createDocumentFragment()
    categories.forEach(cat => {
        const option = document.createElement('option')
        option.value = cat
        option.textContent = cat
        fragment.appendChild(option)
    })
    select.appendChild(fragment)
}

function loadCategoriesToSelect(selectId) {
    const select = document.getElementById(selectId)
    if (!select) return

    resetSelectOptions(select, '请选择分类')
    appendCategoryOptions(select, ycCategories)

    const searchSelect = document.getElementById('ycSearchCategory')
    if (searchSelect && searchSelect !== select) {
        resetSelectOptions(searchSelect, '全部分类')
        appendCategoryOptions(searchSelect, ycCategories)
    }
}

function appendGuaDisplay(container, guaName, guaElement, nameSize, symbolSize) {
    container.innerHTML = ''
    const nameDiv = document.createElement('div')
    nameDiv.style.fontSize = nameSize
    nameDiv.style.marginBottom = '10px'
    nameDiv.textContent = guaName

    const symbolDiv = document.createElement('div')
    symbolDiv.style.fontSize = symbolSize
    symbolDiv.appendChild(guaElement)

    container.append(nameDiv, symbolDiv)
}

function showGuaSelectModal() {
    document.getElementById('ycGuaModal').style.display = 'block'
    renderBaguaSelectForYice('ycUpperBagua', 'upper')
    renderBaguaSelectForYice('ycLowerBagua', 'lower')
}

function renderBaguaSelectForYice(containerId, position) {
    const container = document.getElementById(containerId)
    container.innerHTML = ''
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
        btn.onclick = () => selectBaguaForYice(key, position)
        container.appendChild(btn)
    })
}

function selectBaguaForYice(baguaName, position) {
    if (position === 'upper') {
        ycSelectedUpper = baguaName
        document.querySelectorAll('#ycUpperBagua .bagua-btn').forEach(btn => btn.classList.remove('selected'))
        event.currentTarget.classList.add('selected')
    } else {
        ycSelectedLower = baguaName
        document.querySelectorAll('#ycLowerBagua .bagua-btn').forEach(btn => btn.classList.remove('selected'))
        event.currentTarget.classList.add('selected')
    }

    if (ycSelectedUpper && ycSelectedLower) {
        const result = document.getElementById('ycGuaResult')
        const guaName = getGuaNameBy上下(ycSelectedUpper, ycSelectedLower)
        appendGuaDisplay(result, guaName, createGuaElement(ycSelectedUpper, ycSelectedLower, []), '4em', '4em')
        document.getElementById('ycConfirmGuaBtn').style.display = 'inline-block'
    }
}

function confirmGuaSelection() {
    document.getElementById('ycSelectedGuaText').style.display = 'none'
    const display = document.getElementById('ycSelectedGuaDisplay')
    display.style.display = 'block'
    appendGuaDisplay(display, getGuaNameBy上下(ycSelectedUpper, ycSelectedLower), createGuaElement(ycSelectedUpper, ycSelectedLower, []), '2em', '5em')
    document.getElementById('ycDongyaoSelect').style.display = 'block'
    renderDongyaoButtons('ycDongyaoButtons', 'ycAdd')
    closeGuaModal()
}

function renderDongyaoButtons(containerId, prefix) {
    const container = document.getElementById(containerId)
    container.innerHTML = ''

    for (let i = 1; i <= 6; i++) {
        const btn = document.createElement('button')
        btn.className = 'option-btn'
        btn.textContent = '第' + i + '爻'
        btn.onclick = () => toggleDongyao(i, prefix)
        const dongyaoArray = prefix === 'ycAdd' ? ycSelectedDongyao : ycEditDongyao
        if (dongyaoArray.includes(i)) btn.classList.add('selected')
        container.appendChild(btn)
    }
}

function toggleDongyao(yaoNum, prefix) {
    const target = prefix === 'ycAdd' ? ycSelectedDongyao : ycEditDongyao
    const index = target.indexOf(yaoNum)
    if (index > -1) {
        target.splice(index, 1)
    } else {
        target.push(yaoNum)
    }
    renderDongyaoButtons(prefix === 'ycAdd' ? 'ycDongyaoButtons' : 'ycEditDongyaoButtons', prefix)
    updateGuaDisplayWithDongyao(prefix)
}

function updateGuaDisplayWithDongyao(prefix) {
    const upper = prefix === 'ycAdd' ? ycSelectedUpper : ycEditUpper
    const lower = prefix === 'ycAdd' ? ycSelectedLower : ycEditLower
    const dongyaoArray = prefix === 'ycAdd' ? ycSelectedDongyao : ycEditDongyao
    if (!upper || !lower) return

    const display = document.getElementById(prefix === 'ycAdd' ? 'ycSelectedGuaDisplay' : 'ycEditGuaDisplay')
    appendGuaDisplay(display, getGuaNameBy上下(upper, lower), createGuaElement(upper, lower, dongyaoArray), '2em', '5em')
}

function closeGuaModal() {
    document.getElementById('ycGuaModal').style.display = 'none'
    document.getElementById('ycGuaResult').innerHTML = ''
    document.getElementById('ycConfirmGuaBtn').style.display = 'none'
}

function getAccuracyValue(inputId) {
    const accuracy = parseInt(document.getElementById(inputId).value, 10)
    return Number.isNaN(accuracy) ? 70 : accuracy
}

async function saveYiceRecord() {
    await runYiceAction('saveYiceRecord', async () => {
        if (!ycSelectedUpper || !ycSelectedLower) {
            showAppToast('请选择卦象')
            return
        }

        const record = normalizeYiceRecord({
            id: Date.now().toString(),
            category: document.getElementById('ycAddCategory').value,
            content: document.getElementById('ycAddContent').value,
            person: document.getElementById('ycAddPerson').value,
            upper: ycSelectedUpper,
            lower: ycSelectedLower,
            dongyao: [...ycSelectedDongyao],
            analysis: document.getElementById('ycAddAnalysis').value,
            createTime: document.getElementById('ycAddCreateTime').value,
            updateTime: new Date().toISOString(),
            accuracy: getAccuracyValue('ycAddAccuracy'),
            replays: []
        })

        await queueYiceWrite(async () => {
            await loadYiceData()
            await insertYiceRecordToDB(record)
            ycRecords.unshift(record)
        })

        showAppToast('保存成功')
        showYiceList()
    })
}

function toggleYiceSearch() {
    const content = document.getElementById('yiceSearchContent')
    const toggle = document.getElementById('yiceSearchToggle')
    if (!content) return

    const expanded = content.classList.contains('yice-search-collapsed')
    content.classList.toggle('yice-search-collapsed', !expanded)
    content.classList.toggle('yice-search-expanded', expanded)
    toggle.textContent = expanded ? '▼' : '▶'
}

function showYiceList() {
    document.getElementById('yiceAddModule').classList.remove('active')
    document.getElementById('yiceCategoryModule').classList.remove('active')
    document.getElementById('yiceDetailModule').classList.remove('active')
    document.getElementById('yiceEditModule').classList.remove('active')
    document.getElementById('yiceModule').classList.add('active')
    const details = document.getElementById('yiceSearchDetails')
    if (details) details.removeAttribute('open')
    renderYiceList()
}

function createCategoryItem(cat, index) {
    const item = document.createElement('div')
    item.className = 'yc-category-item'

    const nameSpan = document.createElement('span')
    nameSpan.className = 'yc-category-name'
    nameSpan.textContent = cat

    const actions = document.createElement('div')
    actions.className = 'yc-category-actions'

    const editButton = document.createElement('button')
    editButton.className = 'yc-category-btn edit'
    editButton.textContent = '编辑'
    editButton.onclick = () => editCategory(index)

    const deleteButton = document.createElement('button')
    deleteButton.className = 'yc-category-btn delete'
    deleteButton.textContent = '删除'
    deleteButton.onclick = () => deleteCategory(index)

    actions.append(editButton, deleteButton)
    item.append(nameSpan, actions)
    return item
}

function showCategoryManage() {
    document.getElementById('ycActionMenu').style.display = 'none'
    document.getElementById('ycFloatingBtn').style.transform = 'rotate(0)'
    renderCategoryList()
    document.getElementById('yiceModule').classList.remove('active')
    document.getElementById('yiceCategoryModule').classList.add('active')
}

function renderCategoryList() {
    const list = document.getElementById('ycCategoryList')
    list.innerHTML = ''
    if (ycCategories.length === 0) {
        const empty = document.createElement('div')
        empty.style.textAlign = 'center'
        empty.style.padding = '20px'
        empty.style.color = '#666'
        empty.textContent = '暂无分类'
        list.appendChild(empty)
        return
    }

    const fragment = document.createDocumentFragment()
    ycCategories.forEach((cat, index) => fragment.appendChild(createCategoryItem(cat, index)))
    list.appendChild(fragment)
}

async function addCategory() {
    await runYiceAction('addCategory', async () => {
        const name = normalizeYiceText(document.getElementById('ycNewCategory').value)
        if (!name) {
            showAppToast('请输入分类名称')
            return
        }

        await queueYiceWrite(async () => {
            await loadYiceData()
            if (ycCategories.includes(name)) {
                showAppToast('分类已存在')
                return
            }
            ycCategories.push(name)
            await saveYiceCategoriesToDB()
        })

        document.getElementById('ycNewCategory').value = ''
        renderCategoryList()
    })
}

function editCategory(index) {
    showAppPrompt('请输入新的分类名称', ycCategories[index], async function(newName) {
        if (newName && newName.trim() && newName !== ycCategories[index]) {
            await loadYiceData()
            ycCategories[index] = newName.trim()
            await saveYiceCategoriesToDB()
            renderCategoryList()
        }
    })
}

function deleteCategory(index) {
    showAppConfirm('确定要删除分类 "' + ycCategories[index] + '" 吗？', async function() {
        await loadYiceData()
        ycCategories.splice(index, 1)
        await saveYiceCategoriesToDB()
        renderCategoryList()
    })
}

async function showYiceDetailById(id) {
    await loadYiceData()
    ycCurrentRecord = ycRecords.find(r => r.id === id)
    if (!ycCurrentRecord) return
    showYiceDetail()
}

function showYiceDetail() {
    if (!ycCurrentRecord) return
    document.getElementById('yiceEditModule').classList.remove('active')
    document.getElementById('yiceModule').classList.remove('active')
    document.getElementById('yiceDetailModule').classList.add('active')
    renderYiceDetailHtml()
}

function jumpToGuaDetailFromYice() {
    if (!ycCurrentRecord) return
    const gua = liushisiGua.find(g => g.upper === ycCurrentRecord.upper && g.lower === ycCurrentRecord.lower)
    if (!gua) return
    window.fromYiceDetail = true
    window.yiceDongyao = ycCurrentRecord.dongyao || []
    window.yiceRecordId = ycCurrentRecord.id
    window.yiceMeasureTime = ycCurrentRecord.createTime
    showModule('chaxun')
    showGuaDetail(gua, true)
}

async function backToYiceDetail() {
    const backToYiceBtn = document.getElementById('cxBackToYiceBtn')
    if (backToYiceBtn) backToYiceBtn.style.display = 'none'
    window.fromYiceDetail = false
    window.yiceDongyao = null
    window.yiceMeasureTime = null
    const recordIdToShow = window.yiceRecordId
    window.yiceRecordId = null
    document.getElementById('chaxunModule').classList.remove('active')

    await loadYiceData()
    if (recordIdToShow) {
        const record = ycRecords.find(r => r.id === recordIdToShow)
        if (record) {
            ycCurrentRecord = record
            document.getElementById('yiceEditModule').classList.remove('active')
            document.getElementById('yiceModule').classList.remove('active')
            document.getElementById('yiceDetailModule').classList.add('active')
            renderYiceDetailHtml()
        }
    }
}

function backToLiuYaoFromCx() {
    const backToLiuYaoBtn = document.getElementById('cxBackToLiuYaoBtn')
    if (backToLiuYaoBtn) backToLiuYaoBtn.style.display = 'none'
    showModule('liuyao')
}

function backToMeihuaFromCx() {
    const backToMeihuaBtn = document.getElementById('cxBackToMeihuaBtn')
    if (backToMeihuaBtn) backToMeihuaBtn.style.display = 'none'
    showModule('meihua')
}

function backToHuafuFromCx() {
    const backToHuafuBtn = document.getElementById('cxBackToHuafuBtn')
    if (backToHuafuBtn) backToHuafuBtn.style.display = 'none'
    showModule('huafu')
}

function createYiceDetailSection(label, contentNode) {
    const section = document.createElement('div')
    section.className = 'yc-detail-section'

    const labelDiv = document.createElement('div')
    labelDiv.className = 'yc-detail-label'
    labelDiv.textContent = label

    const valueDiv = document.createElement('div')
    valueDiv.className = 'yc-detail-value'
    valueDiv.appendChild(contentNode)

    section.append(labelDiv, valueDiv)
    return section
}

function buildYiceDetailContent(record) {
    const wrapper = document.createDocumentFragment()
    const guaSection = document.createElement('div')
    guaSection.className = 'yc-detail-section'

    const guaValue = document.createElement('div')
    guaValue.className = 'yc-detail-value'
    guaValue.style.textAlign = 'center'
    guaValue.style.paddingBottom = '0'
    guaValue.style.cursor = 'pointer'
    guaValue.onclick = jumpToGuaDetailFromYice

    const guaName = document.createElement('div')
    guaName.style.fontSize = '1.5em'
    guaName.style.marginBottom = '-5px'
    guaName.textContent = getGuaNameBy上下(record.upper, record.lower)

    const guaSymbol = document.createElement('div')
    guaSymbol.style.fontSize = '3.5em'
    guaSymbol.style.lineHeight = '1.2'
    guaSymbol.appendChild(createGuaElement(record.upper, record.lower, record.dongyao || []))

    guaValue.append(guaName, guaSymbol)
    guaSection.appendChild(guaValue)
    wrapper.appendChild(guaSection)

    const timeNode = document.createElement('span')
    timeNode.textContent = new Date(record.createTime).toLocaleString('zh-CN')
    wrapper.appendChild(createYiceDetailSection('测算时间', timeNode))

    const categoryNode = document.createElement('span')
    categoryNode.textContent = normalizeYiceText(record.category) || '未分类'
    wrapper.appendChild(createYiceDetailSection('分类', categoryNode))

    const contentNode = document.createElement('span')
    contentNode.textContent = normalizeYiceText(record.content) || '无'
    wrapper.appendChild(createYiceDetailSection('测算内容', contentNode))

    const personNode = document.createElement('span')
    personNode.textContent = normalizeYiceText(record.person) || '未知'
    wrapper.appendChild(createYiceDetailSection('测算人', personNode))

    const analysisNode = document.createElement('span')
    analysisNode.textContent = normalizeYiceText(record.analysis) || '无'
    wrapper.appendChild(createYiceDetailSection('解卦思路', analysisNode))

    if (record.replays && record.replays.length > 0) {
        const replayWrap = document.createElement('div')
        replayWrap.style.marginTop = '30px'
        const title = document.createElement('h3')
        title.style.color = '#667eea'
        title.style.marginBottom = '15px'
        title.textContent = '复盘记录'
        replayWrap.appendChild(title)

        const sortedReplays = [...record.replays].sort((a, b) => new Date(a.time) - new Date(b.time))
        sortedReplays.forEach(replay => {
            const item = document.createElement('div')
            item.className = 'yc-replay-item'

            const replayTime = document.createElement('div')
            replayTime.className = 'yc-replay-time'
            replayTime.textContent = new Date(replay.time).toLocaleString('zh-CN')

            const content = document.createElement('div')
            content.style.marginBottom = '10px'
            content.innerHTML = '<strong>事情进展：</strong>'
            const contentText = document.createElement('span')
            contentText.textContent = normalizeYiceText(replay.content) || '无'
            content.appendChild(contentText)

            const diff = document.createElement('div')
            diff.innerHTML = '<strong>与预测差异：</strong>'
            const diffText = document.createElement('span')
            diffText.textContent = normalizeYiceText(replay.diff) || '无'
            diff.appendChild(diffText)

            item.append(replayTime, content, diff)
            replayWrap.appendChild(item)
        })

        wrapper.appendChild(replayWrap)
    }

    return wrapper
}

function renderYiceDetailHtml() {
    if (!ycCurrentRecord) return
    const container = document.getElementById('ycDetailContent')
    container.innerHTML = ''
    container.appendChild(buildYiceDetailContent(ycCurrentRecord))
}

function toggleYcDetailActions() {
    const menu = document.getElementById('ycDetailActionMenu')
    const btn = document.getElementById('ycDetailFloatingBtn')
    if (menu.style.display === 'none') {
        menu.style.display = 'block'
        btn.style.transform = 'rotate(45deg)'
    } else {
        menu.style.display = 'none'
        btn.style.transform = 'rotate(0)'
    }
}

function editYiceRecord() {
    if (!ycCurrentRecord) return
    document.getElementById('ycDetailActionMenu').style.display = 'none'
    document.getElementById('ycDetailFloatingBtn').style.transform = 'rotate(0)'

    loadCategoriesToSelect('ycEditCategory')
    document.getElementById('ycEditCategory').value = ycCurrentRecord.category || ''
    document.getElementById('ycEditContent').value = ycCurrentRecord.content || ''
    document.getElementById('ycEditPerson').value = ycCurrentRecord.person || ''
    document.getElementById('ycEditAnalysis').value = ycCurrentRecord.analysis || ''

    const accuracy = ycCurrentRecord.accuracy ?? 70
    const accuracyInput = document.getElementById('ycEditAccuracy')
    accuracyInput.value = accuracy
    document.getElementById('ycEditAccuracyValue').textContent = accuracy + '%'
    accuracyInput.style.background = accuracy <= 30 ? '#e74c3c' : (accuracy <= 60 ? '#f39c12' : (accuracy <= 80 ? '#3498db' : '#27ae60'))

    ycEditUpper = ycCurrentRecord.upper
    ycEditLower = ycCurrentRecord.lower
    ycEditDongyao = [...(ycCurrentRecord.dongyao || [])]

    document.getElementById('ycEditGuaText').style.display = 'none'
    const display = document.getElementById('ycEditGuaDisplay')
    display.style.display = 'block'
    appendGuaDisplay(display, getGuaNameBy上下(ycEditUpper, ycEditLower), createGuaElement(ycEditUpper, ycEditLower, ycEditDongyao), '2em', '5em')

    document.getElementById('ycEditDongyaoSelect').style.display = 'block'
    renderDongyaoButtons('ycEditDongyaoButtons', 'ycEdit')
    document.getElementById('yiceDetailModule').classList.remove('active')
    document.getElementById('yiceEditModule').classList.add('active')
}

function showEditGuaSelectModal() {
    document.getElementById('ycGuaModal').style.display = 'block'
    renderBaguaSelectForYice('ycUpperBagua', 'upper')
    renderBaguaSelectForYice('ycLowerBagua', 'lower')
    ycSelectedUpper = ycEditUpper
    ycSelectedLower = ycEditLower

    if (ycSelectedUpper) {
        document.querySelectorAll('#ycUpperBagua .bagua-btn').forEach(btn => {
            if (btn.textContent.includes(ycSelectedUpper)) btn.classList.add('selected')
        })
    }
    if (ycSelectedLower) {
        document.querySelectorAll('#ycLowerBagua .bagua-btn').forEach(btn => {
            if (btn.textContent.includes(ycSelectedLower)) btn.classList.add('selected')
        })
    }

    if (ycSelectedUpper && ycSelectedLower) {
        const result = document.getElementById('ycGuaResult')
        appendGuaDisplay(result, getGuaNameBy上下(ycSelectedUpper, ycSelectedLower), createGuaElement(ycSelectedUpper, ycSelectedLower, ycEditDongyao), '4em', '4em')
        document.getElementById('ycConfirmGuaBtn').style.display = 'inline-block'
    }

    document.getElementById('ycConfirmGuaBtn').onclick = function() {
        confirmEditGuaSelection()
    }
}

function confirmEditGuaSelection() {
    ycEditUpper = ycSelectedUpper
    ycEditLower = ycSelectedLower
    const display = document.getElementById('ycEditGuaDisplay')
    display.style.display = 'block'
    appendGuaDisplay(display, getGuaNameBy上下(ycEditUpper, ycEditLower), createGuaElement(ycEditUpper, ycEditLower, ycEditDongyao), '2em', '5em')
    renderDongyaoButtons('ycEditDongyaoButtons', 'ycEdit')
    closeGuaModal()
    document.getElementById('ycConfirmGuaBtn').onclick = function() {
        confirmGuaSelection()
    }
}

async function updateYiceRecord() {
    if (!ycCurrentRecord) return
    await runYiceAction('updateYiceRecord', async () => {
        const updatedRecord = normalizeYiceRecord({
            ...ycCurrentRecord,
            category: document.getElementById('ycEditCategory').value,
            content: document.getElementById('ycEditContent').value,
            person: document.getElementById('ycEditPerson').value,
            analysis: document.getElementById('ycEditAnalysis').value,
            upper: ycEditUpper,
            lower: ycEditLower,
            dongyao: [...ycEditDongyao],
            updateTime: new Date().toISOString(),
            accuracy: getAccuracyValue('ycEditAccuracy')
        })

        await queueYiceWrite(async () => {
            await loadYiceData()
            const recordIndex = ycRecords.findIndex(r => r.id === updatedRecord.id)
            if (recordIndex === -1) throw new Error('记录不存在或已被删除')
            await updateYiceRecordInDB(updatedRecord)
            ycRecords[recordIndex] = updatedRecord
            ycCurrentRecord = ycRecords[recordIndex]
        })

        showAppToast('保存成功')
        showYiceDetail()
    })
}

function showReplayForm() {
    document.getElementById('ycDetailActionMenu').style.display = 'none'
    document.getElementById('ycDetailFloatingBtn').style.transform = 'rotate(0)'
    document.getElementById('ycReplayContent').value = ''
    document.getElementById('ycReplayDiff').value = ''
    document.getElementById('ycReplayModal').style.display = 'block'
}

function closeReplayModal() {
    document.getElementById('ycReplayModal').style.display = 'none'
}

async function saveReplay() {
    if (!ycCurrentRecord) return
    await runYiceAction('saveReplay', async () => {
        const content = normalizeYiceText(document.getElementById('ycReplayContent').value)
        const diff = normalizeYiceText(document.getElementById('ycReplayDiff').value)
        if (!content && !diff) {
            showAppToast('请至少填写事情进展或与预测的差异')
            return
        }

        const replay = normalizeYiceReplay({ id: Date.now().toString(), content, diff, time: new Date().toISOString() })

        await queueYiceWrite(async () => {
            await loadYiceData()
            const recordIndex = ycRecords.findIndex(r => r.id === ycCurrentRecord.id)
            if (recordIndex === -1) throw new Error('记录不存在或已被删除')
            const updatedRecord = normalizeYiceRecord({
                ...ycRecords[recordIndex],
                replays: [...(ycRecords[recordIndex].replays || []), replay],
                updateTime: new Date().toISOString()
            })
            await updateYiceRecordInDB(updatedRecord)
            ycRecords[recordIndex] = updatedRecord
            ycCurrentRecord = ycRecords[recordIndex]
        })

        showAppToast('复盘记录保存成功')
        closeReplayModal()
        showYiceDetail()
    })
}

async function backupYiceData() {
    try {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hour = String(now.getHours()).padStart(2, '0')
        const minute = String(now.getMinutes()).padStart(2, '0')
        const fileName = `易师${year}${month}${day}${hour}${minute}.db`

        await initYiceDB()
        const dbName = DB_NAME.replace('.db', '')

        if (window.AndroidFileSaver) {
            const readResult = window.AndroidFileSaver.exportDbAsBase64(dbName)
            if (readResult && !readResult.startsWith('error:')) {
                const saveResult = window.AndroidFileSaver.saveBase64ToDownloads(fileName, readResult)
                if (saveResult && saveResult.startsWith('success:')) {
                    const filePath = saveResult.substring(8)
                    showAppToast('备份成功！<br><span style="font-size: 12px; color: #666;">' + filePath + '</span>')
                } else {
                    showAppToast('备份失败<br><span style="font-size: 12px; color: #666;">' + saveResult + '</span>')
                }
            } else {
                showAppToast('读取数据库文件失败<br><span style="font-size: 12px; color: #666;">' + readResult + '</span>')
            }
        } else {
            const pathResult = await yiceDB.getNCDatabasePath({ path: 'default', database: DB_NAME })
            const dbPath = pathResult.path
            const response = await fetch('file://' + dbPath)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.click()
            URL.revokeObjectURL(url)
            showAppToast('备份成功！文件已下载: ' + fileName)
        }
    } catch (error) {
        console.error('备份失败:', error)
        showAppToast('备份失败<br><span style="font-size: 12px; color: #666;">' + error.message + '</span>')
    }
}

function doBrowserDownload(fileName, json) {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    showAppToast('备份成功！文件已下载: ' + fileName)
}

function importYiceData() {
    document.getElementById('ycImportFileInput').click()
}

async function handleYiceImport(event) {
    const file = event.target.files[0]
    if (!file) return

    try {
        const buffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)
        const header = String.fromCharCode.apply(null, uint8Array.slice(0, 15))
        if (header === 'SQLite format 3') {
            await importSqliteDb(uint8Array)
        } else {
            const text = new TextDecoder().decode(buffer)
            const jsonData = JSON.parse(text)
            let records = []
            let categories = []

            if (jsonData.export && jsonData.export.tables) {
                jsonData.export.tables.forEach(table => {
                    if (table.name === 'yice_records') records = table.values || []
                    if (table.name === 'yice_categories') categories = (table.values || []).map(v => v.name)
                })
            } else if (jsonData.records) {
                records = jsonData.records
                categories = jsonData.categories || []
            } else {
                showAppToast('导入文件格式不正确')
                return
            }

            showImportOptionsModal({ records, categories })
        }
    } catch (err) {
        showAppToast('导入失败：' + err.message)
    }
    event.target.value = ''
}

async function importSqliteDb(uint8Array) {
    try {
        let binaryStr = ''
        const chunkSize = 8192
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
            binaryStr += String.fromCharCode.apply(null, chunk)
        }
        const base64 = btoa(binaryStr)

        if (window.AndroidFileSaver) {
            try {
                if (yiceDB) {
                    await yiceDB.close({ database: DB_NAME })
                    await yiceDB.closeConnection({ database: DB_NAME })
                }
            } catch (e) {
                console.log('关闭连接:', e.message)
            }
            dbInitialized = false
            yiceDB = null

            const dbName = DB_NAME.replace('.db', '')
            const writeResult = window.AndroidFileSaver.writeDbFromBase64(dbName, base64)
            if (writeResult && writeResult.startsWith('success:')) {
                await initYiceDB()
                await loadYiceData()
                await renderYiceList()
                loadCategoriesToSelect('ycAddCategory')
                showAppToast('导入成功！')
            } else {
                showAppToast('导入失败: ' + writeResult)
            }
        } else {
            showAppToast('当前环境不支持导入')
        }
    } catch (err) {
        showAppToast('导入失败：' + err.message)
    }
}

function createImportModalButton(text, backgroundColor, onClick) {
    const button = document.createElement('button')
    button.textContent = text
    button.style.display = 'block'
    button.style.width = '100%'
    button.style.padding = '12px'
    button.style.marginBottom = text === '取消' ? '0' : '10px'
    button.style.background = backgroundColor
    button.style.color = 'white'
    button.style.border = 'none'
    button.style.borderRadius = '5px'
    button.style.cursor = 'pointer'
    button.style.fontSize = '16px'
    button.onclick = onClick
    return button
}

function showImportOptionsModal(data) {
    const modal = document.createElement('div')
    modal.id = 'ycImportModal'
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;'

    const panel = document.createElement('div')
    panel.style.background = 'white'
    panel.style.padding = '30px'
    panel.style.borderRadius = '10px'
    panel.style.maxWidth = '350px'
    panel.style.width = '90%'
    panel.style.textAlign = 'center'

    const title = document.createElement('h3')
    title.style.marginBottom = '20px'
    title.style.color = '#333'
    title.textContent = '导入数据'

    const desc = document.createElement('p')
    desc.style.marginBottom = '20px'
    desc.style.color = '#666'
    desc.textContent = '文件包含 ' + data.records.length + ' 条记录'

    const closeModal = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal)
        }
    }

    const appendButton = createImportModalButton('追加数据', '#4CAF50', async function() {
        const newRecords = data.records.map(r => ({ ...r, id: Date.now() + Math.random().toString(36).substr(2, 9) }))
        await loadYiceData()
        ycRecords = [...ycRecords, ...newRecords]

        if (data.categories && Array.isArray(data.categories)) {
            data.categories.forEach(cat => {
                if (!ycCategories.includes(cat)) ycCategories.push(cat)
            })
        }

        for (const record of newRecords) {
            await insertYiceRecordToDB(record)
        }
        await saveYiceCategoriesToDB()
        await renderYiceList()
        loadCategoriesToSelect('ycAddCategory')
        closeModal()
        showAppToast('追加成功！共导入 ' + newRecords.length + ' 条记录')
    })

    const coverButton = createImportModalButton('覆盖数据', '#2196F3', async function() {
        ycRecords = Array.isArray(data.records) ? data.records : []
        await replaceAllYiceDataInDB(ycRecords, data.categories)
        await loadYiceData()
        await renderYiceList()
        loadCategoriesToSelect('ycAddCategory')
        closeModal()
        showAppToast('覆盖成功！共导入 ' + ycRecords.length + ' 条记录')
    })

    const cancelButton = createImportModalButton('取消', '#999', closeModal)

    panel.append(title, desc, appendButton, coverButton, cancelButton)
    modal.appendChild(panel)
    document.body.appendChild(modal)
}

function setupYiceScrollListener() {
    const listArea = document.getElementById('ycListArea')
    if (!listArea) return
    listArea.addEventListener('scroll', function() {
        const hasMore = ycFilteredRecords.length > ycCurrentPage * ycPageSize
        if (!hasMore || ycIsLoadingMore) return
        const { scrollTop, scrollHeight, clientHeight } = this
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            ycIsLoadingMore = true
            ycCurrentPage++
            renderYiceList(true)
            setTimeout(() => {
                ycIsLoadingMore = false
            }, 100)
        }
    })
}
