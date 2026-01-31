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
const WXNT_ADDRESS = 'So11111111111111111111111111111111111111112'; // Native SOL equivalent on X1
const X1_RPC = 'https://rpc.mainnet.x1.xyz/';
const XDEX_API = 'https://api.xdex.xyz/api/xendex/swap/prepare';

let currentPrice = null;
let tokenDecimals = 9; // Default, will be updated

// Fetch Token Price from xDEX with better error handling
async function fetchTokenPrice() {
    try {
        console.log('Fetching price via proxy API...');
        
        // Use Vercel serverless function proxy to avoid CORS
        const response = await fetch('/api/price', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Price API Response:', data);
        
        if (data.success && data.price) {
            const price = data.price;
            currentPrice = price;
            document.getElementById('priceXNT').textContent = `${price.toFixed(8)} XNT`;
            return price;
        } else {
            console.error('Price API error:', data.error || 'Unknown error');
            throw new Error(data.error || 'Invalid price data');
        }
    } catch (error) {
        console.error('Error fetching price:', error);
        
        // Show appropriate message
        if (currentPrice) {
            document.getElementById('priceXNT').textContent = `${currentPrice.toFixed(8)} XNT`;
        } else if (error.message.includes('404')) {
            document.getElementById('priceXNT').textContent = 'API not deployed';
        } else {
            document.getElementById('priceXNT').textContent = 'Loading...';
        }
        
        return currentPrice; // Return cached price
    }
}

// Fetch Token Supply
async function fetchTokenSupply() {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenSupply',
                params: [TOKEN_CA]
            })
        });

        const data = await response.json();
        console.log('Token Supply Response:', data);
        
        if (data.result && data.result.value) {
            tokenDecimals = data.result.value.decimals;
            const supply = parseFloat(data.result.value.amount) / Math.pow(10, tokenDecimals);
            return supply;
        }
    } catch (error) {
        console.error('Error fetching supply:', error);
    }
    return null;
}

// Fetch ALL Token Holders (not just largest)
async function fetchAllHolders() {
    try {
        console.log('Fetching all holders...');
        
        // First get the largest accounts
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenLargestAccounts',
                params: [TOKEN_CA]
            })
        });

        const data = await response.json();
        console.log('Holders Response:', data);
        
        if (data.result && data.result.value) {
            const accounts = data.result.value;
            
            // Calculate total from these accounts
            const totalFromAccounts = accounts.reduce((sum, acc) => 
                sum + parseFloat(acc.amount), 0
            );
            
            // Display actual holder count
            document.getElementById('holders').textContent = `${accounts.length} holders`;
            
            // Display top holders list
            const holderList = document.getElementById('holderList');
            if (holderList) {
                // Don't clear - show loading message
                holderList.innerHTML = '<div class="loading-more">Loading owner addresses (this may take a minute)...</div>';
                
                // Get owner addresses (skip first account - usually pool/program)
                const holdersWithOwners = [];
                
                // Start from index 1 to skip the first account, load up to 250
                const maxHolders = Math.min(accounts.length, 250);
                
                for (let i = 1; i < maxHolders; i++) {
                    const account = accounts[i];
                    
                    // Show progress every 20 accounts
                    if (i % 20 === 0) {
                        holderList.innerHTML = `<div class="loading-more">Loading ${i}/${maxHolders} owner addresses...</div>`;
                    }
                    
                    const ownerAddress = await getTokenAccountOwner(account.address);
                    
                    if (ownerAddress) {
                        const balance = parseFloat(account.amount) / Math.pow(10, tokenDecimals);
                        const percentage = (parseFloat(account.amount) / totalFromAccounts * 100).toFixed(2);
                        
                        holdersWithOwners.push({
                            owner: ownerAddress,
                            balance,
                            percentage,
                            rank: i // Keep original rank
                        });
                    }
                }
                
                console.log(`Loaded ${holdersWithOwners.length} holders with owner addresses`);
                
                // NOW display all holders at once (won't vanish)
                holderList.innerHTML = '';
                holdersWithOwners.forEach((holder) => {
                    const item = document.createElement('div');
                    item.className = 'holder-item';
                    item.innerHTML = `
                        <span class="holder-rank">#${holder.rank}</span>
                        <span class="holder-address" title="${holder.owner}">${holder.owner.slice(0, 6)}...${holder.owner.slice(-4)}</span>
                        <span class="holder-amount">${holder.percentage}%</span>
                    `;
                    item.style.cursor = 'pointer';
                    item.onclick = () => window.open(`https://explorer.mainnet.x1.xyz/address/${holder.owner}`, '_blank');
                    holderList.appendChild(item);
                });
                
                if (holdersWithOwners.length === 0) {
                    holderList.innerHTML = '<div class="loading-more">No holder data available</div>';
                }
            }
            
            return accounts.length;
        }
    } catch (error) {
        console.error('Error fetching holders:', error);
        document.getElementById('holders').textContent = 'Error loading';
        document.getElementById('holderList').innerHTML = '<div class="loading-more">Error loading holders</div>';
    }
    return 0;
}

// Get owner address of a token account
async function getTokenAccountOwner(tokenAccountAddress) {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getAccountInfo',
                params: [
                    tokenAccountAddress,
                    { encoding: 'jsonParsed' }
                ]
            })
        });

        const data = await response.json();
        
        if (data.result && data.result.value && data.result.value.data) {
            const parsed = data.result.value.data.parsed;
            if (parsed && parsed.info && parsed.info.owner) {
                return parsed.info.owner;
            }
        }
    } catch (error) {
        console.error('Error getting token account owner:', error);
    }
    return null;
}

