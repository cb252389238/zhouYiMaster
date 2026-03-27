// 全局变量
let currentModule = null;
let currentGua = null;
let score = 0;
let questionCount = 0;

// 卦象练习模块变量
let gxCorrectAnswer = null;
let gxAnswered = false;

// 卦名记忆模块变量
let gmSelectedBagua = [];
let gmAnswered = false;
let gmClickCount = 0; // 记录点击次数，允许选择相同的卦两次

// 爻辞卦辞模块变量
let ycCurrentStep = 0; // 0: 卦辞，1-6: 爻辞
let ycAnswered = false;

// 六十四卦查询模块变量
let cxCurrentGua = null;
let cxChangedYaoci = []; // 存储变爻位置 (1-6)
let cxRootGua = null; // 保存本卦（原始卦）

// 六爻起卦模块变量
let lyYaoci = []; // 存储六爻结果（从下往上）
let lyCurrentYao = 0; // 当前投掷第几爻（1-6）
let lyIsTossing = false; // 是否正在投掷

// 显示首页
function showHome() {
    hideAllModules();
    document.getElementById('homeModule').style.display = 'grid';
    currentModule = null;
}

// 隐藏所有模块
function hideAllModules() {
    document.getElementById('homeModule').style.display = 'none';
    document.querySelectorAll('.practice-area').forEach(area => {
        area.classList.remove('active');
    });
}

// 显示指定模块
function showModule(moduleName) {
    hideAllModules();
    currentModule = moduleName;
    
    if (moduleName === 'guaxiang') {
        document.getElementById('guaxiangModule').classList.add('active');
        initGuaXiang();
    } else if (moduleName === 'guaming') {
        document.getElementById('guamingModule').classList.add('active');
        initGuaMing();
    } else if (moduleName === 'yaoci') {
        document.getElementById('yaociModule').classList.add('active');
        initYaoCi();
    } else if (moduleName === 'chaxun') {
        document.getElementById('chaxunModule').classList.add('active');
        initChaXun();
    } else if (moduleName === 'liuyao') {
        document.getElementById('liuyaoModule').classList.add('active');
        initLiuYao();
    }
}

// ==================== 卦象练习模块 ====================
function initGuaXiang() {
    nextGuaXiang();
}

function nextGuaXiang() {
    gxAnswered = false;
    document.getElementById('gxResult').innerHTML = '';
    document.getElementById('gxNextBtn').style.display = 'none';
    
    // 随机选择一个卦
    const randomIndex = Math.floor(Math.random() * liushisiGua.length);
    currentGua = liushisiGua[randomIndex];
    gxCorrectAnswer = currentGua.name;
    
    // 显示卦象符号
    document.getElementById('gxSymbol').textContent = currentGua.symbol;
    
    // 生成选项（1 个正确 + 2 个错误）
    const options = generateOptions(gxCorrectAnswer, 3);
    
    // 显示选项按钮
    const optionsContainer = document.getElementById('gxOptions');
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkGuaXiangAnswer(option, btn);
        optionsContainer.appendChild(btn);
    });
    
    // 更新进度
    questionCount++;
    document.getElementById('gxProgress').textContent = `第 ${questionCount} 题`;
}

function checkGuaXiangAnswer(selectedAnswer, btnElement) {
    if (gxAnswered) return;
    gxAnswered = true;
    
    const resultDiv = document.getElementById('gxResult');
    const allButtons = document.querySelectorAll('#gxOptions .option-btn');
    
    if (selectedAnswer === gxCorrectAnswer) {
        btnElement.classList.add('correct');
        resultDiv.className = 'result-area correct';
        resultDiv.innerHTML = `✓ 回答正确！${gxCorrectAnswer}`;
        score++;
    } else {
        btnElement.classList.add('wrong');
        resultDiv.className = 'result-area wrong';
        resultDiv.innerHTML = `✗ 回答错误。正确答案是：${gxCorrectAnswer}`;
        
        // 标出正确答案
        allButtons.forEach(btn => {
            if (btn.textContent === gxCorrectAnswer) {
                btn.classList.add('correct');
            }
        });
    }
    
    document.getElementById('gxNextBtn').style.display = 'inline-block';
}

// ==================== 卦名记忆模块 ====================
function initGuaMing() {
    nextGuaMing();
}

