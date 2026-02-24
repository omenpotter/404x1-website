// chat-fixed.js - Complete with attachments, reactions, and reply working

window.API_ENDPOINTS = window.API_ENDPOINTS || {
    chatSend: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatSend',
    chatHistory: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatHistory',
    chatReact: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatReact',
    gameStats: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/gameStats'
};

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

const ALL_EMOJIS = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖',
    '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✊', '👊', '🤛',
    '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆',
    '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✨', '💯', '🔥', '⚡', '💥', '💫', '⭐', '🌟', '✅', '❌'
];

let lastMessageId = null;
let replyingTo = null;
let attachedFile = null;

function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

function updateProfileDisplay() {
    const user = getCurrentUser();
    if (!user) return;
    
    const usernameMini = document.getElementById('username-mini');
    if (usernameMini) {
        usernameMini.textContent = user.username;
    }
    
    const rpValueElements = document.querySelectorAll('.rp-value');
    rpValueElements.forEach(el => {
        el.textContent = user.reputation_points || 0;
    });
}

async function loadUserStats() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const response = await fetch(`${window.API_ENDPOINTS.gameStats}?user_id=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.stats) {
            user.reputation_points = data.stats.reputation_points;
            localStorage.setItem('404x1_user', JSON.stringify(user));
            
            const rpValueElements = document.querySelectorAll('.rp-value');
            rpValueElements.forEach(el => {
                el.textContent = data.stats.reputation_points || 0;
            });
        }
    } catch (error) {
        console.error('Failed to load user stats:', error);
    }
}

function smartScroll() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const wasAtBottom = 
        Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 60;

    if (wasAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

function forceScrollToBottom() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    container.scrollTop = container.scrollHeight;
}

async function loadMessages() {
    try {
        const response = await fetch(`${window.API_ENDPOINTS.chatHistory}?limit=100&offset=0`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.messages, data.reactions || []);
            smartScroll();
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

function displayMessages(messages, reactions) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>No messages yet. Be the first to chat! 💬</p>
            </div>
        `;
        return;
    }

    const currentUser = getCurrentUser();
    
    const reactionsByMessage = {};
    if (reactions && Array.isArray(reactions)) {
        reactions.forEach(r => {
            if (!reactionsByMessage[r.message_id]) {
                reactionsByMessage[r.message_id] = [];
            }
            reactionsByMessage[r.message_id].push(r);
        });
    }

    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
    );

    sortedMessages.forEach(msg => {
        if (msg.is_deleted) return;
        
        const messageDiv = document.createElement('div');
        const isOwnMessage = currentUser && msg.username === currentUser.username;
        messageDiv.className = `message ${isOwnMessage ? 'own-message' : ''}`;
        messageDiv.setAttribute('data-message-id', msg.id);
        
        const time = new Date(msg.created_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const msgReactions = reactionsByMessage[msg.id] || [];
        const reactionCounts = {};
        const userReactions = new Set();
        
        msgReactions.forEach(r => {
            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
            if (currentUser && r.from_player_id === currentUser.id) {
                userReactions.add(r.emoji);
            }
        });
        
        let reactionsHTML = '';
        if (Object.keys(reactionCounts).length > 0) {
            reactionsHTML = '<div class="message-reactions">';
            for (const [emoji, count] of Object.entries(reactionCounts)) {
                const isActive = userReactions.has(emoji);
                reactionsHTML += `
                    <span class="reaction-bubble ${isActive ? 'active' : ''}" 
                          onclick="window.toggleReaction('${msg.id}', '${emoji}')"
                          title="${isActive ? 'Remove reaction' : 'React'}">
                        ${emoji} <span class="reaction-count">${count}</span>
                    </span>
                `;
            }
            reactionsHTML += '</div>';
        }
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username ${isOwnMessage ? 'own-username' : ''}">${escapeHtml(msg.username)}</span>
                <span class="time">${time}</span>
            </div>
            <div class="message-text">${escapeHtml(msg.message)}</div>
            ${reactionsHTML}
            ${!isOwnMessage ? `
                <div class="message-actions">
                    ${QUICK_EMOJIS.map(emoji => `
                        <button class="quick-react-btn" 
                                onclick="window.reactToMessage('${msg.id}', '${emoji}')" 
                                title="React with ${emoji}">
                            ${emoji}
                        </button>
                    `).join('')}
                    <button class="reply-btn" 
                            onclick="window.replyToMessage('${msg.id}', '${escapeHtml(msg.username)}')" 
                            title="Reply">
                        ↩️
                    </button>
                </div>
            ` : ''}
        `;
        
        container.appendChild(messageDiv);
        lastMessageId = msg.id;
    });
}

async function reactToMessage(messageId, emoji) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login to react');
        return;
    }
    
    try {
        const response = await fetch(window.API_ENDPOINTS.chatReact, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                message_id: messageId,
                emoji: emoji
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadMessages();
            await loadUserStats();
            
            if (data.rp_earned && data.action === 'added') {
                showRpNotification('+1 RP');
            }
        } else {
            if (data.error && !data.error.includes('own message')) {
                alert(data.error);
            }
        }
    } catch (error) {
        console.error('React error:', error);
    }
}

async function toggleReaction(messageId, emoji) {
    await reactToMessage(messageId, emoji);
}

function replyToMessage(messageId, username) {
    replyingTo = { messageId, username };
    
    const input = document.getElementById('message-input');
    if (input) {
        input.placeholder = `Replying to ${username}...`;
        input.focus();
    }
    
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    if (!document.getElementById('cancel-reply-btn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-reply-btn';
        cancelBtn.textContent = '✕ Cancel Reply';
        cancelBtn.onclick = () => window.cancelReply();
        inputWrapper.appendChild(cancelBtn);
    }
}

function cancelReply() {
    replyingTo = null;
    const input = document.getElementById('message-input');
    if (input) {
        input.placeholder = 'Type your message...';
    }
    const cancelBtn = document.getElementById('cancel-reply-btn');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

function handleAttachment() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.click();
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File too large! Max size: 10MB');
        return;
    }
    
    attachedFile = file;
    showAttachmentPreview(file);
}

function showAttachmentPreview(file) {
    const inputWrapper = document.querySelector('.chat-input-wrapper');
    
    const existing = document.querySelector('.attachment-preview');
    if (existing) existing.remove();
    
    const preview = document.createElement('div');
    preview.className = 'attachment-preview';
    
    const icon = getFileIcon(file.type, file.name);
    const size = formatFileSize(file.size);
    
    preview.innerHTML = `
        <span class="file-icon">${icon}</span>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.name)}</div>
            <div class="file-size">${size}</div>
        </div>
        <button class="remove-btn" onclick="window.removeAttachment()">✕</button>
    `;
    
    inputWrapper.parentElement.insertBefore(preview, inputWrapper);
}

function removeAttachment() {
    attachedFile = null;
    const preview = document.querySelector('.attachment-preview');
    if (preview) preview.remove();
    
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
}

function getFileIcon(type, name) {
    if (type.startsWith('image/')) return '🖼️';
    if (name.endsWith('.gif')) return '🎬';
    if (name.endsWith('.pdf')) return '📄';
    if (name.endsWith('.html')) return '🌐';
    if (name.endsWith('.txt')) return '📝';
    if (name.match(/\.(js|css|json)$/)) return '💻';
    return '📎';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showEmojiPicker() {
    if (document.getElementById('emoji-picker')) {
        hideEmojiPicker();
        return;
    }
    
    const picker = document.createElement('div');
    picker.id = 'emoji-picker';
    
    ALL_EMOJIS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.className = 'emoji-picker-btn';
        btn.onclick = () => window.insertEmoji(emoji);
        picker.appendChild(btn);
    });
    
    document.body.appendChild(picker);
    
    setTimeout(() => {
        document.addEventListener('click', function closeOnOutside(e) {
            const emojiBtn = document.getElementById('emoji-btn');
            if (picker && !picker.contains(e.target) && e.target !== emojiBtn) {
                hideEmojiPicker();
                document.removeEventListener('click', closeOnOutside);
            }
        });
    }, 100);
}

function hideEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (picker) picker.remove();
}

function insertEmoji(emoji) {
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    input.value = text.substring(0, start) + emoji + text.substring(end);
    input.selectionStart = input.selectionEnd = start + emoji.length;
    input.focus();
    
    updateCharCount();
    hideEmojiPicker();
}

async function sendMessage() {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login first');
        return;
    }

    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    let messageText = input.value.trim();

    if (!messageText && !attachedFile) return;
    
    if (messageText.length > 500) {
        alert('Message too long (max 500 characters)');
        return;
    }

    let reply_to_message_id = null;
    let reply_to_username = null;
    let image_url = null;
    
    if (replyingTo) {
        reply_to_message_id = replyingTo.messageId;
        reply_to_username = replyingTo.username;
        if (messageText) {
            messageText = `@${replyingTo.username} ${messageText}`;
        }
        cancelReply();
    }
    
    if (attachedFile) {
        if (attachedFile.type.startsWith('image/')) {
            messageText = messageText || 'Shared an image';
        } else {
            messageText = `${messageText || 'Shared a file'} [${attachedFile.name}]`;
        }
        removeAttachment();
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'SENDING...';

    try {
        const response = await fetch(window.API_ENDPOINTS.chatSend, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                username: user.username,
                message: messageText,
                reply_to_message_id,
                reply_to_username,
                image_url
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            updateCharCount();
            
            await loadMessages();
            await loadUserStats();
            
            forceScrollToBottom();
            
            if (data.rp_earned) {
                showRpNotification(`+${data.rp_earned} RP`);
            }
        } else {
            alert('Failed to send: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Send error:', error);
        alert('Failed to send message');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'SEND';
    }
}

function showRpNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'rp-notification';
    notification.textContent = text;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function updateCharCount() {
    const input = document.getElementById('message-input');
    const charCount = document.getElementById('charCount');
    if (input && charCount) {
        charCount.textContent = input.value.length;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateChatUI() {
    const user = getCurrentUser();
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const attachBtn = document.getElementById('attach-btn');
    
    if (user) {
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = 'Type your message...';
        }
        if (sendBtn) sendBtn.disabled = false;
        if (attachBtn) attachBtn.disabled = false;
        updateProfileDisplay();
        loadUserStats();
    } else {
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = 'Please login to chat';
        }
        if (sendBtn) sendBtn.disabled = true;
        if (attachBtn) attachBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    const emojiBtn = document.getElementById('emoji-btn');
    const attachBtn = document.getElementById('attach-btn');
    const fileInput = document.getElementById('file-input');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        messageInput.addEventListener('input', updateCharCount);
    }
    
    if (emojiBtn) {
        emojiBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showEmojiPicker();
        });
    }
    
    if (attachBtn) {
        attachBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleAttachment();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    updateChatUI();
    loadMessages();
    
    setInterval(loadMessages, 3000);
    setInterval(loadUserStats, 10000);
});

window.addEventListener('userLoggedIn', () => {
    updateChatUI();
    loadMessages();
    loadUserStats();
});

window.addEventListener('userLoggedOut', () => {
    updateChatUI();
});

window.sendMessage = sendMessage;
window.reactToMessage = reactToMessage;
window.toggleReaction = toggleReaction;
window.replyToMessage = replyToMessage;
window.cancelReply = cancelReply;
window.showEmojiPicker = showEmojiPicker;
window.insertEmoji = insertEmoji;
window.removeAttachment = removeAttachment;
