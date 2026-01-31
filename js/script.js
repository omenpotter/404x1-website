// Modal functionality
const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
const modalClose = document.getElementById('modalClose');
const connectX1Wallet = document.getElementById('connectX1Wallet');
const connectPhantomWallet = document.getElementById('connectPhantomWallet');
const connectBackpackWallet = document.getElementById('connectBackpackWallet');
const connectMetaMaskWallet = document.getElementById('connectMetaMaskWallet');
const usernameSetup = document.getElementById('usernameSetup');
const confirmUsernameBtn = document.getElementById('confirmUsernameBtn');
const chatNameInput = document.getElementById('chatNameInput');
const gameNameInput = document.getElementById('gameNameInput');

// Wallet state
let walletAddress = null;
let walletType = null;
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

// Connect X1 Wallet (Recommended)
if (connectX1Wallet) {
    connectX1Wallet.addEventListener('click', async () => {
        try {
            if (typeof window.x1Wallet !== 'undefined') {
                // X1 Wallet detected
                const response = await window.x1Wallet.connect();
                walletAddress = response.publicKey.toString();
                walletType = 'X1';
                handleWalletConnected();
            } else {
                // X1 Wallet not installed
                if (confirm('X1 Wallet is not installed. Would you like to install it now?')) {
                    window.open('https://chromewebstore.google.com/detail/kcfmcpdmlchhbikbogddmgopmjbflnae', '_blank');
                }
            }
        } catch (error) {
            console.error('X1 Wallet connection error:', error);
            alert('Failed to connect X1 Wallet. Please try again.');
        }
    });
}

// Connect Phantom Wallet
if (connectPhantomWallet) {
    connectPhantomWallet.addEventListener('click', async () => {
        try {
            if (typeof window.phantom !== 'undefined' && window.phantom.solana) {
                const response = await window.phantom.solana.connect();
                walletAddress = response.publicKey.toString();
                walletType = 'Phantom';
                handleWalletConnected();
            } else {
                alert('Phantom Wallet is not installed. Please install it from phantom.app');
            }
        } catch (error) {
            console.error('Phantom connection error:', error);
            alert('Failed to connect Phantom Wallet. Please try again.');
        }
    });
}

// Connect Backpack Wallet
if (connectBackpackWallet) {
    connectBackpackWallet.addEventListener('click', async () => {
        try {
            if (typeof window.backpack !== 'undefined') {
                const response = await window.backpack.connect();
                walletAddress = response.publicKey.toString();
                walletType = 'Backpack';
                handleWalletConnected();
            } else {
                alert('Backpack Wallet is not installed. Please install it from backpack.app');
            }
        } catch (error) {
            console.error('Backpack connection error:', error);
            alert('Failed to connect Backpack Wallet. Please try again.');
        }
    });
}

// Connect MetaMask (Ethereum-based)
if (connectMetaMaskWallet) {
    connectMetaMaskWallet.addEventListener('click', async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                walletAddress = accounts[0];
                walletType = 'MetaMask';
                handleWalletConnected();
            } else {
                alert('MetaMask is not installed. Please install it from metamask.io');
            }
        } catch (error) {
            console.error('MetaMask connection error:', error);
            alert('Failed to connect MetaMask. Please try again.');
        }
    });
}

function handleWalletConnected() {
    isConnected = true;
    
    // Check if user already has username
    const userData = localStorage.getItem(`404x1_user_${walletAddress}`);
    
    if (userData) {
        // User exists, log them in
        const user = JSON.parse(userData);
        loginUser(user);
    } else {
        // New user, show username setup
        document.querySelectorAll('.wallet-btn').forEach(btn => btn.style.display = 'none');
        usernameSetup.classList.remove('hidden');
    }
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
            walletType: walletType,
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
    
    // Show success
    console.log('User logged in:', userData);
    alert(`Welcome ${userData.chatName}! Your ${userData.walletType} wallet is connected.`);
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

// Contract Address Copy Functionality
const copyBtn = document.getElementById('copyBtn');
const caAddress = document.getElementById('caAddress');
const copyIcon = document.getElementById('copyIcon');

if (copyBtn && caAddress) {
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(caAddress.textContent);
            copyIcon.textContent = '✅';
            setTimeout(() => {
                copyIcon.textContent = '📋';
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = caAddress.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyIcon.textContent = '✅';
            setTimeout(() => {
                copyIcon.textContent = '📋';
            }, 2000);
        }
    });
}