function nextGuaMing() {
    gmAnswered = false;
    gmSelectedBagua = [];
    gmClickCount = 0; // 重置点击计数
    document.getElementById('gmResult').innerHTML = '';
    document.getElementById('gmNextBtn').style.display = 'none';
    document.getElementById('gmSelected').innerHTML = '';
    
    // 随机选择一个卦
    const randomIndex = Math.floor(Math.random() * liushisiGua.length);
    currentGua = liushisiGua[randomIndex];
    
    // 显示卦名（只显示卦名，不显示上下卦）
    document.getElementById('gmGuaName').textContent = `??${currentGua.shortName}卦`;
    
    // 显示八卦选项
    const baguaContainer = document.getElementById('gmBaguaOptions');
    baguaContainer.innerHTML = '';
    
    // 先天八卦顺序：乾兑离震巽坎艮坤
    const baguaOrder = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
    
    baguaOrder.forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'bagua-btn';
        btn.innerHTML = `<div>${baguaData[key].symbol}</div><div style="font-size:0.7em;margin-top:5px;">${key}</div>`;
        btn.onclick = () => selectBagua(key, btn);
        baguaContainer.appendChild(btn);
    });
    
    // 更新进度
    questionCount++;
    document.getElementById('gmProgress').textContent = `第 ${questionCount} 题`;
}

function selectBagua(baguaName, btnElement) {
    if (gmAnswered) return;
    
    // 如果已经选择了 2 个，不允许再选
    if (gmClickCount >= 2) return;
    
    // 每次点击都添加到选择列表（允许重复选择同一个卦）
    gmSelectedBagua.push(baguaName);
    gmClickCount++;
    
    // 视觉反馈：如果是第二次选择同一个卦，添加特殊样式
    btnElement.classList.add('selected');
    
    // 更新显示选中的卦
    updateSelectedBaguaDisplay();
    
    // 如果已经选了 2 个，检查答案
    if (gmClickCount === 2) {
        checkGuaMingAnswer();
    }
}

function updateSelectedBaguaDisplay() {
    const display = gmSelectedBagua.map(name => `${name}(${baguaData[name].symbol})`).join(' + ');
    document.getElementById('gmSelected').innerHTML = gmSelectedBagua.length > 0 ? 
        `已选：${display}` : '';
}

function checkGuaMingAnswer() {
    gmAnswered = true;
    const resultDiv = document.getElementById('gmResult');
    
    const correctUpper = currentGua.upper;
    const correctLower = currentGua.lower;
    
    // 检查是否选择了正确的上下卦（顺序不重要）
    const isCorrect = (gmSelectedBagua[0] === correctUpper && gmSelectedBagua[1] === correctLower) ||
                      (gmSelectedBagua[0] === correctLower && gmSelectedBagua[1] === correctUpper);
    
    // 使用自然元素显示卦名
    const upperElement = baguaElement[correctUpper];
    const lowerElement = baguaElement[correctLower];
    
    // 判断是否为重卦
    let guaNameDisplay;
    if (correctUpper === correctLower) {
        // 重卦：X 为 Y 卦
        guaNameDisplay = `${correctUpper}为${upperElement}卦`;
    } else {
        // 非重卦：上火下水 = 火水未济卦
        guaNameDisplay = `${upperElement}${lowerElement}${currentGua.shortName}卦`;
    }
    
    if (isCorrect) {
        resultDiv.className = 'result-area correct';
        resultDiv.innerHTML = `✓ 回答正确！${guaNameDisplay}由${upperElement}卦和${lowerElement}卦组成`;
        score++;
    } else {
        resultDiv.className = 'result-area wrong';
        resultDiv.innerHTML = `✗ 回答错误。${guaNameDisplay}由${upperElement}卦（上）和${lowerElement}卦（下）组成`;
    }
    
    // 更新卦名显示为完整信息（使用自然元素）
    document.getElementById('gmGuaName').textContent = guaNameDisplay;
    
    document.getElementById('gmNextBtn').style.display = 'inline-block';
}

