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

let currentPrice = null;
let tokenDecimals = 9; // Default, will be updated

// Pool token account addresses — discovered from first swap tx, then cached
let poolTokenAccount404 = null;  // pool's 404 reserve account
let poolTokenAccountXNT = null;  // pool's WXNT reserve account

// Fetch Token Price from xDEX CPMM pool reserves
// xDEX is a CPMM: price = XNT_reserve / 404_reserve
// We read both reserve balances directly from X1 RPC — no external API needed
async function fetchTokenPrice() {
    const priceEl = document.getElementById('priceXNT');

    try {
        // If we don't have pool account addresses yet, discover them from a recent swap tx
        if (!poolTokenAccount404 || !poolTokenAccountXNT) {
            await discoverPoolAccounts();
        }

        if (!poolTokenAccount404 || !poolTokenAccountXNT) {
            console.log('Pool accounts not yet discovered — waiting for first tx');
            return null;
        }

        // Read both reserve balances in parallel
        const [res404, resXNT] = await Promise.all([
            fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenAccountBalance', params: [poolTokenAccount404] })
            }),
            fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getTokenAccountBalance', params: [poolTokenAccountXNT] })
            })
        ]);

        const data404 = await res404.json();
        const dataXNT = await resXNT.json();

        const reserve404 = parseFloat(data404.result?.value?.uiAmount || 0);
        const reserveXNT = parseFloat(dataXNT.result?.value?.uiAmount || 0);

        console.log(`Pool reserves: ${reserveXNT} XNT / ${reserve404} 404`);

        if (reserve404 > 0 && reserveXNT > 0) {
            currentPrice = reserveXNT / reserve404;
            priceEl.textContent = `${currentPrice.toFixed(6)} XNT`;
            console.log(`Price = ${reserveXNT} / ${reserve404} = ${currentPrice} XNT`);
            return currentPrice;
        }
    } catch (e) {
        console.error('Price fetch error:', e.message);
    }

    if (currentPrice) {
        priceEl.textContent = `${currentPrice.toFixed(6)} XNT`;
    } else {
        priceEl.textContent = 'Loading...';
    }
    return currentPrice;
}