// Token Data Integration - X1 RPC & xDEX API
const TOKEN_CA = '4o4UheANLdqF4gSV4zWTbCTCercQNSaTm6nVcDetzPb2';
const WXNT_ADDRESS = '111111111111111111111111111111111111111111'; // Native X1
const X1_RPC = 'https://rpc.mainnet.x1.xyz/';
const XDEX_API = 'https://api.xdex.xyz/api/xendex/swap/prepare';

// Fetch Token Price from xDEX
async function fetchTokenPrice() {
    try {
        const response = await fetch(XDEX_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                network: 'X1 Mainnet',
                wallet: '11111111111111111111111111111111', // Dummy wallet for quote
                token_in: WXNT_ADDRESS,
                token_out: TOKEN_CA,
                token_in_amount: 1.0,
                is_exact_amount_in: true
            })
        });

        if (!response.ok) throw new Error('xDEX API error');
        
        const data = await response.json();
        
        // Extract price from response
        if (data.estimatedOutputAmount) {
            const price = parseFloat(data.estimatedOutputAmount);
            document.getElementById('priceXNT').textContent = `${price.toFixed(8)} XNT`;
            return price;
        } else if (data.output_amount) {
            const price = parseFloat(data.output_amount);
            document.getElementById('priceXNT').textContent = `${price.toFixed(8)} XNT`;
            return price;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching price:', error);
        document.getElementById('priceXNT').textContent = 'N/A';
        return null;
    }
}

// Fetch Token Supply and Holders from X1 RPC
async function fetchTokenInfo() {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenSupply',
                params: [TOKEN_CA]
            })
        });

        if (!response.ok) throw new Error('RPC error');
        
        const data = await response.json();
        
        if (data.result && data.result.value) {
            const supply = parseFloat(data.result.value.amount) / Math.pow(10, data.result.value.decimals);
            return { supply, decimals: data.result.value.decimals };
        }
    } catch (error) {
        console.error('Error fetching token supply:', error);
    }
    return null;
}

// Fetch Token Largest Accounts (Top Holders)
async function fetchTopHolders() {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenLargestAccounts',
                params: [TOKEN_CA]
            })
        });

        if (!response.ok) throw new Error('RPC error');
        
        const data = await response.json();
        
        if (data.result && data.result.value) {
            const accounts = data.result.value;
            const totalSupply = accounts.reduce((sum, acc) => sum + parseFloat(acc.amount), 0);
            
            const holderList = document.getElementById('holderList');
            if (holderList) {
                holderList.innerHTML = '';
                
                accounts.slice(0, 3).forEach((account, index) => {
                    const percentage = (parseFloat(account.amount) / totalSupply * 100).toFixed(1);
                    const item = document.createElement('div');
                    item.className = 'holder-item';
                    item.innerHTML = `
                        <span class="holder-rank">#${index + 1}</span>
                        <span class="holder-address">${account.address.slice(0, 4)}...${account.address.slice(-4)}</span>
                        <span class="holder-amount">${percentage}%</span>
                    `;
                    holderList.appendChild(item);
                });
            }
            
            // Set holder count (approximate based on large accounts)
            document.getElementById('holders').textContent = `${accounts.length}+`;
        }
    } catch (error) {
        console.error('Error fetching holders:', error);
        document.getElementById('holders').textContent = 'N/A';
    }
}