// ==================== 爻辞卦辞练习模块 ====================
function initYaoCi() {
    score = 0;
    questionCount = 0;
    ycCurrentStep = 0;
    ycAnswered = false;
    
    // 随机选择一个卦
    const randomIndex = Math.floor(Math.random() * liushisiGua.length);
    currentGua = liushisiGua[randomIndex];
    
    // 显示卦象和卦名
    document.getElementById('ycSymbol').textContent = currentGua.symbol;
    document.getElementById('ycGuaName').textContent = currentGua.name;
    
    // 显示分数
    document.getElementById('ycScore').textContent = `得分：${score} | 题数：${questionCount}`;
    
    // 显示卦辞问题
    showGuaCiQuestion();
}

function nextYaoCi() {
    ycCurrentStep = 0;
    ycAnswered = false;
    document.getElementById('ycResult').innerHTML = '';
    document.getElementById('ycNextBtn').style.display = 'none';
    document.getElementById('ycNextBtn').textContent = '继续';
    
    // 随机选择一个卦
    const randomIndex = Math.floor(Math.random() * liushisiGua.length);
    currentGua = liushisiGua[randomIndex];
    
    // 显示卦象和卦名
    document.getElementById('ycSymbol').textContent = currentGua.symbol;
    document.getElementById('ycGuaName').textContent = currentGua.name;
    
    // 显示分数
    document.getElementById('ycScore').textContent = `得分：${score} | 题数：${questionCount}`;
    
    // 显示卦辞问题
    showGuaCiQuestion();
}

function showGuaCiQuestion() {
    const questionDiv = document.getElementById('ycQuestion');
    questionDiv.innerHTML = '<h3 style="margin-bottom:15px;">请选择正确的卦辞：</h3>';
    
    // 生成卦辞选项
    const options = generateGuaCiOptions(currentGua.tuanshi, 3);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-grid';
    optionsContainer.style.gridTemplateColumns = '1fr';
    
    options.forEach(option => {
        const btn = document.createElement('div');
        btn.className = 'yaoci-option';
        btn.textContent = option;
        btn.onclick = () => checkYaoCiAnswer(option, btn, currentGua.tuanshi);
        optionsContainer.appendChild(btn);
    });
    
    questionDiv.appendChild(optionsContainer);
}

function showYaoCiQuestion(yaoIndex) {
    const questionDiv = document.getElementById('ycQuestion');
    questionDiv.innerHTML = `<h3 style="margin-bottom:15px;">请选择第${yaoIndex}爻的爻辞：</h3>`;
    
    // 生成选项
    const correctYaoci = currentGua.yaoci[yaoIndex - 1];
    const options = generateYaociOptions(correctYaoci, yaoIndex);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-grid';
    optionsContainer.style.gridTemplateColumns = '1fr';
    
    options.forEach(option => {
        const btn = document.createElement('div');
        btn.className = 'yaoci-option';
        btn.textContent = option;
        btn.onclick = () => checkYaoCiAnswer(option, btn, correctYaoci);
        optionsContainer.appendChild(btn);
    });
    
    questionDiv.appendChild(optionsContainer);
}

function generateYaociOptions(correctAnswer, yaoIndex) {
    const options = [correctAnswer];
    const usedOptions = new Set([correctAnswer]);
    
    // 从其他卦的同一爻位找干扰项
    while (options.length < 3) {
        const randomGua = liushisiGua[Math.floor(Math.random() * liushisiGua.length)];
        const randomYaoci = randomGua.yaoci[yaoIndex - 1];
        
        if (!usedOptions.has(randomYaoci)) {
            options.push(randomYaoci);
            usedOptions.add(randomYaoci);
        }
    }
    
    // 打乱顺序
    return options.sort(() => Math.random() - 0.5);
}

function checkYaoCiAnswer(selectedAnswer, btnElement, correctAnswer) {
    if (ycAnswered) return;
    ycAnswered = true;
    
    const resultDiv = document.getElementById('ycResult');
    const allButtons = document.querySelectorAll('.yaoci-option');
    
    if (selectedAnswer === correctAnswer) {
        btnElement.classList.add('correct');
        resultDiv.className = 'result-area correct';
        resultDiv.innerHTML = `✓ 回答正确！`;
        score++;
        
        // 如果是卦辞，继续到第一爻
        if (ycCurrentStep === 0) {
            document.getElementById('ycNextBtn').textContent = '进入爻辞';
        } else {
            document.getElementById('ycNextBtn').textContent = '继续';
        }
    } else {
        btnElement.classList.add('wrong');
        resultDiv.className = 'result-area wrong';
        resultDiv.innerHTML = `✗ 回答错误。正确答案是：${correctAnswer}`;
        
        // 标出正确答案
        allButtons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        
        document.getElementById('ycNextBtn').textContent = '下一卦';
    }
    
    document.getElementById('ycNextBtn').style.display = 'inline-block';
    questionCount++;
}

