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

// Fetch Token Price — tries Vercel proxy first, then direct xDEX, then on-chain derivation
async function fetchTokenPrice() {
    const priceEl = document.getElementById('priceXNT');

    // --- Attempt 1: Vercel serverless proxy ---
    try {
        const res = await fetch('/api/price');
        if (res.ok) {
            const data = await res.json();
            console.log('Proxy response:', data);
            // Proxy now returns price already correct (1/humanOutput)
            if (data.success && data.price && data.price > 0) {
                currentPrice = data.price;
                priceEl.textContent = `${currentPrice.toFixed(8)} XNT`;
                return currentPrice;
            }
        }
    } catch (e) {
        console.log('Proxy unavailable, trying direct xDEX...');
    }

    // --- Attempt 2: Direct xDEX API ---
    try {
        const res = await fetch('https://api.xdex.xyz/api/xendex/swap/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                network: 'X1 Mainnet',
                wallet: '11111111111111111111111111111111',
                token_in: WXNT_ADDRESS,
                token_out: TOKEN_CA,
                token_in_amount: 1,
                is_exact_amount_in: true
            })
        });
        const data = await res.json();
        console.log('Direct xDEX raw:', data);

        // xDEX returns estimatedOutputAmount already in HUMAN-READABLE form
        // e.g. 518.88 means 1 XNT buys 518.88 tokens
        // Price per token = 1 / 518.88 = 0.00192727 XNT
        let outputAmount = data.estimatedOutputAmount || data.output_amount
            || (data.data && (data.data.estimatedOutputAmount || data.data.output_amount))
            || data.result || null;

        if (outputAmount) {
            outputAmount = parseFloat(outputAmount);
            if (outputAmount > 0) {
                currentPrice = 1 / outputAmount;
                priceEl.textContent = `${currentPrice.toFixed(8)} XNT`;
                console.log(`xDEX: 1 XNT buys ${outputAmount} 404 → price = ${currentPrice} XNT`);
                return currentPrice;
            }
        }
    } catch (e) {
        console.log('Direct xDEX failed (CORS?):', e.message);
    }

    // --- Attempt 3: Derive price from the most recent on-chain swap ---
    try {
        const sigRes = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [TOKEN_CA, { limit: 5 }] })
        });
        const sigData = await sigRes.json();
        if (sigData.result && sigData.result.length > 0) {
            // Try up to 5 recent txs — skip pool-internal ones that have no real XNT flow
            for (let i = 0; i < sigData.result.length; i++) {
                const txRes = await fetch(X1_RPC, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getTransaction', params: [sigData.result[i].signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }] })
                });
                const txData = await txRes.json();
                if (txData.result && txData.result.meta) {
                    const meta = txData.result.meta;
                    const pre404 = meta.preTokenBalances && meta.preTokenBalances.find(b => b.mint === TOKEN_CA);
                    const post404 = meta.postTokenBalances && meta.postTokenBalances.find(b => b.mint === TOKEN_CA);
                    if (pre404 && post404) {
                        const tokenChange = Math.abs((post404.uiTokenAmount.uiAmount || 0) - (pre404.uiTokenAmount.uiAmount || 0));

                        // Look for wrapped XNT token balance change (not native lamports)
                        const preXnt = meta.preTokenBalances.find(b => b.mint === WXNT_ADDRESS);
                        const postXnt = meta.postTokenBalances.find(b => b.mint === WXNT_ADDRESS);
                        let xntChange = 0;
                        if (preXnt && postXnt) {
                            xntChange = Math.abs((postXnt.uiTokenAmount.uiAmount || 0) - (preXnt.uiTokenAmount.uiAmount || 0));
                        }
                        // Fallback: native lamport diff
                        if (xntChange === 0) {
                            xntChange = Math.abs(meta.postBalances[0] - meta.preBalances[0]) / 1e9;
                        }

                        if (tokenChange > 0 && xntChange > 0.0001) {
                            currentPrice = xntChange / tokenChange;
                            priceEl.textContent = `${currentPrice.toFixed(8)} XNT`;
                            console.log(`Price from on-chain tx[${i}]: ${xntChange} XNT / ${tokenChange} tokens = ${currentPrice}`);
                            return currentPrice;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log('On-chain price derivation failed:', e.message);
    }

    // All failed — show cached or fallback
    if (currentPrice) {
        priceEl.textContent = `${currentPrice.toFixed(8)} XNT`;
    } else {
        priceEl.textContent = 'Check xDEX';
    }
    return currentPrice;
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

// Fetch ALL Token Holders using getProgramAccounts + getMultipleAccounts
async function fetchAllHolders() {
    const holdersEl = document.getElementById('holders');
    const holderList = document.getElementById('holderList');
    if (!holdersEl || !holderList) return 0;

    holdersEl.textContent = 'Loading...';
    holderList.innerHTML = '<div class="loading-more">Discovering token accounts...</div>';

    try {
        // Step 1: Get ALL token accounts for this mint using getProgramAccounts
        // This is how you discover every account holding this token
        const TOKEN_PROGRAM_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const TOKEN_PROGRAM_LEGACY = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

        let allAccounts = [];

        // Try Token-2022 program first (404 uses Token-2022 — immutable metadata)
        // IMPORTANT: Token-2022 accounts are NOT 165 bytes — they have extension data
        // so we must NOT use dataSize filter for Token-2022
        for (const [programId, useDataSize] of [
            [TOKEN_PROGRAM_2022, false],   // Token-2022: variable size, no dataSize filter
            [TOKEN_PROGRAM_LEGACY, true]   // Legacy: fixed 165 bytes
        ]) {
            try {
                const filters = [
                    { memcmp: { offset: 0, bytes: TOKEN_CA } }
                ];
                if (useDataSize) {
                    filters.push({ dataSize: 165 });
                }

                const res = await fetch(X1_RPC, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getProgramAccounts',
                        params: [
                            programId,
                            {
                                encoding: 'jsonParsed',
                                filters: filters
                            }
                        ]
                    })
                });
                const data = await res.json();
                console.log(`getProgramAccounts (${programId.slice(0,8)}...) returned:`, data.result ? data.result.length : 0, 'accounts', data.error ? '| error: ' + JSON.stringify(data.error) : '');
                if (data.result && data.result.length > 0) {
                    allAccounts = allAccounts.concat(data.result);
                }
            } catch (e) {
                console.log(`getProgramAccounts failed for ${programId.slice(0,8)}:`, e.message);
            }
        }

        // If getProgramAccounts returned nothing (some RPCs block it), fall back to getTokenLargestAccounts
        if (allAccounts.length === 0) {
            console.log('getProgramAccounts returned nothing, falling back to getTokenLargestAccounts...');
            holderList.innerHTML = '<div class="loading-more">Fetching top holders...</div>';

            const res = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTokenLargestAccounts',
                    params: [TOKEN_CA, { commitment: 'confirmed', limit: 500 }]
                })
            });
            const data = await res.json();
            console.log('getTokenLargestAccounts returned:', data.result ? data.result.value.length : 0);

            if (data.result && data.result.value && data.result.value.length > 0) {
                // Already parsed — render directly
                renderHolders(data.result.value.map(acc => ({
                    address: acc.address,
                    amount: acc.amount,
                    uiAmount: acc.uiAmount
                })));
                return data.result.value.length;
            }
            holdersEl.textContent = 'No holders found';
            holderList.innerHTML = '<div class="loading-more">No holder data</div>';
            return 0;
        }

        // Step 2: We have account addresses from getProgramAccounts — extract balances
        // getProgramAccounts with jsonParsed already gives us the parsed data inline
        const holders = [];
        for (const acc of allAccounts) {
            try {
                const parsed = acc.account.data.parsed;
                if (parsed && parsed.info && parsed.info.tokenAmount) {
                    const amount = parsed.info.tokenAmount.amount;
                    const uiAmount = parsed.info.tokenAmount.uiAmount;
                    if (uiAmount > 0) {
                        holders.push({
                            address: acc.pubkey,
                            amount: amount,
                            uiAmount: uiAmount,
                            owner: parsed.info.owner
                        });
                    }
                }
            } catch (e) {
                // skip malformed
            }
        }

        // Sort descending by amount
        holders.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        console.log('Total holders with balance > 0:', holders.length);

        renderHolders(holders);
        return holders.length;

    } catch (error) {
        console.error('Error fetching holders:', error);
        holdersEl.textContent = 'Error';
        holderList.innerHTML = '<div class="loading-more">Error loading holders</div>';
    }
    return 0;
}

