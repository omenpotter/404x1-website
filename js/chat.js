// Chat functionality
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const charCount = document.getElementById('charCount');
const emojiBtn = document.getElementById('emojiBtn');
const imageBtn = document.getElementById('imageBtn');

// Simulate user data (replace with actual auth)
let userData = {
    username: 'Guest User',
    rp: 0,
    role: 'User',
    messageCount: 0,
    reactionCount: 0,
    isTrusted: false,
    isLoggedIn: false
};

// Check if user is logged in
function initChat() {
    const authData = localStorage.getItem('404x1_auth');
    if (authData) {
        userData = JSON.parse(authData);
        userData.isLoggedIn = true;
        updateUserProfile();
        enableChat();
    }
}

function updateUserProfile() {
    document.getElementById('username').textContent = userData.username;
    document.querySelector('.rp-value').textContent = userData.rp;
    document.getElementById('messageCount').textContent = userData.messageCount;
    document.getElementById('reactionCount').textContent = userData.reactionCount;
    document.getElementById('userRole').textContent = userData.role;
    
    // Update trusted status
    if (userData.rp >= 100) {
        userData.isTrusted = true;
        userData.role = 'Trusted';
    }
}

function enableChat() {
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.placeholder = 'Type your message...';
    
    if (userData.isTrusted) {
        imageBtn.disabled = false;
    }
}

// Character count
if (messageInput) {
    messageInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = length;
        
        if (length > 450) {
            charCount.style.color = 'var(--error-red)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });
}

// Send message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !userData.isLoggedIn) return;
    
    if (text.length > 500) {
        alert('Message too long! Maximum 500 characters.');
        return;
    }
    
    // Create message element
    const messageDiv = createMessageElement({
        avatar: '👤',
        author: userData.username,
        text: text,
        time: getCurrentTime(),
        isTrusted: userData.isTrusted
    });
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Clear input
    messageInput.value = '';
    charCount.textContent = '0';
    
    // Update RP
    userData.rp += 2;
    userData.messageCount += 1;
    updateUserProfile();
    saveUserData();
    
    // Check for trusted unlock
    if (userData.rp >= 100 && !userData.isTrusted) {
        showSystemMessage('🎉 Congratulations! You reached 100 RP and unlocked Trusted role!');
        imageBtn.disabled = false;
    }
}

function createMessageElement(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const authorClass = data.isTrusted ? 'trusted' : '';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${data.avatar}</div>
        <div class="message-content">
            <span class="message-author ${authorClass}">${data.author}</span>
            <span class="message-text">${escapeHtml(data.text)}</span>
            <span class="message-time">${data.time}</span>
        </div>
        <div class="message-reactions">
            <button class="reaction" onclick="addReaction(this, '👍')">👍</button>
            <button class="reaction" onclick="addReaction(this, '🔥')">🔥</button>
            <button class="reaction" onclick="addReaction(this, '🎮')">🎮</button>
        </div>
    `;
    
    return messageDiv;
}

function showSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system-message';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-author system">SYSTEM</span>
            <span class="message-text">${text}</span>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addReaction(button, emoji) {
    if (!userData.isLoggedIn) {
        alert('Please login to react to messages');
        return;
    }
    
    const currentText = button.textContent.trim();
    const hasEmoji = currentText.includes(emoji);
    
    if (hasEmoji) {
        const count = parseInt(currentText.match(/\d+/)?.[0] || 0);
        button.textContent = `${emoji} ${count + 1}`;
    } else {
        button.textContent = `${emoji} 1`;
    }
    
    // Update RP
    userData.rp += 1;
    userData.reactionCount += 1;
    updateUserProfile();
    saveUserData();
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveUserData() {
    localStorage.setItem('404x1_auth', JSON.stringify(userData));
}

// Event listeners
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

// Emoji button (placeholder)
if (emojiBtn) {
    emojiBtn.addEventListener('click', () => {
        if (!userData.isLoggedIn) {
            alert('Please login to use emojis');
            return;
        }
        // Add emoji picker functionality here
        const emojis = ['😊', '😂', '🔥', '💎', '🎮', '⚡', '👍', '🎉', '💪', '🚀'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        messageInput.value += emoji;
        messageInput.focus();
    });
}

// Image button (placeholder)
if (imageBtn) {
    imageBtn.addEventListener('click', () => {
        if (!userData.isTrusted) {
            alert('Images require Trusted role (100 RP)');
            return;
        }
        alert('Image upload functionality - connect to backend');
    });
}

// Auto-scroll to bottom on load
window.addEventListener('load', () => {
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});

// Initialize chat
initChat();

// Simulate online users count update
setInterval(() => {
    const onlineUsers = document.getElementById('onlineUsers');
    if (onlineUsers) {
        const currentCount = parseInt(onlineUsers.textContent);
        const change = Math.floor(Math.random() * 5) - 2;
        const newCount = Math.max(100, currentCount + change);
        onlineUsers.textContent = newCount;
    }
}, 10000);