// 爻辞模块的下一步
function nextYaoCiModule() {
    if (!ycAnswered) return;
    
    if (ycCurrentStep === 0 && document.getElementById('ycNextBtn').textContent === '进入爻辞') {
        // 进入爻辞练习
        ycCurrentStep = 1;
        ycAnswered = false;
        document.getElementById('ycResult').innerHTML = '';
        document.getElementById('ycNextBtn').style.display = 'none';
        showYaoCiQuestion(1);
    } else if (ycCurrentStep >= 1 && ycCurrentStep < 6) {
        // 继续下一爻
        ycCurrentStep++;
        ycAnswered = false;
        document.getElementById('ycResult').innerHTML = '';
        document.getElementById('ycNextBtn').style.display = 'none';
        showYaoCiQuestion(ycCurrentStep);
    } else {
        // 完成一卦，开始新的
        initYaoCi();
    }
}

// ==================== 工具函数 ====================
// 生成选项（用于卦名、卦辞等）
function generateOptions(correctAnswer, count) {
    const options = [correctAnswer];
    const usedOptions = new Set([correctAnswer]);
    
    while (options.length < count) {
        const randomGua = liushisiGua[Math.floor(Math.random() * liushisiGua.length)];
        const randomName = randomGua.name;
        
        if (!usedOptions.has(randomName)) {
            options.push(randomName);
            usedOptions.add(randomName);
        }
    }
    
    // 打乱顺序
    return options.sort(() => Math.random() - 0.5);
}

// 生成卦辞选项（从其他卦的卦辞中选择）
function generateGuaCiOptions(correctAnswer, count) {
    const options = [correctAnswer];
    const usedOptions = new Set([correctAnswer]);
    
    while (options.length < count) {
        const randomGua = liushisiGua[Math.floor(Math.random() * liushisiGua.length)];
        const randomGuaCi = randomGua.tuanshi;
        
        if (!usedOptions.has(randomGuaCi)) {
            options.push(randomGuaCi);
            usedOptions.add(randomGuaCi);
        }
    }
    
    // 打乱顺序
    return options.sort(() => Math.random() - 0.5);
}

// ==================== 六十四卦查询模块 ====================
// 初始化查询模块
function initChaXun() {
    cxCurrentGua = {}; // 重置为对象
    cxChangedYaoci = [];
    document.getElementById('cxBaguaSelect').style.display = 'block';
    document.getElementById('cxGuaDetail').style.display = 'none';
    document.getElementById('cxResult').innerHTML = '';
    
    // 清除所有选中状态
    const allButtons = document.querySelectorAll('#cxUpperBagua .bagua-btn, #cxLowerBagua .bagua-btn');
    allButtons.forEach(btn => btn.classList.remove('selected'));
    
    // 显示上卦选择
    renderBaguaSelect('cxUpperBagua', 'upper');
    // 显示下卦选择
    renderBaguaSelect('cxLowerBagua', 'lower');
}

// 渲染八卦选择按钮
function renderBaguaSelect(containerId, position) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // 先天八卦顺序：乾兑离震巽坎艮坤
    const baguaOrder = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
    
    baguaOrder.forEach(key => {
        const btn = document.createElement('div');
        btn.className = 'bagua-btn';
        btn.innerHTML = `<div>${baguaData[key].symbol}</div><div style="font-size:0.7em;margin-top:5px;">${key}</div>`;
        btn.onclick = () => selectBaguaForChaXun(key, position);
        container.appendChild(btn);
    });
}