// Render holder list into the DOM
function renderHolders(holders) {
    const holdersEl = document.getElementById('holders');
    const holderList = document.getElementById('holderList');

    // Total supply for percentage calc
    const totalSupply = holders.reduce((sum, h) => sum + parseFloat(h.amount), 0);

    holdersEl.textContent = `${holders.length} holders`;
    holderList.innerHTML = '';

    holders.forEach((holder, index) => {
        const amount = parseFloat(holder.amount) / Math.pow(10, tokenDecimals);
        const percentage = totalSupply > 0
            ? (parseFloat(holder.amount) / totalSupply * 100).toFixed(2)
            : '0.00';

        // Format amount (33.17K style)
        let amountFormatted;
        if (amount >= 1000000) {
            amountFormatted = (amount / 1000000).toFixed(2) + 'M';
        } else if (amount >= 1000) {
            amountFormatted = (amount / 1000).toFixed(2) + 'K';
        } else {
            amountFormatted = amount.toFixed(2);
        }

        const item = document.createElement('div');
        item.className = 'holder-item';
        // Use owner address if available (from getProgramAccounts), else the account address
        const displayAddr = holder.owner || holder.address;
        item.innerHTML = `
            <span class="holder-rank">#${index + 1}</span>
            <span class="holder-address" title="${displayAddr}">${displayAddr.slice(0, 6)}...${displayAddr.slice(-4)}</span>
            <span class="holder-balance">${amountFormatted} 404</span>
            <span class="holder-amount">${percentage}%</span>
        `;
        item.style.cursor = 'pointer';
        item.onclick = () => window.open(`https://explorer.mainnet.x1.xyz/address/${displayAddr}`, '_blank');
        holderList.appendChild(item);
    });
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
            
            let type = 'swap';
            let xntAmount = 0;
            let tokenAmount = 0;
            let maker = tx.message.accountKeys[0]?.pubkey || 'Unknown';
            
            if (!meta || !meta.postTokenBalances || !meta.preTokenBalances) return null;

            // --- 404 token change ---
            // Sum ALL balance changes for this mint (a single tx can touch multiple 404 accounts)
            let totalTokenChange = 0;
            const pre404map = {};
            meta.preTokenBalances.forEach(b => {
                if (b.mint === TOKEN_CA) {
                    pre404map[b.accountIndex] = b.uiTokenAmount.uiAmount || 0;
                }
            });
            meta.postTokenBalances.forEach(b => {
                if (b.mint === TOKEN_CA) {
                    const pre = pre404map[b.accountIndex] || 0;
                    const post = b.uiTokenAmount.uiAmount || 0;
                    totalTokenChange += (post - pre);
                }
            });
            // Also catch accounts that existed in pre but not post (closed)
            meta.preTokenBalances.forEach(b => {
                if (b.mint === TOKEN_CA && !meta.postTokenBalances.find(p => p.accountIndex === b.accountIndex)) {
                    totalTokenChange -= (b.uiTokenAmount.uiAmount || 0);
                }
            });

            tokenAmount = Math.abs(totalTokenChange);
            // BUY = tokens flowed TO the maker (positive change on maker's account)
            // We detect by checking if the maker's own 404 account increased
            const makerPreIdx = meta.preTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
            const makerPostIdx = meta.postTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
            if (makerPreIdx && makerPostIdx) {
                const makerChange = (makerPostIdx.uiTokenAmount.uiAmount || 0) - (makerPreIdx.uiTokenAmount.uiAmount || 0);
                type = makerChange > 0 ? 'buy' : 'sell';
            } else if (totalTokenChange > 0) {
                type = 'buy';
            } else {
                type = 'sell';
            }

            // --- XNT change: check wrapped XNT token balances first, then native ---
            // Wrapped XNT (So111...112) is how xDEX pools hold XNT internally
            let totalXntChange = 0;
            const preXntMap = {};
            meta.preTokenBalances.forEach(b => {
                if (b.mint === WXNT_ADDRESS) {
                    preXntMap[b.accountIndex] = b.uiTokenAmount.uiAmount || 0;
                }
            });
            meta.postTokenBalances.forEach(b => {
                if (b.mint === WXNT_ADDRESS) {
                    const pre = preXntMap[b.accountIndex] || 0;
                    const post = b.uiTokenAmount.uiAmount || 0;
                    totalXntChange += Math.abs(post - pre);
                }
            });
            xntAmount = totalXntChange;

            // Fallback: if no wrapped XNT found, use native lamport diff on fee payer
            if (xntAmount === 0 && meta.preBalances && meta.postBalances) {
                // Sum native balance changes across ALL accounts (not just [0])
                for (let i = 0; i < meta.preBalances.length; i++) {
                    const diff = Math.abs(meta.postBalances[i] - meta.preBalances[i]) / 1e9;
                    if (diff > 0.001) { // ignore tiny rent/fee diffs
                        xntAmount = diff;
                        break;
                    }
                }
            }

            // If both XNT and token amount are effectively zero, this is a pool-internal
            // event with no meaningful user trade — skip it
            if (tokenAmount < 0.01 && xntAmount < 0.0001) {
                return null;
            }

            // Per-transaction price
            const price = (tokenAmount > 0 && xntAmount > 0) ? xntAmount / tokenAmount : 0;

            return {
                type,
                xntAmount: xntAmount.toFixed(4),
                tokenAmount: tokenAmount.toFixed(2),
                price,
                maker
            };
        }
    } catch (error) {
        console.error('Error fetching transaction detail:', error);
    }
    return null;
}

