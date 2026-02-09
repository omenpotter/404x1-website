// auth.js - Wallet Authentication
// This file defines API_BASE globally for all other scripts

// Define API_BASE on window object so other scripts can access it
window.API_BASE = 'https://b9ecea76254fe996d19766a671cb1856.base44.app';

// Global state
let currentUser = null;
let authToken = null;

// Load saved session
function loadSession() {
    const saved = localStorage.getItem('404x1_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        updateUIForLoggedInUser();
    }
}

// Wallet Login
async function connectWallet() {
    try {
        // Check if wallet is installed
        if (!window.ethereum) {
            alert('Please install MetaMask or X1 Wallet');
            return;
        }

        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        const walletAddress = accounts[0];

        // Create message to sign
        const timestamp = Date.now();
        const message = `Sign in to 404x1\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;

        // Request signature
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, walletAddress]
        });

        // Send to backend
        const response = await fetch(`${window.API_BASE}/api/authWallet`, {
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
    localStorage.removeItem('404x1_user');
    updateUIForLoggedOutUser();
}

// Update UI based on login state
function updateUIForLoggedInUser() {
    // Show username and logout button
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const authBtn = document.getElementById('authBtn');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (authBtn) authBtn.style.display = 'none';
    
    if (userInfo) {
        userInfo.style.display = 'block';
        userInfo.innerHTML = `
            <span>${currentUser.username} (${currentUser.reputation_points} RP)</span>
            <button onclick="logout()">Logout</button>
        `;
    }
}

function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const authBtn = document.getElementById('authBtn');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (authBtn) authBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
}

// Initialize on page load
loadSession();