// 选择八卦用于查询
function selectBaguaForChaXun(baguaName, position) {
    if (position === 'upper') {
        // 保存上卦选择
        cxCurrentGua = {};
        cxCurrentGua.upper = baguaName;
        
        // 视觉反馈
        const buttons = document.querySelectorAll('#cxUpperBagua .bagua-btn');
        buttons.forEach(btn => btn.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
    } else {
        // 保存下卦选择
        cxCurrentGua.lower = baguaName;
        
        // 视觉反馈
        const buttons = document.querySelectorAll('#cxLowerBagua .bagua-btn');
        buttons.forEach(btn => btn.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
    }
    
    // 如果上下卦都已选择，查找对应的六十四卦
    if (cxCurrentGua.upper && cxCurrentGua.lower) {
        setTimeout(() => {
            findGuaByBagua(cxCurrentGua.upper, cxCurrentGua.lower);
        }, 300);
    }
}

// 根据上下卦查找六十四卦
function findGuaByBagua(upper, lower) {
    const gua = liushisiGua.find(g => g.upper === upper && g.lower === lower);
    if (gua) {
        showGuaDetail(gua, true); // 标记为本卦
    }
}

// 显示卦象详情
function showGuaDetail(gua, isRootGua = false) {
    cxCurrentGua = gua;
    cxChangedYaoci = [];
    
    // 如果是本卦，保存为本卦
    if (isRootGua) {
        cxRootGua = gua;
    }
    
    // 隐藏选择区域，显示详情区域
    document.getElementById('cxBaguaSelect').style.display = 'none';
    document.getElementById('cxGuaDetail').style.display = 'block';
    
    // 显示卦象符号和名称
    document.getElementById('cxSymbol').textContent = gua.symbol;
    
    // 使用自然元素显示卦名
    const upperElement = baguaElement[gua.upper];
    const lowerElement = baguaElement[gua.lower];
    
    // 判断是否为重卦（上下卦相同）
    let guaNameDisplay;
    if (gua.upper === gua.lower) {
        // 重卦：X 为 Y 卦（如乾为天卦、坤为地卦）
        // 格式：八卦名 + 为 + 自然元素 + 卦
        guaNameDisplay = `${gua.upper}为${baguaElement[gua.upper]}卦`;
    } else {
        // 非重卦：上火下水 = 火水未济卦
        guaNameDisplay = `${upperElement}${lowerElement}${gua.shortName}卦`;
    }
    
    document.getElementById('cxGuaName').textContent = guaNameDisplay;
    
    // 显示卦辞
    document.getElementById('cxTuanshi').textContent = gua.tuanshi;
    
    // 显示爻辞
    renderYaociList(gua);
    
    // 更新互卦、综卦、错卦按钮状态
    updateGuaButtons(gua);
    
    // 隐藏变卦按钮
    document.getElementById('cvChangeGuaDiv').style.display = 'none';
    
    // 如果不是本卦，显示返回本卦按钮
    const backToRootBtn = document.getElementById('cxBackToRootBtn');
    if (backToRootBtn) {
        backToRootBtn.style.display = (cxRootGua && cxRootGua.number !== gua.number) ? 'inline-block' : 'none';
    }
}

// 渲染爻辞列表
function renderYaociList(gua) {
    const container = document.getElementById('cxYaociList');
    container.innerHTML = '';
    
    gua.yaoci.forEach((yaoci, index) => {
        const yaoNum = index + 1;
        const yaoItem = document.createElement('div');
        yaoItem.className = 'yaoci-item';
        yaoItem.dataset.yaoNum = yaoNum;
        yaoItem.onclick = () => toggleYaociChange(yaoNum);
        
        yaoItem.innerHTML = `
            <div class="yaoci-title">第${yaoNum}爻：${yaoci.split('：')[0]}</div>
            <div class="yaoci-content">${yaoci.split('：')[1] || yaoci}</div>
        `;
        
        container.appendChild(yaoItem);
    });
}

// 切换爻的变爻状态
function toggleYaociChange(yaoNum) {
    const index = cxChangedYaoci.indexOf(yaoNum);
    const yaoItem = document.querySelector(`.yaoci-item[data-yao-num="${yaoNum}"]`);
    
    if (index > -1) {
        // 取消变爻
        cxChangedYaoci.splice(index, 1);
        yaoItem.classList.remove('changed');
    } else {
        // 添加变爻
        cxChangedYaoci.push(yaoNum);
        yaoItem.classList.add('changed');
    }
    
    // 如果有变爻，显示变卦按钮
    if (cxChangedYaoci.length > 0) {
        document.getElementById('cvChangeGuaDiv').style.display = 'block';
    } else {
        document.getElementById('cvChangeGuaDiv').style.display = 'none';
    }
}

// 更新互卦、综卦、错卦按钮
function updateGuaButtons(gua) {
    const hugua = getHuGua(gua);
    const zonggua = getZongGua(gua);
    const cuogua = getCuoGua(gua);
    
    const huguaBtn = document.getElementById('cxHuguaBtn');
    const zongguaBtn = document.getElementById('cxZongguaBtn');
    const cuoguaBtn = document.getElementById('cxCuoguaBtn');
    
    // 设置按钮文本
    huguaBtn.textContent = `互卦：${hugua.shortName}卦`;
    zongguaBtn.textContent = `综卦：${zonggua.shortName}卦`;
    cuoguaBtn.textContent = `错卦：${cuogua.shortName}卦`;
    
    // 存储目标卦的信息
    huguaBtn.dataset.guaName = hugua.name;
    zongguaBtn.dataset.guaName = zonggua.name;
    cuoguaBtn.dataset.guaName = cuogua.name;
}

// 获取互卦
function getHuGua(gua) {
    // 互卦：由 234 爻组成下卦，345 爻组成上卦
    // 从爻辞提取阴阳（初九/初六表示阴阳）
    const yaoyin = gua.yaoci.map(y => y.includes('九') ? 1 : 0);
    
    // 234 爻组成下卦（索引 1,2,3）
    const lowerYao = [yaoyin[1], yaoyin[2], yaoyin[3]];
    // 345 爻组成上卦（索引 2,3,4）
    const upperYao = [yaoyin[2], yaoyin[3], yaoyin[4]];
    
    const lowerBagua = findBaguaByYaoYinYang(lowerYao);
    const upperBagua = findBaguaByYaoYinYang(upperYao);
    
    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua) || gua;
    }
    
    return gua;
}

