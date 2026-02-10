// chat-fixed-complete.js - Complete Chat with All Fixes
// Fixes: Message order, RP tracking, username display, emoji support

// Get current user from localStorage
function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

// Update profile display with user info
function updateProfileDisplay() {
    const user = getCurrentUser();
    
    if (user) {
        // Update username
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
        
        // Update RP
        const rpValueElement = document.querySelector('.rp-value');
        if (rpValueElement) {
            rpValueElement.textContent = user.reputation_points || 0;
        }
    }
}

// Get user stats from backend
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
            
            // Update displays
            const rpValueElement = document.querySelector('.rp-value');
            if (rpValueElement) {
                rpValueElement.textContent = data.stats.reputation_points || 0;
            }
        }
    } catch (error) {
        console.error('Failed to load user stats:', error);
    }
}

// Load chat messages
async function loadMessages() {
    try {
        const response = await fetch(`${window.API_ENDPOINTS.chatHistory}?limit=100&offset=0`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.messages);
            updateOnlineCount(data.online_count || 0);
            
            // Update message count for current user
            const user = getCurrentUser();
            if (user) {
                const userMessages = data.messages.filter(m => m.username === user.username);
                const messageCountElement = document.getElementById('messageCount');
                if (messageCountElement) {
                    messageCountElement.textContent = userMessages.length;
                }
            }
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Display messages in UI (NEWEST AT BOTTOM)
function displayMessages(messages) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px;
                color: #666;
            ">
                <p>No messages yet. Be the first to chat! 💬</p>
            </div>
        `;
        return;
    }

    const currentUser = getCurrentUser();

    // Sort messages: OLDEST to NEWEST (so newest appears at bottom)
    const sortedMessages = [...messages].sort((a, b) => {
        return new Date(a.created_date) - new Date(b.created_date);
    });

    sortedMessages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        const isOwnMessage = currentUser && msg.username === currentUser.username;
        messageDiv.className = `message ${isOwnMessage ? 'own-message' : ''}`;
        
        const time = new Date(msg.created_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username ${isOwnMessage ? 'own-username' : ''}">${escapeHtml(msg.username)}</span>
                <span class="time">${time}</span>
            </div>
            <div class="message-text">${escapeHtml(msg.message)}</div>
            <div class="message-actions">
                <button class="emoji-react-btn" onclick="showEmojiReactions('${msg.id}')" title="React">
                    <span>😊</span>
                </button>
                <button class="reply-btn" onclick="replyToMessage('${msg.id}', '${escapeHtml(msg.username)}')" title="Reply">
                    ↩️
                </button>
            </div>
        `;
        
        container.appendChild(messageDiv);
    });

    // Scroll to bottom to show newest messages
    container.scrollTop = container.scrollHeight;
}

// Emoji reactions
const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '😢', '😮'];

function showEmojiReactions(messageId) {
    alert('Emoji reactions coming soon! For now, use emoji in your messages. 😊');
    // TODO: Implement emoji reactions storage
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

// Insert emoji at cursor
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

// Show emoji picker
function showEmojiPicker() {
    if (document.getElementById('emoji-picker')) {
        hideEmojiPicker();
        return;
    }
    
    const allEmojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✨', '💯', '🔥',
        '💪', '👀', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'
    ];
    
    const picker = document.createElement('div');
    picker.id = 'emoji-picker';
    picker.style.cssText = `
        position: absolute;
        bottom: 60px;
        right: 20px;
        background: #1a1a1a;
        border: 2px solid #00ff00;
        border-radius: 10px;
        padding: 15px;
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 5px;
        max-width: 400px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
    `;
    
    allEmojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.style.cssText = `
            background: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
            border-radius: 5px;
            transition: all 0.2s;
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
            if (!picker.contains(e.target) && e.target.id !== 'emoji-btn') {
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

// Update online count
function updateOnlineCount(count) {
    const onlineUsersElement = document.getElementById('onlineUsers');
    if (onlineUsersElement) {
        onlineUsersElement.textContent = count || 0;
    }
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

    // Add reply prefix if replying
    if (replyingTo) {
        messageText = `@${replyingTo.username} ${messageText}`;
        cancelReply();
    }

    // Disable while sending
    sendBtn.disabled = true;
    sendBtn.textContent = 'SENDING...';

    try {
        const response = await fetch(window.API_ENDPOINTS.chatSend, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.id,
                username: user.username,
                message: messageText
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            await loadMessages();
            
            // Refresh user stats to get updated RP
            await loadUserStats();
        } else {
            alert('Failed to send message: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Send error:', error);
        alert('Failed to send message');
    } finally {
        // Re-enable button
        sendBtn.disabled = false;
        sendBtn.textContent = 'SEND';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update UI based on login state
function updateChatUI() {
    const user = getCurrentUser();
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (user) {
        // Logged in - enable chat
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = 'Type your message...';
        }
        if (sendBtn) {
            sendBtn.disabled = false;
        }
        
        // Update profile display
        updateProfileDisplay();
        
        // Load user stats
        loadUserStats();
    } else {
        // Not logged in - disable chat
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = 'Please login to chat';
        }
        if (sendBtn) {
            sendBtn.disabled = true;
        }
    }
}

// Add emoji button to input
function addEmojiButton() {
    const chatInput = document.querySelector('.chat-input');
    if (!chatInput || document.getElementById('emoji-btn')) return;
    
    const emojiBtn = document.createElement('button');
    emojiBtn.id = 'emoji-btn';
    emojiBtn.innerHTML = '😊';
    emojiBtn.title = 'Add emoji';
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
    `;
    emojiBtn.onmouseover = () => emojiBtn.style.background = 'rgba(0, 255, 0, 0.2)';
    emojiBtn.onmouseout = () => emojiBtn.style.background = 'transparent';
    emojiBtn.onclick = (e) => {
        e.stopPropagation();
        showEmojiPicker();
    };
    
    chatInput.style.position = 'relative';
    chatInput.appendChild(emojiBtn);
}

// Event listeners
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

    // Update UI based on login state
    updateChatUI();
    
    // Add emoji button
    addEmojiButton();

    // Load messages and start auto-refresh
    loadMessages();
    setInterval(loadMessages, 3000);
    
    // Refresh user stats every 10 seconds
    setInterval(loadUserStats, 10000);
});

// Listen for login events from auth.js
window.addEventListener('userLoggedIn', () => {
    updateChatUI();
    loadMessages();
    loadUserStats();
});

window.addEventListener('userLoggedOut', () => {
    updateChatUI();
});

// Make functions globally available
window.sendMessage = sendMessage;
window.insertEmoji = insertEmoji;
window.showEmojiPicker = showEmojiPicker;
window.replyToMessage = replyToMessage;
window.showEmojiReactions = showEmojiReactions;
