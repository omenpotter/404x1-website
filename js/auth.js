// auth.js - Multi-Wallet Authentication
// Supports: X1 Wallet (recommended), Backpack, Phantom, MetaMask

// Direct function URLs from Base44 dashboard
window.API_ENDPOINTS = {
    authWallet: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/authWallet',
    chatSend: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatSend',
    chatHistory: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatHistory',
    chatAwardRp: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/chatAwardRp',
    gameSubmit: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/gameSubmit',
    gameLeaderboard: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/gameLeaderboard',
    gameStats: 'https://code-quest-zone.base44.app/api/apps/6988b1920d2dc3e06784fc73/functions/gameStats'
};

// Global state
let currentUser = null;
let selectedWallet = null;

// Detect available wallets
function detectWallets() {
    const wallets = {
        x1: window.ethereum && window.ethereum.isX1,
        backpack: window.backpack,
        phantom: window.phantom?.ethereum,
        metamask: window.ethereum && !window.ethereum.isX1
    };
    return wallets;
}

// Show wallet selection modal
function showWalletModal() {
    const wallets = detectWallets();
    
    // Create modal HTML
    const modalHTML = `
        <div id="wallet-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: #1a1a1a;
                border: 2px solid #00ff00;
                border-radius: 10px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
            ">
                <h2 style="color: #00ff00; margin-bottom: 20px; text-align: center;">Connect Wallet</h2>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${wallets.x1 ? `
                        <button onclick="connectWithWallet('x1')" style="
                            background: linear-gradient(135deg, #00ff00, #00cc00);
                            color: #000;
                            border: none;
                            padding: 15px 20px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        ">
                            <span>X1 Wallet</span>
                            <span style="background: #000; color: #00ff00; padding: 2px 8px; border-radius: 4px; font-size: 12px;">RECOMMENDED</span>
                        </button>
                    ` : `
                        <div style="
                            background: rgba(255, 255, 255, 0.05);
                            padding: 15px 20px;
                            border-radius: 8px;
                            text-align: center;
                            color: #666;
                        ">
                            <div>X1 Wallet (Not Installed)</div>
                            <a href="https://chromewebstore.google.com/detail/kcfmcpdmlchhbikbogddmgopmjbflnae" 
                               target="_blank" 
                               style="color: #00ff00; font-size: 12px; text-decoration: underline;">
                                Install X1 Wallet
                            </a>
                        </div>
                    `}
                    
                    ${wallets.backpack ? `
                        <button onclick="connectWithWallet('backpack')" style="
                            background: #1a1a1a;
                            color: #fff;
                            border: 2px solid #666;
                            padding: 15px 20px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                        ">Backpack</button>
                    ` : ''}
                    
                    ${wallets.phantom ? `
                        <button onclick="connectWithWallet('phantom')" style="
                            background: #1a1a1a;
                            color: #fff;
                            border: 2px solid #666;
                            padding: 15px 20px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                        ">Phantom</button>
                    ` : ''}
                    
                    ${wallets.metamask ? `
                        <button onclick="connectWithWallet('metamask')" style="
                            background: #1a1a1a;
                            color: #fff;
                            border: 2px solid #666;
                            padding: 15px 20px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                        ">MetaMask</button>
                    ` : ''}
                </div>
                
                <button onclick="closeWalletModal()" style="
                    background: transparent;
                    color: #666;
                    border: none;
                    padding: 15px;
                    width: 100%;
                    margin-top: 20px;
                    cursor: pointer;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close wallet modal
function closeWalletModal() {
    const modal = document.getElementById('wallet-modal');
    if (modal) modal.remove();
}

// Connect with selected wallet
async function connectWithWallet(walletType) {
    closeWalletModal();
    
    let provider;
    
    switch(walletType) {
        case 'x1':
            provider = window.ethereum;
            break;
        case 'backpack':
            provider = window.backpack;
            break;
        case 'phantom':
            provider = window.phantom?.ethereum;
            break;
        case 'metamask':
            provider = window.ethereum;
            break;
        default:
            alert('Wallet not supported');
            return;
    }
    
    if (!provider) {
        alert(`${walletType} wallet not found. Please install it first.`);
        return;
    }
    
    selectedWallet = walletType;
    await connectWallet(provider);
}

// Main wallet connection function
async function connectWallet(provider = window.ethereum) {
    try {
        if (!provider) {
            alert('No wallet found. Please install a wallet extension.');
            return;
        }

        // Request account access
        const accounts = await provider.request({ 
            method: 'eth_requestAccounts' 
        });
        const walletAddress = accounts[0];

        // Create message to sign
        const timestamp = Date.now();
        const message = `Sign in to 404x1\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;

        // Request signature
        const signature = await provider.request({
            method: 'personal_sign',
            params: [message, walletAddress]
        });

        // Send to backend
        const response = await fetch(window.API_ENDPOINTS.authWallet, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wallet_address: walletAddress,
                signature: signature,
                message: message,
                username: `user_${walletAddress.slice(2, 10)}`
            })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            currentUser.walletType = selectedWallet || 'unknown';
            localStorage.setItem('404x1_user', JSON.stringify(currentUser));
            
            console.log('Logged in as:', currentUser.username);
            alert(`Welcome ${currentUser.username}!`);
            
            updateUIForLoggedInUser();
        } else {
            alert('Login failed: ' + (data.error || 'Unknown error'));
        }

    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Logout
