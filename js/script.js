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
                const response = await window.x1Wallet.connect();
                walletAddress = response.publicKey.toString();
                walletType = 'X1';
                handleWalletConnected();
            } else {
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
    const userData = localStorage.getItem(`404x1_user_${walletAddress}`);
    if (userData) {
        const user = JSON.parse(userData);
        loginUser(user);
    } else {
        document.querySelectorAll('.wallet-btn').forEach(btn => btn.style.display = 'none');
        usernameSetup.classList.remove('hidden');
    }
}

// Confirm Username
if (confirmUsernameBtn) {
    confirmUsernameBtn.addEventListener('click', () => {
        const chatName = chatNameInput.value.trim();
        const gameName = gameNameInput.value.trim();
        const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
        
        if (!usernameRegex.test(chatName)) {
            alert('Chat name must be 3-16 characters (letters, numbers, underscore only)');
            return;
        }
        if (!usernameRegex.test(gameName)) {
            alert('Game name must be 3-16 characters (letters, numbers, underscore only)');
            return;
        }
        
        const reservedWords = ['admin', 'mod', 'moderator', 'system', 'bot', 'null', 'undefined'];
        if (reservedWords.includes(chatName.toLowerCase()) || reservedWords.includes(gameName.toLowerCase())) {
            alert('This username is reserved. Please choose another.');
            return;
        }
        
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
        
        localStorage.setItem(`404x1_user_${walletAddress}`, JSON.stringify(userData));
        localStorage.setItem('404x1_current_user', JSON.stringify(userData));
        loginUser(userData);
    });
}

function loginUser(userData) {
    if (authBtn) {
        authBtn.textContent = `${userData.chatName.substring(0, 8)}...`;
    }
    authModal.classList.remove('active');
    localStorage.setItem('404x1_current_user', JSON.stringify(userData));
    console.log('User logged in:', userData);
    alert(`Welcome ${userData.chatName}! Your ${userData.walletType} wallet is connected.`);
}

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
            setTimeout(() => { copyIcon.textContent = '📋'; }, 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = caAddress.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyIcon.textContent = '✅';
            setTimeout(() => { copyIcon.textContent = '📋'; }, 2000);
        }
    });
}

// ─── Token Data Integration ─────────────────────────────────────────────────
const TOKEN_CA = '4o4UheANLdqF4gSV4zWTbCTCercQNSaTm6nVcDetzPb2';
const WXNT_ADDRESS = 'So11111111111111111111111111111111111111112';
const X1_RPC = 'https://rpc.mainnet.x1.xyz/';

let currentPrice = null;
let tokenDecimals = 9;
let poolTokenAccount404 = null;
let poolTokenAccountXNT = null;

async function fetchTokenPrice() {
    const priceEl = document.getElementById('priceXNT');
    try {
        if (!poolTokenAccount404 || !poolTokenAccountXNT) {
            await discoverPoolAccounts();
        }
        if (!poolTokenAccount404 || !poolTokenAccountXNT) {
            console.log('Pool accounts not yet discovered — waiting for first tx');
            return null;
        }

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

            if (best404 && bestXNT && best404.owner === bestXNT.owner) {
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

async function fetchTokenSupply() {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenSupply', params: [TOKEN_CA] })
        });
        const data = await response.json();
        if (data.result && data.result.value) {
            tokenDecimals = data.result.value.decimals;
            return parseFloat(data.result.value.amount) / Math.pow(10, tokenDecimals);
        }
    } catch (error) {
        console.error('Error fetching supply:', error);
    }
    return null;
}