// 获取综卦
function getZongGua(gua) {
    // 综卦：将卦倒过来（180 度旋转）
    // 需要将六爻完全颠倒，然后重新组成上下卦
    
    // 从爻辞提取阴阳（初九/初六表示阴阳）
    const yaoyin = gua.yaoci.map(y => y.includes('九') ? 1 : 0);
    
    // 将六爻顺序完全颠倒
    const reversedYao = yaoyin.reverse();
    
    // 下卦由新的初、二、三爻组成（索引 0,1,2）
    const lowerYao = [reversedYao[0], reversedYao[1], reversedYao[2]];
    // 上卦由新的四、五、上爻组成（索引 3,4,5）
    const upperYao = [reversedYao[3], reversedYao[4], reversedYao[5]];
    
    const lowerBagua = findBaguaByYaoYinYang(lowerYao);
    const upperBagua = findBaguaByYaoYinYang(upperYao);
    
    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua) || gua;
    }
    
    return gua;
}

// 获取错卦
function getCuoGua(gua) {
    // 错卦：每个爻都阴阳相反
    const baguaMap = {
        '乾': '坤', '坤': '乾',
        '震': '巽', '巽': '震',
        '坎': '离', '离': '坎',
        '艮': '兑', '兑': '艮'
    };
    
    const newUpper = baguaMap[gua.upper];
    const newLower = baguaMap[gua.lower];
    
    return liushisiGua.find(g => g.upper === newUpper && g.lower === newLower) || gua;
}

// 根据阴阳爻查找对应的八卦
function findBaguaByYaoYinYang(yaoArray) {
    for (const [baguaName, yaoYinYang] of Object.entries(baguaYaoYinYang)) {
        if (JSON.stringify(yaoYinYang) === JSON.stringify(yaoArray)) {
            return baguaName;
        }
    }
    return null;
}

