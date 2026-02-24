// chat-telegram-style.js - Updated with smart scrolling and Telegram-style bubbles

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

function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

// Update profile display
function updateProfileDisplay() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update mini profile in header
    const usernameMini = document.getElementById('username-mini');
    if (usernameMini) {
        usernameMini.textContent = user.username;
    }
    
    const rpValueElements = document.querySelectorAll('.rp-value');
    rpValueElements.forEach(el => {
        el.textContent = user.reputation_points || 0;
    });
}

// Load user stats
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

// Smart scroll - only auto-scroll if user was at bottom
function smartScroll() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const wasAtBottom = 
        Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 60;

    // Only auto-scroll if user was already at bottom
    if (wasAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

// Force scroll to bottom (for own messages)
function forceScrollToBottom() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    container.scrollTop = container.scrollHeight;
}

// Load messages
async function loadMessages() {
    try {
        const response = await fetch(`${window.API_ENDPOINTS.chatHistory}?limit=100&offset=0`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.messages, data.reactions || []);
            
            // Smart scroll after loading
            smartScroll();
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Display messages with Telegram-style bubbles
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
    
    // Group reactions by message_id
    const reactionsByMessage = {};
    if (reactions && Array.isArray(reactions)) {
        reactions.forEach(r => {
            if (!reactionsByMessage[r.message_id]) {
                reactionsByMessage[r.message_id] = [];
            }
            reactionsByMessage[r.message_id].push(r);
        });
    }

    // Sort oldest to newest
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
        
        // Build reactions
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
                          onclick="toggleReaction('${msg.id}', '${emoji}')"
                          title="${isActive ? 'Remove reaction' : 'React'}">
                        ${emoji} <span class="reaction-count">${count}</span>
                    </span>
                `;
            }
            reactionsHTML += '</div>';
        }
        
        // Telegram-style bubble
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
                                onclick="reactToMessage('${msg.id}', '${emoji}')" 
                                title="React with ${emoji}">
                            ${emoji}
                        </button>
                    `).join('')}
                    <button class="reply-btn" 
                            onclick="replyToMessage('${msg.id}', '${escapeHtml(msg.username)}')" 
                            title="Reply">
                        ↩️
                    </button>
                </div>
            ` : ''}
        `;
        
        container.appendChild(messageDiv);
        
        // Track last message ID for detecting new messages
        lastMessageId = msg.id;
    });
}

// React to message
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
            
            if (data.rp_earned) {
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

// Reply to message
function replyToMessage(messageId, username) {
    replyingTo = { messageId, username };
    
    const input = document.getElementById('message-input');
    if (input) {
        input.placeholder = `Replying to ${username}...`;
        input.focus();
    }
    
    const inputContainer = input.parentElement;
    if (!document.getElementById('cancel-reply-btn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-reply-btn';
        cancelBtn.textContent = '✕ Cancel Reply';
        cancelBtn.onclick = cancelReply;
        inputContainer.style.position = 'relative';
        inputContainer.appendChild(cancelBtn);
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

// Emoji picker
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
        btn.onclick = () => insertEmoji(emoji);
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

// Send message
async function sendMessage() {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login first');
        return;
    }

    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    let messageText = input.value.trim();

    if (!messageText) return;
    
    if (messageText.length > 500) {
        alert('Message too long (max 500 characters)');
        return;
    }

    let reply_to_message_id = null;
    let reply_to_username = null;
    
    if (replyingTo) {
        reply_to_message_id = replyingTo.messageId;
        reply_to_username = replyingTo.username;
        messageText = `@${replyingTo.username} ${messageText}`;
        cancelReply();
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
                reply_to_username
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            updateCharCount();
            
            await loadMessages();
            await loadUserStats();
            
            // Force scroll to bottom for own messages
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

// Show RP notification
function showRpNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'rp-notification';
    notification.textContent = text;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'rpSlideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Character count
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
    
    if (user) {
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = 'Type your message...';
        }
        if (sendBtn) {
            sendBtn.disabled = false;
        }
        updateProfileDisplay();
        loadUserStats();
    } else {
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = 'Please login to chat';
        }
        if (sendBtn) {
            sendBtn.disabled = true;
        }
    }
}

function addEmojiButton() {
    const chatInputWrapper = document.querySelector('.chat-input-wrapper');
    if (!chatInputWrapper || document.getElementById('emoji-btn')) return;
    
    const emojiBtn = document.createElement('button');
    emojiBtn.id = 'emoji-btn';
    emojiBtn.innerHTML = '😊';
    emojiBtn.title = 'Add emoji';
    emojiBtn.type = 'button';
    emojiBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showEmojiPicker();
    };
    
    chatInputWrapper.appendChild(emojiBtn);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');

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

    updateChatUI();
    addEmojiButton();
    loadMessages();
    
    // Auto-refresh with smart scroll
    setInterval(loadMessages, 3000);
    setInterval(loadUserStats, 10000);
});

// Listen for login events
window.addEventListener('userLoggedIn', () => {
    updateChatUI();
    loadMessages();
    loadUserStats();
});

window.addEventListener('userLoggedOut', () => {
    updateChatUI();
});

// Export functions
window.sendMessage = sendMessage;
window.reactToMessage = reactToMessage;
window.toggleReaction = toggleReaction;
window.replyToMessage = replyToMessage;
window.showEmojiPicker = showEmojiPicker;
window.insertEmoji = insertEmoji;