// Discover pool token account addresses from a recent swap transaction
// The pool's 404 and WXNT accounts appear in token balances with owner = pool authority
async function discoverPoolAccounts() {
    try {
        const sigRes = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [TOKEN_CA, { limit: 10 }] })
        });
        const sigData = await sigRes.json();
        if (!sigData.result) return;

        for (let i = 0; i < sigData.result.length; i++) {
            const txRes = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getTransaction', params: [sigData.result[i].signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }] })
            });
            const txData = await txRes.json();
            if (!txData.result?.meta) continue;

            const meta = txData.result.meta;
            const allBalances = [...(meta.postTokenBalances || []), ...(meta.preTokenBalances || [])];

            // Find the account that holds 404 tokens with the LARGEST balance — that's the pool reserve
            let best404 = null, best404Amt = 0;
            let bestXNT = null, bestXNTAmt = 0;

            allBalances.forEach(b => {
                if (b.mint === TOKEN_CA && b.owner) {
                    const amt = parseFloat(b.uiTokenAmount?.uiAmount || b.uiTokenAmount?.amount || 0);
                    if (amt > best404Amt) { best404Amt = amt; best404 = b; }
                }
                if (b.mint === WXNT_ADDRESS && b.owner) {
                    const amt = parseFloat(b.uiTokenAmount?.uiAmount || b.uiTokenAmount?.amount || 0);
                    if (amt > bestXNTAmt) { bestXNTAmt = amt; bestXNT = b; }
                }
            });

            // Pool reserve accounts are owned by the same authority and have large balances
            if (best404 && bestXNT && best404.owner === bestXNT.owner) {
                // Found matching pool — extract the token account pubkeys from accountKeys
                const accountKeys = txData.result.transaction.message.accountKeys.map(k => typeof k === 'string' ? k : k.pubkey);
                poolTokenAccount404 = accountKeys[best404.accountIndex];
                poolTokenAccountXNT = accountKeys[bestXNT.accountIndex];
                console.log(`Discovered pool accounts: 404=${poolTokenAccount404} | XNT=${poolTokenAccountXNT} | owner=${best404.owner}`);
                return;
            }
        }
    } catch (e) {
        console.error('Pool discovery error:', e.message);
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

// Helper: safely get a human-readable token amount from a token balance entry
// Token-2022 tokens return uiAmount as null in getTransaction — must compute manually
function getHumanAmount(balanceEntry) {
    if (!balanceEntry || !balanceEntry.uiTokenAmount) return 0;
    // uiAmount is populated for legacy tokens but NULL for Token-2022
    if (balanceEntry.uiTokenAmount.uiAmount != null) {
        return balanceEntry.uiTokenAmount.uiAmount;
    }
    // Fallback: compute from raw amount + decimals
    const decimals = balanceEntry.uiTokenAmount.decimals || 9;
    const raw = balanceEntry.uiTokenAmount.amount || '0';
    return parseFloat(raw) / Math.pow(10, decimals);
}

// Fetch and Parse Detailed Transactions
async function fetchDetailedTransactions() {
    const txList = document.getElementById('transactionList');
    if (!txList) return;

    try {
        console.log('Fetching transactions...');
        txList.innerHTML = '<div class="loading-more">Loading transactions...</div>';
        
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getSignaturesForAddress',
                params: [TOKEN_CA, { limit: 40 }]
            })
        });

        const data = await response.json();
        console.log('Got', data.result ? data.result.length : 0, 'signatures');
        
        if (!data.result || data.result.length === 0) {
            txList.innerHTML = '<div class="loading-more">No transactions found</div>';
            return;
        }

        txList.innerHTML = ''; // clear loading
        let rendered = 0;
        const TARGET = 20; // render up to 20 valid transactions

        for (let i = 0; i < data.result.length && rendered < TARGET; i++) {
            const sig = data.result[i];
            const txDetail = await fetchTransactionDetail(sig.signature);
            if (!txDetail) continue; // skip pool-internal or unparseable

            rendered++;

            // First valid tx: if pool price not yet set (accounts still being discovered), derive from this trade
            if (rendered === 1 && txDetail.price > 0 && !currentPrice) {
                currentPrice = txDetail.price;
                const priceEl = document.getElementById('priceXNT');
                if (priceEl) priceEl.textContent = `${currentPrice.toFixed(6)} XNT`;
                console.log(`Price derived from latest on-chain trade: ${currentPrice}`);
                calculateMarketCap();
            }

            const date = new Date(sig.blockTime * 1000);
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
                    <span class="tx-type ${txDetail.type}">${txDetail.type.toUpperCase()}</span>
                </div>
                <div class="tx-xnt">${txDetail.xntAmount}</div>
                <div class="tx-404">${txDetail.tokenAmount}</div>
                <div class="tx-price">${txDetail.price > 0 ? txDetail.price.toFixed(6) : '—'}</div>
                <div class="tx-maker">${txDetail.maker.slice(0, 4)}...${txDetail.maker.slice(-4)}</div>
            `;
            item.style.cursor = 'pointer';
            item.onclick = () => window.open(`https://explorer.mainnet.x1.xyz/tx/${sig.signature}`, '_blank');
            txList.appendChild(item);
        }

        if (rendered === 0) {
            txList.innerHTML = '<div class="loading-more">No swap transactions found</div>';
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        if (txList) txList.innerHTML = '<div class="error-message">Error loading transactions</div>';
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
                params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
            })
        });

        const data = await response.json();
        if (!data.result || !data.result.transaction) return null;

        const tx = data.result.transaction;
        const meta = data.result.meta;
        if (!meta || !meta.postTokenBalances || !meta.preTokenBalances) return null;

        const maker = tx.message.accountKeys[0]?.pubkey || 'Unknown';

        // --- 404 token amount: find the LARGEST single-account change for this mint ---
        // (In a swap, one account gains and one loses — we want the magnitude of the user-side change)
        let maxTokenChange = 0;
        let tokenChangeSign = 0; // +1 = buy, -1 = sell (from maker perspective)

        meta.postTokenBalances.forEach(postB => {
            if (postB.mint !== TOKEN_CA) return;
            const preB = meta.preTokenBalances.find(p => p.accountIndex === postB.accountIndex && p.mint === TOKEN_CA);
            const preAmt = preB ? getHumanAmount(preB) : 0;
            const postAmt = getHumanAmount(postB);
            const change = postAmt - preAmt;
            if (Math.abs(change) > maxTokenChange) {
                maxTokenChange = Math.abs(change);
                tokenChangeSign = change > 0 ? 1 : -1;
            }
        });
        // Also check pre-only accounts (closed in post)
        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== TOKEN_CA) return;
            if (!meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex)) {
                const amt = getHumanAmount(preB);
                if (amt > maxTokenChange) {
                    maxTokenChange = amt;
                    tokenChangeSign = -1; // account closed = tokens left
                }
            }
        });

        const tokenAmount = maxTokenChange;
        if (tokenAmount < 0.01) return null; // no meaningful 404 movement

        // Determine BUY/SELL: if maker's own 404 account increased → BUY
        let type = 'swap';
        const makerPre = meta.preTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
        const makerPost = meta.postTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
        if (makerPre && makerPost) {
            type = (getHumanAmount(makerPost) - getHumanAmount(makerPre)) > 0 ? 'buy' : 'sell';
        } else {
            type = tokenChangeSign > 0 ? 'buy' : 'sell';
        }

        // --- XNT amount: find wrapped XNT (So111...112) balance changes ---
        // Must scan BOTH post and pre, because:
        //   BUY:  pool's WXNT increases  → shows up in post  
        //   SELL: pool's WXNT decreases  → account may only appear in pre (if zeroed/closed)
        let xntAmount = 0;

        // Pass 1: accounts present in post (covers increases AND decreases where account survives)
        meta.postTokenBalances.forEach(postB => {
            if (postB.mint !== WXNT_ADDRESS) return;
            const preB = meta.preTokenBalances.find(p => p.accountIndex === postB.accountIndex && p.mint === WXNT_ADDRESS);
            const preAmt = preB ? getHumanAmount(preB) : 0;
            const postAmt = getHumanAmount(postB);
            const change = Math.abs(postAmt - preAmt);
            if (change > xntAmount) xntAmount = change;
        });

        // Pass 2: accounts that exist in pre but NOT in post (closed after full withdrawal)
        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== WXNT_ADDRESS) return;
            const postB = meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex && p.mint === WXNT_ADDRESS);
            if (!postB) {
                // Account was closed — entire pre balance left this account
                const amt = getHumanAmount(preB);
                if (amt > xntAmount) xntAmount = amt;
            }
        });

        // Fallback: native lamport diffs (for non-xDEX swaps)
        if (xntAmount === 0 && meta.preBalances && meta.postBalances) {
            for (let i = 0; i < meta.preBalances.length; i++) {
                const diff = Math.abs(meta.postBalances[i] - meta.preBalances[i]) / 1e9;
                if (diff > 0.0005) { // skip tiny rent/fee amounts
                    xntAmount = diff;
                    break;
                }
            }
        }

        // Price per token for this specific transaction
        const price = (tokenAmount > 0 && xntAmount > 0) ? xntAmount / tokenAmount : 0;

        return {
            type,
            xntAmount: xntAmount.toFixed(4),
            tokenAmount: tokenAmount.toFixed(2),
            price,
            maker
        };
    } catch (error) {
        console.error('Error fetching tx detail:', error);
    }
    return null;
}