function logout() {
    currentUser = null;
    selectedWallet = null;
    localStorage.removeItem('404x1_user');
    updateUIForLoggedOutUser();
    alert('Logged out successfully');
}

// Update UI based on login state
function updateUIForLoggedInUser() {
    // Update all login buttons on the page
    const loginButtons = document.querySelectorAll('#login-btn, #authBtn, .nav-cta');
    const userInfoElements = document.querySelectorAll('#user-info, .user-info');
    
    loginButtons.forEach(btn => {
        if (btn) btn.style.display = 'none';
    });
    
    userInfoElements.forEach(userInfo => {
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #00ff00;">${currentUser.username}</span>
                    <span style="color: #fff;">${currentUser.reputation_points} RP</span>
                    <button onclick="logout()" style="
                        background: rgba(255, 0, 0, 0.2);
                        border: 1px solid #ff0000;
                        color: #ff0000;
                        padding: 5px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                    ">LOGOUT</button>
                </div>
            `;
        }
    });
    
    // Enable chat inputs if on chat page
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.placeholder = 'Type your message...';
    }
    if (sendBtn) {
        sendBtn.disabled = false;
    }
}

function updateUIForLoggedOutUser() {
    const loginButtons = document.querySelectorAll('#login-btn, #authBtn, .nav-cta');
    const userInfoElements = document.querySelectorAll('#user-info, .user-info');
    
    loginButtons.forEach(btn => {
        if (btn) btn.style.display = 'block';
    });
    
    userInfoElements.forEach(userInfo => {
        if (userInfo) userInfo.style.display = 'none';
    });
    
    // Disable chat inputs if on chat page
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (messageInput) {
        messageInput.disabled = true;
        messageInput.placeholder = 'Please login to chat';
    }
    if (sendBtn) {
        sendBtn.disabled = true;
    }
}

// Load saved session
function loadSession() {
    const saved = localStorage.getItem('404x1_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        selectedWallet = currentUser.walletType || null;
        updateUIForLoggedInUser();
    }
}

// Setup login button click handlers
function setupLoginButtons() {
    // Find all login buttons
    const loginButtons = document.querySelectorAll('#login-btn, #authBtn, .nav-cta, [onclick*="connectWallet"]');
    
    loginButtons.forEach(btn => {
        // Remove old onclick if exists
        btn.removeAttribute('onclick');
        
        // Add new click handler
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showWalletModal();
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSession();
    setupLoginButtons();
});

// Also try to setup immediately (in case DOM already loaded)
if (document.readyState === 'loading') {
    // Still loading, wait for DOMContentLoaded
} else {
    // DOM already loaded
    loadSession();
    setupLoginButtons();
}

// Make functions globally available
window.connectWithWallet = connectWithWallet;
window.closeWalletModal = closeWalletModal;
window.logout = logout;
window.showWalletModal = showWalletModal;
