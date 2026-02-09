// chat.js - Chat Integration
// Add this to your chat.html page

const API_BASE = 'https://preview-sandbox--b9ecea76254fe996d19766a671cb1856.base44.app';

// Get current user from localStorage
function getCurrentUser() {
    const saved = localStorage.getItem('404x1_user');
    return saved ? JSON.parse(saved) : null;
}

// Load chat messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE}/api/chatHistory?limit=100&offset=0`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.messages);
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

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const time = new Date(msg.created_date).toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username">${msg.username}</span>
                <span class="time">${time}</span>
            </div>
            <div class="message-text">${escapeHtml(msg.message)}</div>
        `;
        
        container.appendChild(messageDiv);
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Send message
async function sendMessage() {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login first');
        return;
    }

    const input = document.getElementById('message-input');
    const messageText = input.value.trim();

    if (!messageText) return;

    if (messageText.length > 500) {
        alert('Message too long (max 500 characters)');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/chatSend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.id,
                message: messageText
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            loadMessages();
        } else {
            alert('Failed to send message: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Send error:', error);
        alert('Failed to send message');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

    loadMessages();
    setInterval(loadMessages, 3000);
});
