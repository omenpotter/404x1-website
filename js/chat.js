// chat-with-reactions.js - COMPLETE CHAT WITH EMOJI REACTIONS
// Replace your current js/chat.js with this file

// API endpoints (should already be defined by auth.js)
window.API_ENDPOINTS = window.API_ENDPOINTS || {
    chatSend: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatSend',
    chatHistory: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatHistory',
    chatReact: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatReact',
    gameStats: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/gameStats'
};

// Quick reaction emojis (shown on hover)
const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

// All emojis for picker
const ALL_EMOJIS = [
    // Smileys
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖',
    // Hands
    '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✊', '👊', '🤛',
    '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆',
    '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾',
    // Hearts & Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✨', '💯', '🔥', '⚡', '💥', '💫', '⭐', '🌟', '✅', '❌'
];

function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

// Update profile display
function updateProfileDisplay() {
    const user = getCurrentUser();
    if (!user) return;
    
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = user.username;
    }
    
    const rpValueElement = document.querySelector('.rp-value');
    if (rpValueElement) {
        rpValueElement.textContent = user.reputation_points || 0;
    }
}

// Load user stats from backend
async function loadUserStats() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        const response = await fetch(`${window.API_ENDPOINTS.gameStats}?user_id=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.stats) {
            // Update RP in localStorage
            user.reputation_points = data.stats.reputation_points;
            localStorage.setItem('404x1_user', JSON.stringify(user));
            
            // Update display
            const rpValueElement = document.querySelector('.rp-value');
            if (rpValueElement) {
                rpValueElement.textContent = data.stats.reputation_points || 0;
            }
            
            // Update message count
            const messageCountElement = document.getElementById('messageCount');
            if (messageCountElement) {
                messageCountElement.textContent = data.stats.messages_sent || 0;
            }
        }
    } catch (error) {
        console.error('Failed to load user stats:', error);
    }
}

// Load messages with reactions
async function loadMessages() {
    try {
        const response = await fetch(`${window.API_ENDPOINTS.chatHistory}?limit=100&offset=0`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.messages, data.reactions || []);
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Display messages with reactions
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

    // Sort messages: oldest to newest (newest at bottom)
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
    );

    sortedMessages.forEach(msg => {
        // Skip deleted messages
        if (msg.is_deleted) return;
        
        const messageDiv = document.createElement('div');
        const isOwnMessage = currentUser && msg.username === currentUser.username;
        messageDiv.className = `message ${isOwnMessage ? 'own-message' : ''}`;
        messageDiv.setAttribute('data-message-id', msg.id);
        
        const time = new Date(msg.created_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Build reactions display
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
        
        // Message content
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
    });

    // Scroll to bottom to show newest messages
    container.scrollTop = container.scrollHeight;
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
            // Reload messages to show updated reactions
            await loadMessages();
            // Refresh RP count
            await loadUserStats();
        } else {
            if (data.error && !data.error.includes('own message')) {
                alert(data.error);
            }
        }
    } catch (error) {
        console.error('React error:', error);
        // If backend not ready, show placeholder
        alert('Emoji reactions will be enabled soon! 😊');
    }
}

// Toggle reaction (remove if already reacted with same emoji)
async function toggleReaction(messageId, emoji) {
    await reactToMessage(messageId, emoji);
}

// Reply to message
let replyingTo = null;

function replyToMessage(messageId, username) {
    replyingTo = { messageId, username };
    
    const input = document.getElementById('message-input');
    if (input) {
        input.placeholder = `Replying to ${username}...`;
        input.focus();
    }
    
    // Show cancel reply button
    const inputContainer = input.parentElement;
    if (!document.getElementById('cancel-reply-btn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-reply-btn';
        cancelBtn.textContent = '✕ Cancel Reply';
        cancelBtn.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 100, 100, 0.2);
            border: 1px solid #ff6464;
            color: #ff6464;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            z-index: 10;
        `;
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

// Emoji picker for message input
function showEmojiPicker() {
    // Close if already open
    if (document.getElementById('emoji-picker')) {
        hideEmojiPicker();
        return;
    }
    
    const picker = document.createElement('div');
    picker.id = 'emoji-picker';
    picker.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 30px;
        background: #1a1a1a;
        border: 2px solid #00ff00;
        border-radius: 10px;
        padding: 15px;
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 5px;
        max-width: 500px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
    `;
    
    ALL_EMOJIS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.className = 'emoji-picker-btn';
        btn.style.cssText = `
            background: transparent;
            border: none;
            font-size: 26px;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            transition: all 0.2s;
            line-height: 1;
        `;
        btn.onmouseover = () => btn.style.background = 'rgba(0, 255, 0, 0.2)';
        btn.onmouseout = () => btn.style.background = 'transparent';
        btn.onclick = () => insertEmoji(emoji);
        picker.appendChild(btn);
    });
    
    document.body.appendChild(picker);
    
    // Close on click outside
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

    // Handle reply
    let reply_to_message_id = null;
    let reply_to_username = null;
    
    if (replyingTo) {
        reply_to_message_id = replyingTo.messageId;
        reply_to_username = replyingTo.username;
        messageText = `@${replyingTo.username} ${messageText}`;
        cancelReply();
    }

    // Disable button while sending
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
            await loadMessages();
            await loadUserStats(); // Update RP
            
            // Show RP earned if backend returns it
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
    notification.textContent = text;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 255, 0, 0.2);
        border: 2px solid #00ff00;
        color: #00ff00;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
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
    const chatInput = document.querySelector('.chat-input');
    if (!chatInput || document.getElementById('emoji-btn')) return;
    
    const emojiBtn = document.createElement('button');
    emojiBtn.id = 'emoji-btn';
    emojiBtn.innerHTML = '😊';
    emojiBtn.title = 'Add emoji';
    emojiBtn.type = 'button';
    emojiBtn.style.cssText = `
        position: absolute;
        right: 80px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: all 0.2s;
        z-index: 10;
    `;
    emojiBtn.onmouseover = () => emojiBtn.style.background = 'rgba(0, 255, 0, 0.2)';
    emojiBtn.onmouseout = () => emojiBtn.style.background = 'transparent';
    emojiBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showEmojiPicker();
    };
    
    chatInput.style.position = 'relative';
    chatInput.appendChild(emojiBtn);
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
    }

    updateChatUI();
    addEmojiButton();
    loadMessages();
    
    // Auto-refresh
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
