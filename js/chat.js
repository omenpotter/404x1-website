// chat.js - Chat Integration with Player Entity
// Uses window.API_ENDPOINTS from auth.js

// Get current user from localStorage
function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

// Load chat messages
async function loadMessages() {
    try {
        const response = await fetch(`${window.API_ENDPOINTS.chatHistory}?limit=100&offset=0`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.messages);
            updateOnlineCount(data.online_count || 0);
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Display messages in UI
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

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const time = new Date(msg.created_date).toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username">${escapeHtml(msg.username)}</span>
                <span class="time">${time}</span>
            </div>
            <div class="message-text">${escapeHtml(msg.message)}</div>
        `;
        
        container.appendChild(messageDiv);
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
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
    const messageText = input.value.trim();

    if (!messageText) return;

    if (messageText.length > 500) {
        alert('Message too long (max 500 characters)');
        return;
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
                user_id: user.id, // Backend may still use user_id
                username: user.username, // Include username too
                message: messageText
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            await loadMessages();
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

    // Load messages and start auto-refresh
    loadMessages();
    setInterval(loadMessages, 3000); // Refresh every 3 seconds
});