// 404 token has fixed immutable supply — no need to fetch from chain
const FIXED_SUPPLY = 404404;

// Calculate Market Cap = price × fixed supply
async function calculateMarketCap() {
    try {
        if (currentPrice) {
            const marketCap = currentPrice * FIXED_SUPPLY;
            let formatted;
            if (marketCap >= 1000000) {
                formatted = `${(marketCap / 1000000).toFixed(2)}M`;
            } else if (marketCap >= 1000) {
                formatted = `${(marketCap / 1000).toFixed(2)}K`;
            } else if (marketCap >= 1) {
                formatted = marketCap.toFixed(2);
            } else {
                formatted = marketCap.toFixed(4);
            }
            document.getElementById('marketCap').textContent = `${formatted} XNT`;
            console.log(`MarketCap: ${currentPrice} × ${FIXED_SUPPLY} = ${marketCap} (${formatted} XNT)`);
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
        // Price first
        await fetchTokenPrice();
        
        // Market cap (just math now, instant)
        await calculateMarketCap();
        
        // Holders and transactions can run in parallel
        fetchAllHolders();
        fetchDetailedTransactions();
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

// ─── Live Candlestick Chart (TradingView Lightweight Charts) ───────────────

var chartInitDone = false;

function startChart() {
    var container = document.getElementById('chartContainer');
    if (!container || typeof LightweightCharts === 'undefined') {
        setTimeout(startChart, 200);
        return;
    }
    // Guard — only init once
    if (chartInitDone) return;
    chartInitDone = true;

    // Wait one frame so the container has been laid out and has real dimensions
    requestAnimationFrame(function() {

    // ── State ──
    var chart, candleSeries, volumeSeries;
    var currentTF = 60;
    var showVolume = true;
    var allTrades = [];
    var candleData = [];
    var volumeData = [];

    // ── Read actual rendered size ──
    var chartW = container.clientWidth || 600;
    var chartH = container.clientHeight || 420;

    // ── Create a fresh child div for LightweightCharts ──
    // SES (X1 Wallet extension) freezes existing DOM elements, stripping
    // getBoundingClientRect — which crashes LightweightCharts on init.
    // A brand-new element created AFTER SES ran is not frozen.
    var chartEl = document.createElement('div');
    chartEl.style.width = '100%';
    chartEl.style.height = chartH + 'px';
    // Remove loading overlay before inserting chart element
    var loadingEl = container.querySelector('.chart-loading');
    if (loadingEl) loadingEl.remove();
    container.appendChild(chartEl);

    // ── Create chart with explicit pixel size ──
    chart = LightweightCharts.createChart({
        element: chartEl,
        width: chartW,
        height: chartH,
        layout: {
            background: { color: '#0a0e13' },
            textColor: '#8892b0',
            fontSize: 11,
            fontFamily: "'Share Tech Mono', monospace"
        },
        grid: {
            vertLines: { color: '#1a1f2e', visible: true },
            horzLines: { color: '#1a1f2e', visible: true }
        },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        timeScale: {
            ticksTargetTimestamp: true,
            timeVisible: true,
            secondsVisible: false,
            borderColor: '#1a1f2e'
        },
        rightPriceScale: {
            borderColor: '#1a1f2e',
            entirelyVisible: true
        }
    });

    // ── Candle series ──
    candleSeries = chart.addCandlestickSeries({
        upColor: '#4ecca3',
        downColor: '#e74c3c',
        wickUpColor: '#4ecca3',
        wickDownColor: '#e74c3c',
        borderUpColor: '#4ecca3',
        borderDownColor: '#e74c3c'
    });

    // ── Volume scale + series ──
    chart.addPriceScale({
        scaleId: 'volume',
        position: 'left',
        visible: false,
        scaleMargins: { top: 0.7, bottom: 0 }
    });

    volumeSeries = chart.addHistogramSeries({
        color: '#4ecca3',
        priceScaleId: 'volume',
        lastValuePoint: { visible: false }
    });
    volumeSeries.applyOptions({ visible: showVolume });

    // ── Crosshair → OHLCV legend ──
    chart.subscribeCrosshairMove(function(param) {
        if (!param || !param.time || !candleSeries) return;
        var candle = param.seriesPrices.get(candleSeries);
        if (!candle) return;
        document.getElementById('ohlcO').textContent = candle.open.toFixed(6);
        document.getElementById('ohlcH').textContent = candle.high.toFixed(6);
        document.getElementById('ohlcL').textContent  = candle.low.toFixed(6);
        document.getElementById('ohlcC').textContent = candle.close.toFixed(6);
        var vol = volumeData.find(function(v) { return v.time === param.time; });
        document.getElementById('ohlcV').textContent = vol ? Math.round(vol.value).toLocaleString() : '0';
    });

    // ── Build candles from raw trades ──
    function buildCandles(trades, tfMinutes) {
        var tfSeconds = tfMinutes * 60;
        var buckets = {};

        trades.forEach(function(t) {
            var bucket = Math.floor(t.time / tfSeconds) * tfSeconds;
            if (!buckets[bucket]) {
                buckets[bucket] = { time: bucket, open: t.price, high: t.price, low: t.price, close: t.price, volume: 0 };
            }
            var c = buckets[bucket];
            if (t.price > c.high) c.high = t.price;
            if (t.price < c.low)  c.low  = t.price;
            c.close = t.price;
            c.volume += t.token404;
        });

        var sorted = Object.keys(buckets).map(Number).sort(function(a,b){ return a-b; }).map(function(k){ return buckets[k]; });

        // Fill gaps with previous close
        var filled = [];
        for (var i = 0; i < sorted.length; i++) {
            if (i > 0) {
                var prev = sorted[i-1];
                var t = prev.time + tfSeconds;
                while (t < sorted[i].time) {
                    filled.push({ time: t, open: prev.close, high: prev.close, low: prev.close, close: prev.close, volume: 0 });
                    prev = filled[filled.length - 1];
                    t += tfSeconds;
                }
            }
            filled.push(sorted[i]);
        }

        candleData = filled;
        volumeData = filled.map(function(c) {
            return { time: c.time, value: c.volume, color: c.close >= c.open ? '#4ecca344' : '#e74c3c44' };
        });
    }

    // ── Update header price + 24h change ──
    function updateChartHeader() {
        if (allTrades.length === 0) return;
        var latest = allTrades[allTrades.length - 1];
        var priceEl = document.getElementById('chartPrice');
        var changeEl = document.getElementById('chartPriceChange');
        if (priceEl) priceEl.textContent = latest.price.toFixed(6) + ' XNT';

        var now = latest.time;
        var target24h = now - 86400;
        var price24h = null;
        for (var i = 0; i < allTrades.length; i++) {
            if (allTrades[i].time >= target24h) { price24h = allTrades[i].price; break; }
        }
        if (changeEl && price24h && price24h > 0) {
            var pct = ((latest.price - price24h) / price24h) * 100;
            changeEl.textContent = '(' + (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%)';
            changeEl.className = 'chart-price-change ' + (pct >= 0 ? 'positive' : 'negative');
        }
    }

    // ── Render ──
    function renderChart() {
        if (candleData.length === 0) return;
        candleSeries.setData(candleData);
        volumeSeries.setData(volumeData);
        chart.timeScale().fitContent();

        var last = candleData[candleData.length - 1];
        document.getElementById('ohlcO').textContent = last.open.toFixed(6);
        document.getElementById('ohlcH').textContent = last.high.toFixed(6);
        document.getElementById('ohlcL').textContent  = last.low.toFixed(6);
        document.getElementById('ohlcC').textContent = last.close.toFixed(6);
        document.getElementById('ohlcV').textContent = Math.round(last.volume).toLocaleString();

        updateChartHeader();
    }

    // ── Parse single tx → trade ──
    function parseTrade(sig, txData) {
        if (!txData.result || !txData.result.meta) return null;
        var meta = txData.result.meta;
        if (!meta.postTokenBalances || !meta.preTokenBalances) return null;

        // ── 404 token amount: largest single-account change ──
        var token404 = 0;
        // Pass 1: accounts present in post
        meta.postTokenBalances.forEach(function(postB) {
            if (postB.mint !== TOKEN_CA) return;
            var preB = meta.preTokenBalances.find(function(p) { return p.accountIndex === postB.accountIndex && p.mint === TOKEN_CA; });
            var change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > token404) token404 = change;
        });
        // Pass 2: accounts that exist in pre but NOT in post (closed after full withdrawal)
        meta.preTokenBalances.forEach(function(preB) {
            if (preB.mint !== TOKEN_CA) return;
            if (!meta.postTokenBalances.find(function(p) { return p.accountIndex === preB.accountIndex && p.mint === TOKEN_CA; })) {
                var amt = getHumanAmount(preB);
                if (amt > token404) token404 = amt;
            }
        });
        if (token404 < 0.01) return null;

        // ── XNT amount: largest single-account change for WXNT ──
        var xnt = 0;
        // Pass 1: accounts present in post
        meta.postTokenBalances.forEach(function(postB) {
            if (postB.mint !== WXNT_ADDRESS) return;
            var preB = meta.preTokenBalances.find(function(p) { return p.accountIndex === postB.accountIndex && p.mint === WXNT_ADDRESS; });
            var change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > xnt) xnt = change;
        });
        // Pass 2: accounts closed after full withdrawal
        meta.preTokenBalances.forEach(function(preB) {
            if (preB.mint !== WXNT_ADDRESS) return;
            if (!meta.postTokenBalances.find(function(p) { return p.accountIndex === preB.accountIndex && p.mint === WXNT_ADDRESS; })) {
                var amt = getHumanAmount(preB);
                if (amt > xnt) xnt = amt;
            }
        });
        // Fallback: native lamport diffs — find the LARGEST diff (skip tiny rent/fee)
        if (xnt === 0 && meta.preBalances && meta.postBalances) {
            var maxDiff = 0;
            for (var j = 0; j < meta.preBalances.length; j++) {
                var diff = Math.abs(meta.postBalances[j] - meta.preBalances[j]) / 1e9;
                if (diff > maxDiff) maxDiff = diff;
            }
            if (maxDiff > 0.0005) xnt = maxDiff;
        }

        if (xnt > 0 && token404 > 0) {
            return { time: sig.blockTime, price: xnt / token404, xnt: xnt, token404: token404 };
        }
        return null;
    }

    // ── Fetch trades — sequential, one tx at a time (proven reliable pattern) ──
    async function fetchTrades() {
        try {
            var sigRes = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [TOKEN_CA, { limit: 1000 }] })
            });
            var sigData = await sigRes.json();
            if (!sigData.result || sigData.result.length === 0) {
                removeLoading(); showNoData('No transactions found'); return;
            }

            var sigs = sigData.result;
            var trades = [];
            var MAX_TRADES = 100;

            for (var i = 0; i < sigs.length && trades.length < MAX_TRADES; i++) {
                var sig = sigs[i];
                try {
                    var txRes = await fetch(X1_RPC, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getTransaction', params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }] })
                    });
                    var txData = await txRes.json();
                    if (!txData || !txData.result) continue;
                    var trade = parseTrade(sig, txData);
                    if (trade) trades.push(trade);
                } catch(e) {
                    continue; // skip failed tx, keep scanning
                }
            }

            trades.sort(function(a, b) { return a.time - b.time; });
            allTrades = trades;
            console.log('Chart: fetched', trades.length, 'trades from', sigs.length, 'signatures');

            removeLoading();

            if (trades.length > 0) {
                buildCandles(allTrades, currentTF);
                renderChart();
            } else {
                showNoData('No swap trades found yet');
            }

        } catch(e) {
            console.error('Chart fetch error:', e);
            removeLoading(); showNoData('Error loading chart');
        }
    }

    function removeLoading() {
        var el = container.querySelector('.chart-loading');
        if (el) el.remove();
    }

    function showNoData(msg) {
        removeLoading();
        var el = document.createElement('div');
        el.className = 'chart-loading';
        el.textContent = msg;
        container.appendChild(el);
    }

    // ── Timeframe buttons ──
    document.querySelectorAll('.chart-tf-btn[data-tf]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tf = parseInt(btn.getAttribute('data-tf'));
            if (isNaN(tf)) return;
            currentTF = tf;
            document.querySelectorAll('.chart-tf-btn[data-tf]').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var labels = {1:'1m', 5:'5m', 15:'15m', 60:'1h', 240:'4h', 1440:'1d'};
            document.querySelector('.chart-timeframe-label').textContent = labels[tf] || tf+'m';
            if (allTrades.length > 0) {
                buildCandles(allTrades, currentTF);
                renderChart();
            }
        });
    });

    // ── Volume toggle ──
    var volBtn = document.getElementById('volToggle');
    if (volBtn) {
        volBtn.classList.toggle('active', showVolume);
        volBtn.addEventListener('click', function() {
            showVolume = !showVolume;
            volBtn.classList.toggle('active', showVolume);
            volumeSeries.applyOptions({ visible: showVolume });
        });
    }

    // ── ResizeObserver — keeps chart synced to container on any resize ──
    var resizeObs = new ResizeObserver(function(entries) {
        if (!chart) return;
        var rect = entries[0].contentRect;
        if (rect.width > 0 && rect.height > 0) {
            chart.resize(rect.width, rect.height);
        }
    });
    resizeObs.observe(container);

    // ── Initial fetch ──
    fetchTrades();

    // ── Refresh every 60s ──
    setInterval(function() { fetchTrades(); }, 60000);

    }); // end requestAnimationFrame
}

// Start chart (waits for LightweightCharts CDN)
if (document.getElementById('chartContainer')) {
    startChart();
}
