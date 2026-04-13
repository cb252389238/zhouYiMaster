// ==================== 通用 UI 工具 ====================
function clearAppToastContent() {
    const content = document.getElementById('appToastContent')
    if (content) {
        content.innerHTML = ''
    }
    return content
}

function createToastButton(text, onClick, background = '') {
    const button = document.createElement('button')
    button.className = 'toast-btn'
    if (background) {
        button.style.background = background
    }
    button.textContent = text
    button.onclick = onClick
    return button
}

function appendToastMessage(content, message) {
    const lines = String(message ?? '').split('<br>')
    lines.forEach((line, index) => {
        if (index > 0) {
            content.appendChild(document.createElement('br'))
        }

        if (line.includes('<span') || line.includes('</span>')) {
            const wrapper = document.createElement('span')
            wrapper.innerHTML = line
            content.appendChild(wrapper)
        } else {
            content.appendChild(document.createTextNode(line))
        }
    })
}

function showAppToast(message, callback) {
    const toast = document.getElementById('appToast')
    const content = clearAppToastContent()
    appendToastMessage(content, message)
    content.appendChild(document.createElement('br'))
    content.appendChild(createToastButton('确定', () => closeAppToast()))
    toast.style.display = 'block'
    window._toastCallback = callback
}

function closeAppToast() {
    const toast = document.getElementById('appToast')
    toast.style.display = 'none'
    if (window._toastCallback) {
        window._toastCallback()
        window._toastCallback = null
    }
}

function showAppConfirm(message, onConfirm, onCancel) {
    const toast = document.getElementById('appToast')
    const content = clearAppToastContent()
    appendToastMessage(content, message)
    content.appendChild(document.createElement('br'))

    const buttonRow = document.createElement('div')
    buttonRow.style.display = 'flex'
    buttonRow.style.gap = '10px'
    buttonRow.style.justifyContent = 'center'
    buttonRow.style.marginTop = '15px'
    buttonRow.appendChild(createToastButton('取消', () => closeAppConfirm(false), '#999'))
    buttonRow.appendChild(createToastButton('确定', () => closeAppConfirm(true)))
    content.appendChild(buttonRow)

    toast.style.display = 'block'
    window._confirmCallbacks = { onConfirm: onConfirm, onCancel: onCancel }
}

function closeAppConfirm(confirmed) {
    const toast = document.getElementById('appToast')
    toast.style.display = 'none'
    if (window._confirmCallbacks) {
        if (confirmed && window._confirmCallbacks.onConfirm) {
            window._confirmCallbacks.onConfirm()
        } else if (!confirmed && window._confirmCallbacks.onCancel) {
            window._confirmCallbacks.onCancel()
        }
        window._confirmCallbacks = null
    }
}

function showAppPrompt(message, defaultValue, onConfirm) {
    const toast = document.getElementById('appToast')
    const content = clearAppToastContent()
    appendToastMessage(content, message)
    content.appendChild(document.createElement('br'))

    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'appPromptInput'
    input.value = defaultValue || ''
    input.style.marginTop = '15px'
    input.style.padding = '10px'
    input.style.width = '100%'
    input.style.border = '1px solid #ddd'
    input.style.borderRadius = '5px'
    input.style.boxSizing = 'border-box'
    content.appendChild(input)

    const buttonRow = document.createElement('div')
    buttonRow.style.display = 'flex'
    buttonRow.style.gap = '10px'
    buttonRow.style.justifyContent = 'center'
    buttonRow.style.marginTop = '15px'
    buttonRow.appendChild(createToastButton('取消', () => closeAppPrompt(false), '#999'))
    buttonRow.appendChild(createToastButton('确定', () => closeAppPrompt(true)))
    content.appendChild(buttonRow)

    toast.style.display = 'block'
    window._promptCallback = onConfirm
}

function closeAppPrompt(confirmed) {
    const toast = document.getElementById('appToast')
    toast.style.display = 'none'
    if (window._promptCallback) {
        if (confirmed) {
            const input = document.getElementById('appPromptInput')
            window._promptCallback(input.value)
        }
        window._promptCallback = null
    }
}

function formatDisplayText(value, fallback = '') {
    const text = String(value ?? '').trim()
    return text ? escapeHtml(text) : escapeHtml(fallback)
}
