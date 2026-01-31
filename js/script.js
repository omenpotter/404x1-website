// Modal functionality
const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
const modalClose = document.getElementById('modalClose');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const usernameSetup = document.getElementById('usernameSetup');
const confirmUsernameBtn = document.getElementById('confirmUsernameBtn');
const chatNameInput = document.getElementById('chatNameInput');
const gameNameInput = document.getElementById('gameNameInput');

// Wallet state
let walletAddress = null;
let isConnected = false;

// Open modal
if (authBtn) {
    authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        authModal.classList.add('active');
    });
}

// Close modal
if (modalClose) {
    modalClose.addEventListener('click', () => {
        authModal.classList.remove('active');
    });
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('active');
    }
});

// Connect Wallet
if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', async () => {
        try {
            // Check if wallet is installed (MetaMask/any Web3 wallet)
            if (typeof window.ethereum !== 'undefined') {
                // Request account access
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                walletAddress = accounts[0];
                isConnected = true;
                
                // Check if user already has username
                const userData = localStorage.getItem(`404x1_user_${walletAddress}`);
                
                if (userData) {
                    // User exists, log them in
                    const user = JSON.parse(userData);
                    loginUser(user);
                } else {
                    // New user, show username setup
                    connectWalletBtn.style.display = 'none';
                    usernameSetup.classList.remove('hidden');
                }
                
            } else {
                alert('Please install MetaMask or another Web3 wallet to continue!');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    });
}

// Confirm Username
if (confirmUsernameBtn) {
    confirmUsernameBtn.addEventListener('click', () => {
        const chatName = chatNameInput.value.trim();
        const gameName = gameNameInput.value.trim();
        
        // Validate usernames
        const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
        
        if (!usernameRegex.test(chatName)) {
            alert('Chat name must be 3-16 characters (letters, numbers, underscore only)');
            return;
        }
        
        if (!usernameRegex.test(gameName)) {
            alert('Game name must be 3-16 characters (letters, numbers, underscore only)');
            return;
        }
        
        // Check reserved words
        const reservedWords = ['admin', 'mod', 'moderator', 'system', 'bot', 'null', 'undefined'];
        if (reservedWords.includes(chatName.toLowerCase()) || reservedWords.includes(gameName.toLowerCase())) {
            alert('This username is reserved. Please choose another.');
            return;
        }
        
        // Create user object
        const userData = {
            walletAddress: walletAddress,
            chatName: chatName,
            gameName: gameName,
            rp: 0,
            role: 'User',
            createdAt: new Date().toISOString(),
            messageCount: 0,
            reactionCount: 0,
            isTrusted: false
        };
        
        // Save permanently (CANNOT BE CHANGED)
        localStorage.setItem(`404x1_user_${walletAddress}`, JSON.stringify(userData));
        localStorage.setItem('404x1_current_user', JSON.stringify(userData));
        
        // Login user
        loginUser(userData);
    });
}

function loginUser(userData) {
    // Update UI
    if (authBtn) {
        authBtn.textContent = `${userData.chatName.substring(0, 8)}...`;
    }
    
    // Close modal
    authModal.classList.remove('active');
    
    // Store current session
    localStorage.setItem('404x1_current_user', JSON.stringify(userData));
    
    // Redirect to chat or show success
    console.log('User logged in:', userData);
    alert(`Welcome ${userData.chatName}! Your wallet is connected.`);
}

// Check if user is already connected
function checkAuth() {
    const currentUser = localStorage.getItem('404x1_current_user');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (authBtn) {
            authBtn.textContent = `${user.chatName.substring(0, 8)}...`;
        }
    }
}

// Matrix falling code effect
function createMatrixEffect() {
    const matrixBg = document.getElementById('matrixBg');
    if (!matrixBg) return;
    
    const chars = '404ERRORX1SVMNOTFOUND01';
    const columns = Math.floor(window.innerWidth / 30);
    
    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.left = `${i * 30 + Math.random() * 20}px`;
        column.style.animationDuration = `${Math.random() * 8 + 12}s`;
        column.style.animationDelay = `${Math.random() * 5}s`;
        
        // Generate random vertical characters
        let text = '';
        const numChars = Math.floor(Math.random() * 15) + 20;
        for (let j = 0; j < numChars; j++) {
            text += chars[Math.floor(Math.random() * chars.length)];
        }
        column.textContent = text;
        
        matrixBg.appendChild(column);
    }
}

// Initialize
checkAuth();
if (document.getElementById('matrixBg')) {
    createMatrixEffect();
}
