const chatArea = document.getElementById('chat-area');
const optionsContainer = document.getElementById('options-container');

let currentScale = 1.0;
const BUBBLE_MAX_SCALE = 1.8;
const SCALE_STEP = 0.4;
let isLooping = false;

// 模拟发送消息
function appendMessage(side, text, scale = 1.0) {
    const wrapper = document.createElement('div');
    wrapper.className = `msg-wrapper ${side}`;
    
    // 头像
    const avatar = document.createElement('div');
    avatar.className = `avatar`;
    const img = document.createElement('img');
    if (side === 'left') {
        img.src = 'icon1.jpg';
        img.alt = '萌萌';
    } else {
        img.src = 'icon2.jpg';
        img.alt = '我';
    }
    avatar.appendChild(img);
    
    // 气泡
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = text;
    
    // 应用缩放效果 (仅针对左侧循环消息)
    if (side === 'left' && isLooping && scale > 1.0) {
        bubble.style.transform = `scale(${scale})`;
        bubble.style.transformOrigin = 'left center';
        // 增加边距防止重叠
        wrapper.style.marginBottom = `${(scale - 1) * 30}px`;
        wrapper.style.marginTop = `${(scale - 1) * 20}px`;
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chatArea.appendChild(wrapper);
    
    // 自动滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 清除并显示新按钮
function showOptions(options) {
    optionsContainer.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = `btn-option ${opt.class || ''}`;
        btn.innerText = opt.text;
        
        // 动态缩放逻辑 - 使用物理尺寸而非 transform 以产生挤压感
        if (isLooping) {
            if (opt.id === 'yes') {
                // "那好吧" 按钮持续增长
                const s = currentScale;
                btn.style.fontSize = `${14 + (s - 1) * 8}px`;
                btn.style.padding = `${10 + (s - 1) * 5}px ${20 + (s - 1) * 10}px`;
                btn.style.flexShrink = "0"; // 保证大按钮不被压缩
            } else if (opt.id === 'no') {
                // "我不要" 按钮被挤压变小
                const s = Math.max(0.5, 1 - (currentScale - 1) * 0.4);
                btn.style.fontSize = `${14 * s}px`;
                btn.style.padding = `${10 * s}px ${20 * s}px`;
                btn.style.opacity = Math.max(0.3, s);
                btn.style.flexShrink = "1"; // 允许小按钮被压缩
            }
        }

        btn.onclick = () => {
            handleChoice(opt.id, opt.text);
        };
        optionsContainer.appendChild(btn);
    });
}

// 核心逻辑控制
async function handleChoice(id, text) {
    // 1. 用户发送
    appendMessage('right', text);
    optionsContainer.innerHTML = ''; // 暂时隐藏按钮

    await new Promise(r => setTimeout(r, 600));

    // 2. 对方回复
    if (!isLooping) {
        if (id === 'ok') { // 我愿意
            appendMessage('left', '最爱你了QwQ');
            // 结束
        } else if (id === 'no') { // 我不要 (第一次拒绝)
            appendMessage('left', '你不喜欢萌萌的我吗？');
            isLooping = true;
            await new Promise(r => setTimeout(r, 400));
            showOptions([
                { id: 'yes', text: '那好吧', class: 'big' },
                { id: 'no', text: '我不要' }
            ]);
        }
    } else {
        // 循环阶段
        if (id === 'yes') { // 那好吧
            if (currentScale === 1.0) {
                appendMessage('left', '我就知道你是爱我的！');
            } else {
                appendMessage('left', '爱你爱你');
            }
            isLooping = false;
            // 逻辑结束
        } else if (id === 'no') { // 连环拒绝
            currentScale += SCALE_STEP; // 按钮持续增加
            const bubbleScale = Math.min(BUBBLE_MAX_SCALE, currentScale); // 气泡上限 1.8
            appendMessage('left', '真的不要萌萌的我吗？', bubbleScale);
            
            await new Promise(r => setTimeout(r, 400));
            showOptions([
                { id: 'yes', text: '那好吧', class: 'big' },
                { id: 'no', text: '我不要' }
            ]);
        }
    }
}

// 更新现实时间
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}`;
}

// 表情面板逻辑
const emojiToggle = document.getElementById('emoji-toggle');
const emojiPanel = document.getElementById('emoji-panel');
const actionOverlay = document.getElementById('action-overlay');
const emojiIcon = document.getElementById('emoji-icon');
const keyboardIcon = document.getElementById('keyboard-icon');
const emojiGrid = document.getElementById('emoji-grid');
const wechatFooter = document.getElementById('wechat-footer');

let isEmojiOpen = false;

emojiToggle.onclick = () => {
    isEmojiOpen = !isEmojiOpen;
    if (isEmojiOpen) {
        emojiPanel.classList.add('open');
        actionOverlay.classList.add('hidden');
        wechatFooter.classList.add('shifted');
        chatArea.classList.add('shifted');
        emojiIcon.style.display = 'none';
        keyboardIcon.style.display = 'block';
    } else {
        emojiPanel.classList.remove('open');
        actionOverlay.classList.remove('hidden');
        wechatFooter.classList.remove('shifted');
        chatArea.classList.remove('shifted');
        emojiIcon.style.display = 'block';
        keyboardIcon.style.display = 'none';
    }
    // 延迟滚动确保动画完成
    setTimeout(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
    }, 300);
};

// 填充表情网格
function fillEmojiGrid() {
    emojiGrid.innerHTML = '';
    // 添加一个加号作为第一个占位
    const addItem = document.createElement('div');
    addItem.className = 'emoji-item';
    addItem.style.border = '1px dashed #ccc';
    addItem.style.background = 'transparent';
    addItem.innerHTML = '<span style="font-size: 24px; color: #ccc">+</span>';
    emojiGrid.appendChild(addItem);

    // 填充用户指定的表情包 img.jpg (5列 x 3行 = 15个，已占位一个，循环14次)
    for (let i = 0; i < 14; i++) {
        const item = document.createElement('div');
        item.className = 'emoji-item';
        const img = document.createElement('img');
        img.src = 'img.jpg';
        item.appendChild(img);
        emojiGrid.appendChild(item);
    }
}

// 初始化
window.onload = async () => {
    updateClock();
    setInterval(updateClock, 1000);
    fillEmojiGrid();
    
    await new Promise(r => setTimeout(r, 1000));
    appendMessage('left', '可以成为我的对象吗？');
    
    await new Promise(r => setTimeout(r, 600));
    showOptions([
        { id: 'ok', text: '我愿意', class: 'big' },
        { id: 'no', text: '我不要' }
    ]);
};