// Fetch Recent Transactions
async function fetchRecentTransactions() {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [
                    TOKEN_CA,
                    { limit: 10 }
                ]
            })
        });

        if (!response.ok) throw new Error('RPC error');
        
        const data = await response.json();
        
        if (data.result) {
            const txList = document.getElementById('transactionList');
            if (txList) {
                txList.innerHTML = '';
                
                data.result.slice(0, 3).forEach((tx, index) => {
                    const timeAgo = getTimeAgo(tx.blockTime * 1000);
                    const type = index % 2 === 0 ? 'buy' : 'sell'; // Simplified - would need tx parsing for real type
                    
                    const item = document.createElement('div');
                    item.className = 'transaction-item';
                    item.innerHTML = `
                        <span class="tx-type ${type}">${type.toUpperCase()}</span>
                        <span class="tx-amount">View</span>
                        <span class="tx-time">${timeAgo}</span>
                    `;
                    item.style.cursor = 'pointer';
                    item.onclick = () => window.open(`https://explorer.mainnet.x1.xyz/tx/${tx.signature}`, '_blank');
                    txList.appendChild(item);
                });
            }
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

// Calculate Market Cap
async function calculateMarketCap(price, supply) {
    if (price && supply) {
        const marketCap = price * supply;
        const formatted = marketCap >= 1000000 
            ? `${(marketCap / 1000000).toFixed(2)}M`
            : marketCap >= 1000
            ? `${(marketCap / 1000).toFixed(2)}K`
            : marketCap.toFixed(2);
        
        document.getElementById('marketCap').textContent = `${formatted} XNT`;
    } else {
        document.getElementById('marketCap').textContent = 'N/A';
    }
}

// Helper: Get time ago
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// Initialize all token data
async function initializeTokenData() {
    if (!document.getElementById('priceXNT')) return;
    
    try {
        // Fetch price
        const price = await fetchTokenPrice();
        
        // Fetch token info (supply)
        const tokenInfo = await fetchTokenInfo();
        
        // Calculate market cap
        if (price && tokenInfo) {
            await calculateMarketCap(price, tokenInfo.supply);
        }
        
        // Fetch holders
        await fetchTopHolders();
        
        // Fetch transactions
        await fetchRecentTransactions();
    } catch (error) {
        console.error('Error initializing token data:', error);
    }
}

// Auto-refresh functionality
if (document.getElementById('priceXNT')) {
    // Initial load
    initializeTokenData();
    
    // Refresh price every 10 seconds
    setInterval(async () => {
        const price = await fetchTokenPrice();
        const tokenInfo = await fetchTokenInfo();
        if (price && tokenInfo) {
            await calculateMarketCap(price, tokenInfo.supply);
        }
    }, 10000);
    
    // Refresh other data every 30 seconds
    setInterval(() => {
        fetchTopHolders();
        fetchRecentTransactions();
    }, 30000);
}

// TradingView Chart Integration
function initTradingViewChart() {
    const chartContainer = document.getElementById('tradingview-widget');
    if (!chartContainer) return;
    
    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
        if (typeof TradingView !== 'undefined') {
            new TradingView.widget({
                autosize: true,
                symbol: 'CRYPTO:XNTUSD', // Fallback symbol - customize as needed
                interval: '15',
                timezone: 'Etc/UTC',
                theme: 'dark',
                style: '1',
                locale: 'en',
                toolbar_bg: '#0a0e13',
                enable_publishing: false,
                backgroundColor: '#0a0e13',
                gridColor: '#1a1f2e',
                hide_top_toolbar: false,
                hide_legend: false,
                save_image: false,
                container_id: 'tradingview-widget'
            });
        }
    };
    
    // For now, show a message that chart integration is in progress
    chartContainer.innerHTML = `
        <div style="background: var(--bg-tertiary); padding: 4rem 2rem; text-align: center; border-radius: 8px; border: 1px solid var(--border-color); min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📈</div>
            <p style="color: var(--text-primary); font-size: 1.2rem; margin-bottom: 1rem;">Live Price Chart</p>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Price: <span id="chartPrice">Loading...</span></p>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Real-time data from xDEX</p>
            <a href="https://app.xdex.xyz/swap?fromTokenAddress=${TOKEN_CA}&toTokenAddress=${WXNT_ADDRESS}" 
               target="_blank" 
               rel="noopener noreferrer"
               style="display: inline-block; margin-top: 2rem; padding: 1rem 2rem; background: var(--accent-green); color: var(--bg-primary); border-radius: 4px; text-decoration: none; font-family: 'Rubik Mono One', sans-serif;">
               VIEW ON xDEX
            </a>
        </div>
    `;
    
    // Update chart price
    setInterval(async () => {
        const price = await fetchTokenPrice();
        const chartPriceEl = document.getElementById('chartPrice');
        if (chartPriceEl && price) {
            chartPriceEl.textContent = `${price.toFixed(8)} XNT`;
        }
    }, 5000);
}

// Initialize chart
if (document.getElementById('tradingview-widget')) {
    initTradingViewChart();
}