// 获取变卦
function getBianGua(gua, changedYaoci) {
    // 变卦：将变爻的阴阳改变
    // 首先获取六爻的阴阳
    const yaoyin = gua.yaoci.map(y => y.includes('九') ? 1 : 0);
    
    // 改变变爻的阴阳
    changedYaoci.forEach(yaoNum => {
        const index = yaoNum - 1; // 转换为 0 基索引
        yaoyin[index] = yaoyin[index] === 1 ? 0 : 1; // 阴阳转换
    });
    
    // 下卦由初、二、三爻组成
    const lowerYao = [yaoyin[0], yaoyin[1], yaoyin[2]];
    // 上卦由四、五、上爻组成
    const upperYao = [yaoyin[3], yaoyin[4], yaoyin[5]];
    
    const lowerBagua = findBaguaByYaoYinYang(lowerYao);
    const upperBagua = findBaguaByYaoYinYang(upperYao);
    
    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua) || gua;
    }
    
    return gua;
}

// 跳转到互卦、综卦、错卦
function jumpToGua(type) {
    let targetGuaName = '';
    
    if (type === 'hugua') {
        const hugua = getHuGua(cxCurrentGua);
        targetGuaName = hugua.name;
    } else if (type === 'zonggua') {
        const zonggua = getZongGua(cxCurrentGua);
        targetGuaName = zonggua.name;
    } else if (type === 'cuogua') {
        const cuogua = getCuoGua(cxCurrentGua);
        targetGuaName = cuogua.name;
    }
    
    if (targetGuaName) {
        const targetGua = liushisiGua.find(g => g.name === targetGuaName);
        if (targetGua) {
            showGuaDetail(targetGua, false); // 不是本卦
        }
    }
}

// 跳转到变卦
function jumpToBianGua() {
    if (cxChangedYaoci.length === 0) return;
    
    // 根据变爻计算变卦
    const bianGua = getBianGua(cxCurrentGua, cxChangedYaoci);
    if (bianGua) {
        showGuaDetail(bianGua, false); // 不是本卦
    }
}

// 返回八卦选择
function backToBaguaSelect() {
    document.getElementById('cxBaguaSelect').style.display = 'block';
    document.getElementById('cxGuaDetail').style.display = 'none';
    cxChangedYaoci = [];
    cxCurrentGua = {}; // 重置当前卦对象
    cxRootGua = null; // 重置本卦
    
    // 清除所有选中状态
    const allButtons = document.querySelectorAll('#cxUpperBagua .bagua-btn, #cxLowerBagua .bagua-btn');
    allButtons.forEach(btn => btn.classList.remove('selected'));
}

// 返回本卦
function backToRootGua() {
    if (cxRootGua) {
        showGuaDetail(cxRootGua, true);
    }
}

// ==================== 六爻起卦模块 ====================
// 初始化六爻起卦
function initLiuYao() {
    lyYaoci = [];
    lyCurrentYao = 0;
    lyIsTossing = false;
    
    // 直接显示铜钱投掷区域，初始展示三枚铜钱字面（正面）
    document.getElementById('lyTossArea').style.display = 'block';
    document.getElementById('lyGuaDiv').style.display = 'none';
    
    // 设置三枚铜钱初始显示字面（有字面.png）
    document.getElementById('lyCoin1').src = 'image/有字面.png';
    document.getElementById('lyCoin2').src = 'image/有字面.png';
    document.getElementById('lyCoin3').src = 'image/有字面.png';
    
    // 清空结果显示
    document.getElementById('lyResult').innerHTML = '';
    
    // 重置进度显示
    document.getElementById('lyProgress').textContent = '第 1 爻';
}

// 更新进度显示
function updateLiuYaoProgress() {
    document.getElementById('lyProgress').textContent = `第 ${lyCurrentYao} 爻`;
}