async function fetchAllHolders() {
    const holdersEl = document.getElementById('holders');
    const holderList = document.getElementById('holderList');
    if (!holdersEl || !holderList) return 0;

    holdersEl.textContent = 'Loading...';
    holderList.innerHTML = '<div class="loading-more">Discovering token accounts...</div>';

    try {
        const TOKEN_PROGRAM_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const TOKEN_PROGRAM_LEGACY = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        let allAccounts = [];

        for (const [programId, useDataSize] of [
            [TOKEN_PROGRAM_2022, false],
            [TOKEN_PROGRAM_LEGACY, true]
        ]) {
            try {
                const filters = [{ memcmp: { offset: 0, bytes: TOKEN_CA } }];
                if (useDataSize) filters.push({ dataSize: 165 });

                const res = await fetch(X1_RPC, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0', id: 1, method: 'getProgramAccounts',
                        params: [programId, { encoding: 'jsonParsed', filters: filters }]
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

        if (allAccounts.length === 0) {
            console.log('getProgramAccounts returned nothing, falling back to getTokenLargestAccounts...');
            holderList.innerHTML = '<div class="loading-more">Fetching top holders...</div>';

            const res = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenLargestAccounts', params: [TOKEN_CA, { commitment: 'confirmed', limit: 500 }] })
            });
            const data = await res.json();
            console.log('getTokenLargestAccounts returned:', data.result ? data.result.value.length : 0);

            if (data.result && data.result.value && data.result.value.length > 0) {
                renderHolders(data.result.value.map(acc => ({ address: acc.address, amount: acc.amount, uiAmount: acc.uiAmount })));
                return data.result.value.length;
            }
            holdersEl.textContent = 'No holders found';
            holderList.innerHTML = '<div class="loading-more">No holder data</div>';
            return 0;
        }

        const holders = [];
        for (const acc of allAccounts) {
            try {
                const parsed = acc.account.data.parsed;
                if (parsed && parsed.info && parsed.info.tokenAmount) {
                    const amount = parsed.info.tokenAmount.amount;
                    const uiAmount = parsed.info.tokenAmount.uiAmount;
                    if (uiAmount > 0) {
                        holders.push({ address: acc.pubkey, amount: amount, uiAmount: uiAmount, owner: parsed.info.owner });
                    }
                }
            } catch (e) { /* skip malformed */ }
        }

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

function renderHolders(holders) {
    const holdersEl = document.getElementById('holders');
    const holderList = document.getElementById('holderList');
    const totalSupply = holders.reduce((sum, h) => sum + parseFloat(h.amount), 0);

    holdersEl.textContent = `${holders.length} holders`;
    holderList.innerHTML = '';

    holders.forEach((holder, index) => {
        const amount = parseFloat(holder.amount) / Math.pow(10, tokenDecimals);
        const percentage = totalSupply > 0 ? (parseFloat(holder.amount) / totalSupply * 100).toFixed(2) : '0.00';

        let amountFormatted;
        if (amount >= 1000000) amountFormatted = (amount / 1000000).toFixed(2) + 'M';
        else if (amount >= 1000) amountFormatted = (amount / 1000).toFixed(2) + 'K';
        else amountFormatted = amount.toFixed(2);

        const item = document.createElement('div');
        item.className = 'holder-item';
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

// Token-2022 tokens return uiAmount as null in getTransaction — must compute manually
function getHumanAmount(balanceEntry) {
    if (!balanceEntry || !balanceEntry.uiTokenAmount) return 0;
    if (balanceEntry.uiTokenAmount.uiAmount != null) {
        return balanceEntry.uiTokenAmount.uiAmount;
    }
    const decimals = balanceEntry.uiTokenAmount.decimals || 9;
    const raw = balanceEntry.uiTokenAmount.amount || '0';
    return parseFloat(raw) / Math.pow(10, decimals);
}

async function fetchDetailedTransactions() {
    const txList = document.getElementById('transactionList');
    if (!txList) return;

    try {
        console.log('Fetching transactions...');
        txList.innerHTML = '<div class="loading-more">Loading transactions...</div>';
        
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [TOKEN_CA, { limit: 40 }] })
        });

        const data = await response.json();
        console.log('Got', data.result ? data.result.length : 0, 'signatures');
        
        if (!data.result || data.result.length === 0) {
            txList.innerHTML = '<div class="loading-more">No transactions found</div>';
            return;
        }

        txList.innerHTML = '';
        let rendered = 0;
        const TARGET = 20;

        for (let i = 0; i < data.result.length && rendered < TARGET; i++) {
            const sig = data.result[i];
            const txDetail = await fetchTransactionDetail(sig.signature);
            if (!txDetail) continue;

            rendered++;

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
                <div><span class="tx-type ${txDetail.type}">${txDetail.type.toUpperCase()}</span></div>
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

async function fetchTransactionDetail(signature) {
    try {
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTransaction', params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }] })
        });

        const data = await response.json();
        if (!data.result || !data.result.transaction) return null;

        const tx = data.result.transaction;
        const meta = data.result.meta;
        if (!meta || !meta.postTokenBalances || !meta.preTokenBalances) return null;

        const maker = tx.message.accountKeys[0]?.pubkey || 'Unknown';

        // 404 token amount — largest single-account change for this mint
        let maxTokenChange = 0;
        let tokenChangeSign = 0;

        meta.postTokenBalances.forEach(postB => {
            if (postB.mint !== TOKEN_CA) return;
            const preB = meta.preTokenBalances.find(p => p.accountIndex === postB.accountIndex && p.mint === TOKEN_CA);
            const change = getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0);
            if (Math.abs(change) > maxTokenChange) {
                maxTokenChange = Math.abs(change);
                tokenChangeSign = change > 0 ? 1 : -1;
            }
        });
        // Pre-only accounts (closed in post)
        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== TOKEN_CA) return;
            if (!meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex)) {
                const amt = getHumanAmount(preB);
                if (amt > maxTokenChange) { maxTokenChange = amt; tokenChangeSign = -1; }
            }
        });

        const tokenAmount = maxTokenChange;
        if (tokenAmount < 0.01) return null;

        // BUY/SELL detection
        let type = 'swap';
        const makerPre = meta.preTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
        const makerPost = meta.postTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
        if (makerPre && makerPost) {
            type = (getHumanAmount(makerPost) - getHumanAmount(makerPre)) > 0 ? 'buy' : 'sell';
        } else {
            type = tokenChangeSign > 0 ? 'buy' : 'sell';
        }

        // XNT amount — dual-pass WXNT scanning
        let xntAmount = 0;

        // Pass 1: accounts present in post
        meta.postTokenBalances.forEach(postB => {
            if (postB.mint !== WXNT_ADDRESS) return;
            const preB = meta.preTokenBalances.find(p => p.accountIndex === postB.accountIndex && p.mint === WXNT_ADDRESS);
            const change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > xntAmount) xntAmount = change;
        });

        // Pass 2: accounts closed after full withdrawal
        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== WXNT_ADDRESS) return;
            if (!meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex && p.mint === WXNT_ADDRESS)) {
                const amt = getHumanAmount(preB);
                if (amt > xntAmount) xntAmount = amt;
            }
        });

        // Fallback: native lamport diffs
        if (xntAmount === 0 && meta.preBalances && meta.postBalances) {
            for (let i = 0; i < meta.preBalances.length; i++) {
                const diff = Math.abs(meta.postBalances[i] - meta.preBalances[i]) / 1e9;
                if (diff > 0.0005) { xntAmount = diff; break; }
            }
        }

        const price = (tokenAmount > 0 && xntAmount > 0) ? xntAmount / tokenAmount : 0;

        return { type, xntAmount: xntAmount.toFixed(4), tokenAmount: tokenAmount.toFixed(2), price, maker };
    } catch (error) {
        console.error('Error fetching tx detail:', error);
    }
    return null;
}