let cachedSupply = null;

// Calculate Market Cap = price × total supply
async function calculateMarketCap() {
    try {
        // Only fetch supply if we don't have it cached yet
        if (!cachedSupply) {
            cachedSupply = await fetchTokenSupply();
        }

        console.log('MarketCap calc — currentPrice:', currentPrice, '| cachedSupply:', cachedSupply, '| product:', currentPrice && cachedSupply ? currentPrice * cachedSupply : 'N/A');

        if (currentPrice && cachedSupply) {
            const marketCap = currentPrice * cachedSupply;
            let formatted;
            if (marketCap >= 1000000) {
                formatted = `${(marketCap / 1000000).toFixed(2)}M`;
            } else if (marketCap >= 1000) {
                formatted = `${(marketCap / 1000).toFixed(2)}K`;
            } else if (marketCap >= 1) {
                formatted = marketCap.toFixed(2);
            } else {
                formatted = marketCap.toFixed(6);
            }
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
        // Fetch supply FIRST — this sets tokenDecimals which price calculation needs
        cachedSupply = await fetchTokenSupply();
        console.log('Supply fetched:', cachedSupply, '| decimals:', tokenDecimals);

        // Now fetch price (Attempt 2 uses tokenDecimals)
        await fetchTokenPrice();
        
        // Then calculate market cap (needs both price + supply)
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

    // Refresh price + market cap every 30 seconds (single interval)
    setInterval(async () => {
        await fetchTokenPrice();
        await calculateMarketCap();
    }, 30000);
}

// Feed tab switching (Transactions ↔ Holders)
document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-feed');

        // Update tab buttons
        document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panels
        document.querySelectorAll('.feed-panel').forEach(p => p.classList.remove('active'));
        if (target === 'transactions') {
            document.getElementById('feedTransactions').classList.add('active');
        } else if (target === 'holders') {
            document.getElementById('feedHolders').classList.add('active');
        }
    });
});

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