// 投掷铜钱
function tossCoins() {
    if (lyIsTossing) return;
    lyIsTossing = true;
    
    // 第一次投掷时初始化爻序
    if (lyCurrentYao === 0) {
        lyCurrentYao = 1;
        updateLiuYaoProgress();
    }
    
    const coins = [
        document.getElementById('lyCoin1'),
        document.getElementById('lyCoin2'),
        document.getElementById('lyCoin3')
    ];
    
    // 添加滚动动画（添加到wrapper上）
    coins.forEach(coin => {
        coin.parentElement.classList.add('rolling');
    });
    
    // 1.5 秒后停止
    setTimeout(() => {
        coins.forEach(coin => coin.parentElement.classList.remove('rolling'));
        
        // 投掷三枚铜钱
        let total = 0;
        const results = [];
        
        coins.forEach((coin, index) => {
            // 随机生成 2 或 3（2=有字，3=无字）
            const value = Math.random() < 0.5 ? 2 : 3;
            results.push(value);
            total += value;
            
            // 显示铜钱结果：有字面=2，无字面=3
            coin.src = value === 2 ? 'image/有字面.png' : 'image/无字面.png';
        });
        
        // 保存爻的结果
        lyYaoci.push(total);
        
        // 显示结果 - 从下往上显示所有已摇的爻
        let yaociDisplay = '';
        lyYaoci.forEach((yao, index) => {
            yaociDisplay += `<span style="margin: 0 10px;">${yao}</span>`;
        });
        
        let resultText = '';
        if (total === 6) {
            resultText = '老阴';
        } else if (total === 7) {
            resultText = '少阳';
        } else if (total === 8) {
            resultText = '少阴';
        } else if (total === 9) {
            resultText = '老阳';
        }
        
        document.getElementById('lyResult').innerHTML = `第${lyCurrentYao}爻：${total} (${resultText}) <br/> 已摇爻数 (从下往上): ${yaociDisplay}`;
        
        // 0.5 秒后准备下一爻
        setTimeout(() => {
            if (lyCurrentYao < 6) {
                lyCurrentYao++;
                updateLiuYaoProgress();
                lyIsTossing = false;
            } else {
                // 六爻完成，显示卦象
                showLiuYaoResult();
            }
        }, 500);
    }, 1500);
}

// 显示卦象结果
function showLiuYaoResult() {
    document.getElementById('lyTossArea').style.display = 'none';
    document.getElementById('lyGuaDiv').style.display = 'block';
    
    // 根据六爻找出对应的卦
    const gua = findGuaByYaoci(lyYaoci);
    
    if (gua) {
        // 显示 Unicode 卦象符号
        document.getElementById('lySymbol').textContent = gua.symbol;
        
        // 显示卦名
        const upperElement = baguaElement[gua.upper];
        const lowerElement = baguaElement[gua.lower];
        let guaNameDisplay;
        
        if (gua.upper === gua.lower) {
            guaNameDisplay = `${gua.upper}为${baguaElement[gua.upper]}卦`;
        } else {
            guaNameDisplay = `${upperElement}${lowerElement}${gua.shortName}卦`;
        }
        
        document.getElementById('lyGuaName').textContent = guaNameDisplay;
        
        // 保存当前卦
        window.lyCurrentGua = gua;
    }
}

// 根据六爻查找卦
function findGuaByYaoci(yaoci) {
    // 将六爻转换为阴阳（6/8=阴，7/9=阳）
    const yaoyin = yaoci.map(y => (y === 7 || y === 9) ? 1 : 0);
    
    // 下卦由初、二、三爻组成（索引 0,1,2）
    const lowerYao = [yaoyin[0], yaoyin[1], yaoyin[2]];
    // 上卦由四、五、上爻组成（索引 3,4,5）
    const upperYao = [yaoyin[3], yaoyin[4], yaoyin[5]];
    
    const lowerBagua = findBaguaByYaoYinYang(lowerYao);
    const upperBagua = findBaguaByYaoYinYang(upperYao);
    
    if (lowerBagua && upperBagua) {
        return liushisiGua.find(g => g.upper === upperBagua && g.lower === lowerBagua);
    }
    
    return null;
}

// 显示卦象详情（跳转到查询模块）
function showLiuYaoDetail() {
    if (!window.lyCurrentGua) return;
    
    // 切换到查询模块
    showModule('chaxun');
    
    // 显示卦象详情
    showGuaDetail(window.lyCurrentGua, true);
    
    // 自动标记老阴老阳的变爻
    lyYaoci.forEach((yaoValue, index) => {
        const yaoNum = index + 1; // 爻位从 1 开始
        if (yaoValue === 6 || yaoValue === 9) {
            // 老阴或老阳，自动标记为变爻
            toggleYaociChange(yaoNum);
        }
    });
}

// 重置起卦
function resetLiuYao() {
    initLiuYao();
}

// 页面加载完成后初始化
window.onload = function() {
    console.log('易师 - 易经学习工具已加载');
    console.log('六十四卦数据:', liushisiGua.length, '卦');
    console.log('八卦数据:', Object.keys(baguaData).length, '卦');
};