const FIXED_SUPPLY = 404404;

async function calculateMarketCap() {
    try {
        if (currentPrice) {
            const marketCap = currentPrice * FIXED_SUPPLY;
            let formatted;
            if (marketCap >= 1000000) formatted = `${(marketCap / 1000000).toFixed(2)}M`;
            else if (marketCap >= 1000) formatted = `${(marketCap / 1000).toFixed(2)}K`;
            else if (marketCap >= 1) formatted = marketCap.toFixed(2);
            else formatted = marketCap.toFixed(4);
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

async function initializeTokenData() {
    if (!document.getElementById('priceXNT')) return;
    console.log('Initializing token data...');
    try {
        await fetchTokenPrice();
        await calculateMarketCap();
        fetchAllHolders();
        fetchDetailedTransactions();
    } catch (error) {
        console.error('Error initializing token data:', error);
    }
}

if (document.getElementById('priceXNT')) {
    initializeTokenData();
    setInterval(async () => {
        await fetchTokenPrice();
        await calculateMarketCap();
    }, 30000);
}

// Feed tab switching
document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-feed');
        document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.feed-panel').forEach(p => p.classList.remove('active'));
        if (target === 'transactions') document.getElementById('feedTransactions').classList.add('active');
        else if (target === 'holders') document.getElementById('feedHolders').classList.add('active');
    });
});