// Fetch and Parse Detailed Transactions
async function fetchDetailedTransactions() {
    try {
        console.log('Fetching transactions...');
        
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [
                    TOKEN_CA,
                    { limit: 100 } // Get more for filtering
                ]
            })
        });

        const data = await response.json();
        console.log('Transactions Response:', data);
        
        if (data.result && data.result.length > 0) {
            const txList = document.getElementById('transactionList');
            if (!txList) return;
            
            txList.innerHTML = '<div class="loading-more">Loading transaction details...</div>';
            
            // Fetch details for each transaction
            const transactions = [];
            for (let i = 0; i < Math.min(50, data.result.length); i++) {
                const sig = data.result[i];
                const txDetail = await fetchTransactionDetail(sig.signature);
                if (txDetail) {
                    transactions.push({
                        ...txDetail,
                        signature: sig.signature,
                        blockTime: sig.blockTime
                    });
                }
            }
            
            // Display transactions
            txList.innerHTML = '';
            transactions.forEach(tx => {
                const date = new Date(tx.blockTime * 1000);
                const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <div class="tx-timestamp">
                        <div class="tx-date">${dateStr}</div>
                        <div class="tx-time">${timeStr}</div>
                    </div>
                    <div>
                        <span class="tx-type ${tx.type}">${tx.type.toUpperCase()}</span>
                    </div>
                    <div class="tx-xnt">${tx.xntAmount}</div>
                    <div class="tx-404">${tx.tokenAmount}</div>
                    <div class="tx-price">${tx.price ? tx.price.toFixed(6) : 'N/A'}</div>
                    <div class="tx-maker">${tx.maker.slice(0, 4)}...${tx.maker.slice(-4)}</div>
                `;
                item.style.cursor = 'pointer';
                item.onclick = () => window.open(`https://explorer.mainnet.x1.xyz/tx/${tx.signature}`, '_blank');
                txList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        const txList = document.getElementById('transactionList');
        if (txList) {
            txList.innerHTML = '<div class="error-message">Error loading transactions</div>';
        }
    }
}

// Fetch single transaction detail
async function fetchTransactionDetail(signature) {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [
                    signature,
                    { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
                ]
            })
        });

        const data = await response.json();
        
        if (data.result && data.result.transaction) {
            const tx = data.result.transaction;
            const meta = data.result.meta;
            
            // Parse transaction to determine type and amounts
            // This is simplified - you may need to parse the instruction data
            const instructions = tx.message.instructions;
            
            // Try to determine if it's a buy or sell
            let type = 'swap';
            let xntAmount = '0.00';
            let tokenAmount = '0.00';
            let maker = tx.message.accountKeys[0]?.pubkey || 'Unknown';
            
            // Look for token balance changes
            if (meta && meta.postTokenBalances && meta.preTokenBalances) {
                const preBalance = meta.preTokenBalances.find(b => b.mint === TOKEN_CA);
                const postBalance = meta.postTokenBalances.find(b => b.mint === TOKEN_CA);
                
                if (preBalance && postBalance) {
                    const change = postBalance.uiTokenAmount.uiAmount - preBalance.uiTokenAmount.uiAmount;
                    tokenAmount = Math.abs(change).toFixed(2);
                    type = change > 0 ? 'buy' : 'sell';
                }
            }
            
            // Get SOL/XNT amount from balance changes
            if (meta && meta.preBalances && meta.postBalances) {
                const balanceChange = meta.postBalances[0] - meta.preBalances[0];
                xntAmount = (Math.abs(balanceChange) / 1e9).toFixed(2);
            }
            
            const price = parseFloat(tokenAmount) > 0 ? 
                parseFloat(xntAmount) / parseFloat(tokenAmount) : 0;
            
            return {
                type,
                xntAmount,
                tokenAmount,
                price,
                maker
            };
        }
    } catch (error) {
        console.error('Error fetching transaction detail:', error);
    }
    return null;
}

// Calculate Market Cap
async function calculateMarketCap() {
    try {
        const supply = await fetchTokenSupply();
        
        if (currentPrice && supply) {
            const marketCap = currentPrice * supply;
            const formatted = marketCap >= 1000000 
                ? `${(marketCap / 1000000).toFixed(2)}M`
                : marketCap >= 1000
                ? `${(marketCap / 1000).toFixed(2)}K`
                : marketCap.toFixed(2);
            
            document.getElementById('marketCap').textContent = `${formatted} XNT`;
        } else {
            document.getElementById('marketCap').textContent = 'Calculating...';
        }
    } catch (error) {
        console.error('Error calculating market cap:', error);
        document.getElementById('marketCap').textContent = 'Error';
    }
}

// Initialize all token data
async function initializeTokenData() {
    if (!document.getElementById('priceXNT')) return;
    
    console.log('Initializing token data...');
    
    try {
        // Fetch price first
        await fetchTokenPrice();
        
        // Then calculate market cap
        await calculateMarketCap();
        
        // Fetch holders
        await fetchAllHolders();
        
        // Fetch transactions (this takes longer)
        await fetchDetailedTransactions();
    } catch (error) {
        console.error('Error initializing token data:', error);
    }
}

// Auto-refresh functionality
if (document.getElementById('priceXNT')) {
    // Initial load
    initializeTokenData();
    
    // Refresh price and market cap every 15 seconds
    setInterval(async () => {
        await fetchTokenPrice();
        await calculateMarketCap();
    }, 15000);
    
    // Refresh price and market cap every 15 seconds
    setInterval(async () => {
        const price = await fetchTokenPrice();
        const tokenInfo = await fetchTokenSupply();
        if (price && tokenInfo) {
            await calculateMarketCap(price, tokenInfo.supply);
        }
    }, 15000);
    
    // DON'T auto-refresh holders (too slow, takes 1-2 minutes)
    // DON'T auto-refresh transactions (causes vanishing)
    // User can refresh page to get new data
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