// ─── Live Candlestick Chart ─────────────────────────────────────────────────
// X1 Wallet injects SES (lockdown-install.js) at document_start which freezes
// Element.prototype in the parent realm — getBoundingClientRect disappears and
// LightweightCharts crashes. Even newly created elements inherit the frozen
// prototype, and srcdoc iframes share the parent's realm in Chrome, so SES
// bleeds through sandbox="allow-scripts" on srcdoc.
//
// Solution: data: URL iframe.
//   • Parent fetches LWC source (parent has no sandbox, fetch works).
//   • Builds a complete HTML document with LWC inlined as a <script> block.
//   • Creates a data: URL with encodeURIComponent(), sets iframe.src = dataURL.
//   • Data URL iframes get an opaque origin and isolated realm —
//     Chrome extensions cannot inject content scripts into them.
//   • sandbox="allow-scripts" (no allow-same-origin) further ensures isolation.
//   • Parent posts trade data via postMessage; iframe posts OHLCV back.

(function() {
    var container = document.getElementById('chartContainer');
    if (!container) return;

    // ── Single set of parent-side state ──
    var iframe = null;
    var allTrades = [];
    var currentTF = 60;
    var showVolume = true;
    var iframeReady = false;
    var messageQueue = [];   // holds messages until iframe posts chartReady

    // ── Send to iframe — queues if not ready ──
    function sendToChart(msg) {
        if (!iframeReady || !iframe) {
            messageQueue.push(msg);
            return;
        }
        try { iframe.contentWindow.postMessage(msg, '*'); }
        catch(e) { /* not yet accessible */ }
    }

    // ── Listen for messages FROM iframe ──
    window.addEventListener('message', function(e) {
        if (!e.data || !e.data.type) return;
        if (e.data.type === 'chartReady') {
            iframeReady = true;
            console.log('Chart iframe ready — flushing ' + messageQueue.length + ' queued messages');
            messageQueue.forEach(function(msg) {
                try { iframe.contentWindow.postMessage(msg, '*'); } catch(err) {}
            });
            messageQueue = [];
        }
        if (e.data.type === 'ohlcv') {
            var d = e.data;
            document.getElementById('ohlcO').textContent = d.o.toFixed(6);
            document.getElementById('ohlcH').textContent = d.h.toFixed(6);
            document.getElementById('ohlcL').textContent = d.l.toFixed(6);
            document.getElementById('ohlcC').textContent = d.cl.toFixed(6);
            document.getElementById('ohlcV').textContent = Math.round(d.v).toLocaleString();
        }
    });

    // ── Chart script that runs INSIDE the blob iframe ──
    var CHART_SCRIPT = [
        '(function() {',
        '  // ── CRITICAL: Override frozen getBoundingClientRect ──',
        '  (function() {',
        '    var isWorking = false;',
        '    try {',
        '      var testDiv = document.createElement("div");',
        '      testDiv.getBoundingClientRect();',
        '      console.log("[iframe] getBoundingClientRect native - OK");',
        '      isWorking = true;',
        '    } catch (e) {',
        '      console.warn("[iframe] getBoundingClientRect frozen:", e.message);',
        '    }',
        '    ',
        '    if (!isWorking) {',
        '      console.log("[iframe] Attempting to install polyfill on frozen prototype...");',
        '      ',
        '      // Create polyfill function',
        '      var polyfillGetBCR = function() {',
        '        var rect = {',
        '          width: this.offsetWidth || this.clientWidth || 0,',
        '          height: this.offsetHeight || this.clientHeight || 0,',
        '          top: 0,',
        '          left: 0',
        '        };',
        '        var el = this;',
        '        while (el && el.offsetParent) {',
        '          rect.left += el.offsetLeft || 0;',
        '          rect.top += el.offsetTop || 0;',
        '          el = el.offsetParent;',
        '        }',
        '        rect.right = rect.left + rect.width;',
        '        rect.bottom = rect.top + rect.height;',
        '        rect.x = rect.left;',
        '        rect.y = rect.top;',
        '        return rect;',
        '      };',
        '      ',
        '      // Try to force override despite freeze',
        '      try {',
        '        Object.defineProperty(Element.prototype, "getBoundingClientRect", {',
        '          value: polyfillGetBCR,',
        '          writable: true,',
        '          enumerable: false,',
        '          configurable: true',
        '        });',
        '        console.log("[iframe] Polyfill installed via defineProperty");',
        '      } catch (defineErr) {',
        '        console.error("[iframe] defineProperty failed (prototype frozen):", defineErr.message);',
        '        ',
        '        // NUCLEAR OPTION: Patch every element individually',
        '        console.log("[iframe] Installing per-element patches...");',
        '        var originalCreate = document.createElement;',
        '        document.createElement = function(tag) {',
        '          var el = originalCreate.call(document, tag);',
        '          if (!el.getBoundingClientRect || typeof el.getBoundingClientRect !== "function") {',
        '            el.getBoundingClientRect = polyfillGetBCR;',
        '          }',
        '          return el;',
        '        };',
        '        ',
        '        var originalGetId = document.getElementById;',
        '        document.getElementById = function(id) {',
        '          var el = originalGetId.call(document, id);',
        '          if (el && (!el.getBoundingClientRect || typeof el.getBoundingClientRect !== "function")) {',
        '            el.getBoundingClientRect = polyfillGetBCR;',
        '          }',
        '          return el;',
        '        };',
        '        ',
        '        console.log("[iframe] Per-element patches installed");',
        '      }',
        '      ',
        '      // Final verification',
        '      try {',
        '        var verify = document.createElement("div");',
        '        verify.style.cssText = "width:100px;height:50px;";',
        '        document.body.appendChild(verify);',
        '        var r = verify.getBoundingClientRect();',
        '        document.body.removeChild(verify);',
        '        console.log("[iframe] Polyfill verified:", r.width + "x" + r.height);',
        '      } catch (verifyErr) {',
        '        console.error("[iframe] Polyfill verification failed:", verifyErr);',
        '      }',
        '    }',
        '  })();',
        '',
        '  var chart, candleSeries, volumeSeries;',
        '  var allTrades = [], currentTF = 60, showVolume = true;',
        '  var candleData = [], volumeData = [];',
        '',
        '  function init() {',
        '    try {',
        '      var el = document.getElementById("chart");',
        '      ',
        '      // Pre-flight check',
        '      console.log("[iframe] Pre-flight: el.clientWidth=" + el.clientWidth + ", el.clientHeight=" + el.clientHeight);',
        '      console.log("[iframe] Pre-flight: typeof el.getBoundingClientRect=" + typeof el.getBoundingClientRect);',
        '      ',
        '      if (typeof el.getBoundingClientRect === "function") {',
        '        try {',
        '          var testRect = el.getBoundingClientRect();',
        '          console.log("[iframe] Pre-flight getBCR test OK:", testRect.width + "x" + testRect.height);',
        '        } catch (testErr) {',
        '          console.error("[iframe] Pre-flight getBCR test FAILED:", testErr);',
        '        }',
        '      }',
        '      ',
        '      console.log("[iframe] Creating LightweightCharts with explicit dimensions...");',
        '      chart = LightweightCharts.createChart({',
        '        element: el,',
        '        width: el.clientWidth || 600,',
        '        height: el.clientHeight || 420,',
        '        layout: { background: { color: "#0a0e13" }, textColor: "#8892b0", fontSize: 11, fontFamily: "Share Tech Mono, monospace" },',
        '        grid: { vertLines: { color: "#1a1f2e" }, horzLines: { color: "#1a1f2e" } },',
        '        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },',
        '        timeScale: { ticksTargetTimestamp: true, timeVisible: true, secondsVisible: false, borderColor: "#1a1f2e" },',
        '        rightPriceScale: { borderColor: "#1a1f2e", entirelyVisible: true }',
        '      });',
        '      console.log("[iframe] Chart created successfully!");',
        '      ',
        '      candleSeries = chart.addCandlestickSeries({',
        '        upColor: "#4ecca3", downColor: "#e74c3c",',
        '        wickUpColor: "#4ecca3", wickDownColor: "#e74c3c",',
        '        borderUpColor: "#4ecca3", borderDownColor: "#e74c3c"',
        '      });',
        '      console.log("[iframe] Candlestick series added");',
        '      ',
        '      chart.addPriceScale({ scaleId: "volume", position: "left", visible: false, scaleMargins: { top: 0.7, bottom: 0 } });',
        '      volumeSeries = chart.addHistogramSeries({ color: "#4ecca3", priceScaleId: "volume", lastValuePoint: { visible: false } });',
        '      volumeSeries.applyOptions({ visible: showVolume });',
        '      console.log("[iframe] Volume series added");',
        '',
        '      chart.subscribeCrosshairMove(function(param) {',
        '        if (!param || !param.time || !candleSeries) return;',
        '        var c = param.seriesPrices.get(candleSeries);',
        '        if (!c) return;',
        '        var vol = volumeData.find(function(v){ return v.time === param.time; });',
        '        window.parent.postMessage({ type: "ohlcv", o: c.open, h: c.high, l: c.low, cl: c.close, v: vol ? vol.value : 0 }, "*");',
        '      });',
        '      console.log("[iframe] Crosshair listener attached");',
        '',
        '      new ResizeObserver(function(entries) {',
        '        if (!chart) return;',
        '        var r = entries[0].contentRect;',
        '        if (r.width > 0 && r.height > 0) chart.resize(r.width, r.height);',
        '      }).observe(el);',
        '      console.log("[iframe] ResizeObserver attached");',
        '',
        '      console.log("[iframe] chartReady posted");',
        '      window.parent.postMessage({ type: "chartReady" }, "*");',
        '      ',
        '    } catch (initErr) {',
        '      console.error("[iframe] Chart initialization FAILED:", initErr);',
        '      console.error("[iframe] Error stack:", initErr.stack);',
        '      document.getElementById("msg").textContent = "Chart init failed: " + initErr.message;',
        '    }',
        '  }',
        '',
        '  function buildAndRender(trades, tf) {',
        '    var tfSec = tf * 60;',
        '    var buckets = {};',
        '    trades.forEach(function(t) {',
        '      var b = Math.floor(t.time / tfSec) * tfSec;',
        '      if (!buckets[b]) buckets[b] = { time: b, open: t.price, high: t.price, low: t.price, close: t.price, volume: 0 };',
        '      var c = buckets[b];',
        '      if (t.price > c.high) c.high = t.price;',
        '      if (t.price < c.low) c.low = t.price;',
        '      c.close = t.price;',
        '      c.volume += t.token404;',
        '    });',
        '    var sorted = Object.keys(buckets).map(Number).sort(function(a,b){ return a-b; }).map(function(k){ return buckets[k]; });',
        '',
        '    // Gap fill',
        '    var filled = [];',
        '    for (var i = 0; i < sorted.length; i++) {',
        '      if (i > 0) {',
        '        var prev = sorted[i-1], t = prev.time + tfSec;',
        '        while (t < sorted[i].time) {',
        '          filled.push({ time: t, open: prev.close, high: prev.close, low: prev.close, close: prev.close, volume: 0 });',
        '          prev = filled[filled.length-1]; t += tfSec;',
        '        }',
        '      }',
        '      filled.push(sorted[i]);',
        '    }',
        '    candleData = filled;',
        '    volumeData = filled.map(function(c){ return { time: c.time, value: c.volume, color: c.close >= c.open ? "#4ecca344" : "#e74c3c44" }; });',
        '',
        '    candleSeries.setData(candleData);',
        '    volumeSeries.setData(volumeData);',
        '    chart.timeScale().fitContent();',
        '    console.log("[iframe] rendered " + candleData.length + " candles at tf=" + tf);',
        '',
        '    if (candleData.length > 0) {',
        '      var last = candleData[candleData.length-1];',
        '      window.parent.postMessage({ type: "ohlcv", o: last.open, h: last.high, l: last.low, cl: last.close, v: last.volume }, "*");',
        '    }',
        '  }',
        '',
        '  window.addEventListener("message", function(e) {',
        '    if (!e.data || !e.data.type) return;',
        '    switch(e.data.type) {',
        '      case "trades":',
        '        document.getElementById("msg").style.display = "none";',
        '        allTrades = e.data.trades;',
        '        currentTF = e.data.tf || 60;',
        '        buildAndRender(allTrades, currentTF);',
        '        break;',
        '      case "setTF":',
        '        currentTF = e.data.tf;',
        '        if (allTrades.length > 0) buildAndRender(allTrades, currentTF);',
        '        break;',
        '      case "setVol":',
        '        showVolume = e.data.vol;',
        '        if (volumeSeries) volumeSeries.applyOptions({ visible: showVolume });',
        '        break;',
        '      case "noData":',
        '        document.getElementById("msg").style.display = "flex";',
        '        document.getElementById("msg").textContent = e.data.msg || "No data";',
        '        break;',
        '    }',
        '  });',
        '',
        '  // LWC is inlined above — call init() immediately',
        '  init();',
        '})();'
    ].join('\n');

    // ── Fetch LWC source in parent, then build blob iframe ──
    fetch('https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js')
    .then(function(res) { return res.text(); })
    .then(function(lwcSource) {
        console.log('LightweightCharts source fetched, length=' + lwcSource.length);

        // Build iframe with strict CSP to block extension interference
        var html =
            '<!DOCTYPE html><html><head>' +
            '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:;">' +
            '<style>' +
            '* { margin:0; padding:0; box-sizing:border-box; }' +
            'body { background:#0a0e13; overflow:hidden; width:100%; height:100%; }' +
            '#chart { width:100%; height:100%; }' +
            '#msg { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;' +
            '       color:#8892b0; font-family:"Share Tech Mono",monospace; font-size:0.9rem; pointer-events:none; }' +
            '</style></head><body>' +
            '<div id="chart"></div>' +
            '<div id="msg">Loading chart...</div>' +
            '<script>' + lwcSource + '</script>' +
            '<script>' + CHART_SCRIPT + '</script>' +
            '</body></html>';

        iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
        // Use srcdoc with strict sandbox - NO allow-same-origin to prevent extension injection
        iframe.setAttribute('sandbox', 'allow-scripts');
        iframe.setAttribute('srcdoc', html);

        var loadingEl = container.querySelector('.chart-loading');
        if (loadingEl) loadingEl.remove();
        container.appendChild(iframe);

        console.log('Chart iframe created (srcdoc with strict CSP, extension-isolated)');
    })
    .catch(function(err) {
        console.error('Failed to fetch LightweightCharts:', err);
        var loadingEl = container.querySelector('.chart-loading');
        if (loadingEl) loadingEl.textContent = 'Chart unavailable';
    });

    // ── Parse single tx → trade ──
    function parseTrade(sig, txData) {
        if (!txData.result || !txData.result.meta) return null;
        var meta = txData.result.meta;
        if (!meta.postTokenBalances || !meta.preTokenBalances) return null;

        var token404 = 0;
        meta.postTokenBalances.forEach(function(postB) {
            if (postB.mint !== TOKEN_CA) return;
            var preB = meta.preTokenBalances.find(function(p) { return p.accountIndex === postB.accountIndex && p.mint === TOKEN_CA; });
            var change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > token404) token404 = change;
        });
        meta.preTokenBalances.forEach(function(preB) {
            if (preB.mint !== TOKEN_CA) return;
            if (!meta.postTokenBalances.find(function(p) { return p.accountIndex === preB.accountIndex && p.mint === TOKEN_CA; })) {
                var amt = getHumanAmount(preB);
                if (amt > token404) token404 = amt;
            }
        });
        if (token404 < 0.01) return null;

        var xnt = 0;
        meta.postTokenBalances.forEach(function(postB) {
            if (postB.mint !== WXNT_ADDRESS) return;
            var preB = meta.preTokenBalances.find(function(p) { return p.accountIndex === postB.accountIndex && p.mint === WXNT_ADDRESS; });
            var change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > xnt) xnt = change;
        });
        meta.preTokenBalances.forEach(function(preB) {
            if (preB.mint !== WXNT_ADDRESS) return;
            if (!meta.postTokenBalances.find(function(p) { return p.accountIndex === preB.accountIndex && p.mint === WXNT_ADDRESS; })) {
                var amt = getHumanAmount(preB);
                if (amt > xnt) xnt = amt;
            }
        });
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

    // ── Fetch trades sequentially (respects RPC rate limits) ──
    async function fetchTrades() {
        try {
            var sigRes = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [TOKEN_CA, { limit: 1000 }] })
            });
            var sigData = await sigRes.json();
            if (!sigData.result || sigData.result.length === 0) {
                sendToChart({ type: 'noData', msg: 'No transactions found' });
                return;
            }

            var sigs = sigData.result;
            var trades = [];
            var MAX_TRADES = 100;

            for (var i = 0; i < sigs.length && trades.length < MAX_TRADES; i++) {
                try {
                    var txRes = await fetch(X1_RPC, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'getTransaction', params: [sigs[i].signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }] })
                    });
                    var txData = await txRes.json();
                    if (!txData || !txData.result) continue;
                    var trade = parseTrade(sigs[i], txData);
                    if (trade) trades.push(trade);
                } catch(e) { continue; }
            }

            trades.sort(function(a, b) { return a.time - b.time; });
            allTrades = trades;
            console.log('Chart: fetched ' + trades.length + ' trades from ' + sigs.length + ' signatures');

            if (trades.length > 0) {
                sendToChart({ type: 'trades', trades: allTrades, tf: currentTF });

                var latest = allTrades[allTrades.length - 1];
                var priceEl = document.getElementById('chartPrice');
                var changeEl = document.getElementById('chartPriceChange');
                if (priceEl) priceEl.textContent = latest.price.toFixed(6) + ' XNT';

                var target24h = latest.time - 86400;
                var price24h = null;
                for (var k = 0; k < allTrades.length; k++) {
                    if (allTrades[k].time >= target24h) { price24h = allTrades[k].price; break; }
                }
                if (changeEl && price24h && price24h > 0) {
                    var pct = ((latest.price - price24h) / price24h) * 100;
                    changeEl.textContent = '(' + (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%)';
                    changeEl.className = 'chart-price-change ' + (pct >= 0 ? 'positive' : 'negative');
                }
            } else {
                sendToChart({ type: 'noData', msg: 'No swap trades found yet' });
            }
        } catch(e) {
            console.error('Chart fetch error:', e);
            sendToChart({ type: 'noData', msg: 'Error loading chart' });
        }
    }

    // ── Timeframe buttons — bound in parent, posted to iframe ──
    document.querySelectorAll('.chart-tf-btn[data-tf]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tf = parseInt(btn.getAttribute('data-tf'));
            if (isNaN(tf)) return;
            currentTF = tf;
            document.querySelectorAll('.chart-tf-btn[data-tf]').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var labels = {1:'1m', 5:'5m', 15:'15m', 60:'1h', 240:'4h', 1440:'1d'};
            document.querySelector('.chart-timeframe-label').textContent = labels[tf] || tf+'m';
            sendToChart({ type: 'setTF', tf: currentTF });
        });
    });

    // ── Volume toggle ──
    var volBtn = document.getElementById('volToggle');
    if (volBtn) {
        volBtn.classList.toggle('active', showVolume);
        volBtn.addEventListener('click', function() {
            showVolume = !showVolume;
            volBtn.classList.toggle('active', showVolume);
            sendToChart({ type: 'setVol', vol: showVolume });
        });
    }

    // ── Initial fetch + 60s auto-refresh ──
    fetchTrades();
    setInterval(fetchTrades, 60000);

})();
