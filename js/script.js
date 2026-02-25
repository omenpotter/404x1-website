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

// NOTE: These functions will be OVERRIDDEN at the end of this file by XDEX API
async function fetchTokenPrice() {
    return null; // Will be replaced
}

async function calculateMarketCap() {
    return; // Will be replaced
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
                if (data.result && data.result.length > 0) {
                    allAccounts = allAccounts.concat(data.result);
                }
            } catch (e) {
                console.log(`getProgramAccounts failed for ${programId.slice(0,8)}:`, e.message);
            }
        }

        if (allAccounts.length === 0) {
            const res = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenLargestAccounts', params: [TOKEN_CA, { commitment: 'confirmed', limit: 500 }] })
            });
            const data = await res.json();
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
        txList.innerHTML = '<div class="loading-more">Loading transactions...</div>';
        
        const response = await fetch(X1_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [TOKEN_CA, { limit: 40 }] })
        });

        const data = await response.json();
        
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
        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== TOKEN_CA) return;
            if (!meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex)) {
                const amt = getHumanAmount(preB);
                if (amt > maxTokenChange) { maxTokenChange = amt; tokenChangeSign = -1; }
            }
        });

        const tokenAmount = maxTokenChange;
        if (tokenAmount < 0.01) return null;

        let type = 'swap';
        const makerPre = meta.preTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
        const makerPost = meta.postTokenBalances.find(b => b.mint === TOKEN_CA && b.owner === maker);
        if (makerPre && makerPost) {
            type = (getHumanAmount(makerPost) - getHumanAmount(makerPre)) > 0 ? 'buy' : 'sell';
        } else {
            type = tokenChangeSign > 0 ? 'buy' : 'sell';
        }

        let xntAmount = 0;

        meta.postTokenBalances.forEach(postB => {
            if (postB.mint !== WXNT_ADDRESS) return;
            const preB = meta.preTokenBalances.find(p => p.accountIndex === postB.accountIndex && p.mint === WXNT_ADDRESS);
            const change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > xntAmount) xntAmount = change;
        });

        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== WXNT_ADDRESS) return;
            if (!meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex && p.mint === WXNT_ADDRESS)) {
                const amt = getHumanAmount(preB);
                if (amt > xntAmount) xntAmount = amt;
            }
        });

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

async function initializeTokenData() {
    if (!document.getElementById('priceXNT')) return;
    try {
        await fetchTokenPrice();
        await calculateMarketCap();
        fetchAllHolders();
        fetchDetailedTransactions();
    } catch (error) {
        console.error('Error initializing token data:', error);
    }
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

// ─── Live Candlestick Chart (FULLY FIXED) ─────────────────────────────────────
(function() {
    const container = document.getElementById('chartContainer');
    if (!container) return;

    let iframe = null;
    let allTrades = [];
    let currentTF = 60;
    let showVolume = true;
    let iframeReady = false;
    const messageQueue = [];

    function sendToChart(msg) {
        if (!iframeReady || !iframe) {
            messageQueue.push(msg);
            return;
        }
        try { iframe.contentWindow.postMessage(msg, '*'); } catch(e) {}
    }

    window.addEventListener('message', e => {
        if (!e.data?.type) return;
        if (e.data.type === 'chartReady') {
            iframeReady = true;
            messageQueue.forEach(m => { try { iframe.contentWindow.postMessage(m, '*'); } catch(err) {} });
            messageQueue.length = 0;
        }
        if (e.data.type === 'ohlcv') {
            const d = e.data;
            document.getElementById('ohlcO').textContent = d.o.toFixed(6);
            document.getElementById('ohlcH').textContent = d.h.toFixed(6);
            document.getElementById('ohlcL').textContent = d.l.toFixed(6);
            document.getElementById('ohlcC').textContent = d.cl.toFixed(6);
            document.getElementById('ohlcV').textContent = Math.round(d.v).toLocaleString();
        }
    });

    const CHART_SCRIPT = `
(function() {
  // Minimal getBoundingClientRect polyfill (for X1 Wallet SES freeze)
  (function() {
    try {
      document.createElement('div').getBoundingClientRect();
    } catch(e) {
      const poly = function() {
        return { width: this.offsetWidth || this.clientWidth || 0, height: this.offsetHeight || this.clientHeight || 0, top:0, left:0, right:0, bottom:0, x:0, y:0 };
      };
      try { Object.defineProperty(Element.prototype, 'getBoundingClientRect', {value: poly, writable:true, configurable:true}); }
      catch(err) {
        const orig = document.createElement;
        document.createElement = function(tag) {
          const el = orig.call(document, tag);
          el.getBoundingClientRect = poly;
          return el;
        };
      }
    }
  })();

  let chart, candleSeries, volumeSeries;
  let allTrades = [], currentTF = 60, showVolume = true;
  let candleData = [], volumeData = [];

  function init() {
    try {
      const el = document.getElementById('chart');
      const width = el.clientWidth || 600;
      const height = el.clientHeight || 420;

      chart = LightweightCharts.createChart(el, {
        width, height,
        layout: { background: { color: '#0a0e13' }, textColor: '#8892b0', fontSize: 11, fontFamily: 'Share Tech Mono, monospace' },
        grid: { vertLines: { color: '#1a1f2e' }, horzLines: { color: '#1a1f2e' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#1a1f2e' },
        rightPriceScale: { borderColor: '#1a1f2e' }
      });

      candleSeries = chart.addCandlestickSeries({
        upColor: '#4ecca3', downColor: '#e74c3c',
        wickUpColor: '#4ecca3', wickDownColor: '#e74c3c',
        borderUpColor: '#4ecca3', borderDownColor: '#e74c3c'
      });

      volumeSeries = chart.addHistogramSeries({
        color: '#4ecca3',
        priceScaleId: 'volume',
        lastValuePoint: { visible: false }
      });

      chart.priceScale('volume').applyOptions({
        position: 'left',
        visible: false,
        scaleMargins: { top: 0.7, bottom: 0 }
      });
      volumeSeries.applyOptions({ visible: showVolume });

      chart.subscribeCrosshairMove(param => {
        if (!param?.time || !candleSeries) return;
        const c = param.seriesPrices?.get(candleSeries);
        if (!c) return;
        const vol = volumeData.find(v => v.time === param.time);
        window.parent.postMessage({ type: 'ohlcv', o: c.open, h: c.high, l: c.low, cl: c.close, v: vol ? vol.value : 0 }, '*');
      });

      new ResizeObserver(entries => {
        const r = entries[0].contentRect;
        if (r.width > 0 && r.height > 0) chart.resize(r.width, r.height);
      }).observe(el);

      window.parent.postMessage({ type: 'chartReady' }, '*');
    } catch (err) {
      console.error('[iframe] Chart init FAILED:', err);
      document.getElementById('msg').textContent = 'Chart failed: ' + err.message;
    }
  }

  function buildAndRender(trades, tf) {
    const tfSec = tf * 60;
    const buckets = {};
    trades.forEach(t => {
      const b = Math.floor(t.time / tfSec) * tfSec;
      if (!buckets[b]) buckets[b] = { time: b, open: t.price, high: t.price, low: t.price, close: t.price, volume: 0 };
      const c = buckets[b];
      if (t.price > c.high) c.high = t.price;
      if (t.price < c.low) c.low = t.price;
      c.close = t.price;
      c.volume += t.token404;
    });
    const sorted = Object.keys(buckets).map(Number).sort((a,b)=>a-b).map(k=>buckets[k]);
    const filled = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0) {
        let prev = sorted[i-1], t = prev.time + tfSec;
        while (t < sorted[i].time) {
          filled.push({ time: t, open: prev.close, high: prev.close, low: prev.close, close: prev.close, volume: 0 });
          prev = filled[filled.length-1];
          t += tfSec;
        }
      }
      filled.push(sorted[i]);
    }
    candleData = filled;
    volumeData = filled.map(c => ({ time: c.time, value: c.volume, color: c.close >= c.open ? '#4ecca344' : '#e74c3c44' }));
    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();
    if (candleData.length > 0) {
      const last = candleData[candleData.length-1];
      window.parent.postMessage({ type: 'ohlcv', o: last.open, h: last.high, l: last.low, cl: last.close, v: last.volume }, '*');
    }
  }

  window.addEventListener('message', e => {
    if (!e.data?.type) return;
    switch(e.data.type) {
      case 'trades': allTrades = e.data.trades; currentTF = e.data.tf || 60; buildAndRender(allTrades, currentTF); document.getElementById('msg').style.display = 'none'; break;
      case 'setTF': currentTF = e.data.tf; if (allTrades.length) buildAndRender(allTrades, currentTF); break;
      case 'setVol': showVolume = e.data.vol; if (volumeSeries) volumeSeries.applyOptions({ visible: showVolume }); break;
      case 'noData': document.getElementById('msg').style.display = 'flex'; document.getElementById('msg').textContent = e.data.msg || 'No data'; break;
    }
  });

  init();
})();
    `;

    fetch('https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js')
      .then(r => r.text())
      .then(lwc => {
        const html = `<!DOCTYPE html><html><head>
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
          <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0e13;overflow:hidden;width:100%;height:100%}#chart{width:100%;height:100%}#msg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8892b0;font-family:"Share Tech Mono",monospace;font-size:0.9rem;pointer-events:none}</style>
        </head><body>
          <div id="chart"></div>
          <div id="msg">Loading chart...</div>
          <script>${lwc}</script>
          <script>${CHART_SCRIPT}</script>
        </body></html>`;

        iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
        iframe.sandbox = 'allow-scripts';
        iframe.srcdoc = html;
        container.innerHTML = '';
        container.appendChild(iframe);
      })
      .catch(err => console.error('Failed to load Lightweight Charts:', err));

    function parseTrade(sig, txData) {
        if (!txData.result || !txData.result.meta) return null;
        const meta = txData.result.meta;
        if (!meta.postTokenBalances || !meta.preTokenBalances) return null;

        let token404 = 0;
        meta.postTokenBalances.forEach(postB => {
            if (postB.mint !== TOKEN_CA) return;
            const preB = meta.preTokenBalances.find(p => p.accountIndex === postB.accountIndex && p.mint === TOKEN_CA);
            const change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > token404) token404 = change;
        });
        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== TOKEN_CA) return;
            if (!meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex && p.mint === TOKEN_CA)) {
                const amt = getHumanAmount(preB);
                if (amt > token404) token404 = amt;
            }
        });
        if (token404 < 0.01) return null;

        let xnt = 0;
        meta.postTokenBalances.forEach(postB => {
            if (postB.mint !== WXNT_ADDRESS) return;
            const preB = meta.preTokenBalances.find(p => p.accountIndex === postB.accountIndex && p.mint === WXNT_ADDRESS);
            const change = Math.abs(getHumanAmount(postB) - (preB ? getHumanAmount(preB) : 0));
            if (change > xnt) xnt = change;
        });
        meta.preTokenBalances.forEach(preB => {
            if (preB.mint !== WXNT_ADDRESS) return;
            if (!meta.postTokenBalances.find(p => p.accountIndex === preB.accountIndex && p.mint === WXNT_ADDRESS)) {
                const amt = getHumanAmount(preB);
                if (amt > xnt) xnt = amt;
            }
        });
        if (xnt === 0 && meta.preBalances && meta.postBalances) {
            let maxDiff = 0;
            for (let j = 0; j < meta.preBalances.length; j++) {
                const diff = Math.abs(meta.postBalances[j] - meta.preBalances[j]) / 1e9;
                if (diff > maxDiff) maxDiff = diff;
            }
            if (maxDiff > 0.0005) xnt = maxDiff;
        }

        if (xnt > 0 && token404 > 0) {
            const price = xnt / token404;
            if (price < 0.0001 || price > 0.1) {
                return null;
            }
            return { time: sig.blockTime, price: price, xnt: xnt, token404: token404 };
        }
        return null;
    }

    function updatePriceDisplay(trades) {
        if (trades.length === 0) return;
        
        const latest = trades[trades.length - 1];
        const priceEl = document.getElementById('chartPrice');
        const changeEl = document.getElementById('chartPriceChange');
        
        if (priceEl) priceEl.textContent = latest.price.toFixed(6) + ' XNT';

        const target24h = latest.time - 86400;
        const price24h = trades.find(t => t.time >= target24h)?.price;
        if (changeEl && price24h) {
            const pct = ((latest.price - price24h) / price24h) * 100;
            changeEl.textContent = '(' + (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%)';
            changeEl.className = 'chart-price-change ' + (pct >= 0 ? 'positive' : 'negative');
        }
    }

    async function fetchTrades() {
        try {
            const CACHE_KEY = 'chart_trades_cache';
            const CACHE_DURATION = 5 * 60 * 1000;
            const cached = localStorage.getItem(CACHE_KEY);
            
            if (cached) {
                try {
                    const { trades: cachedTrades, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION && cachedTrades.length > 0) {
                        console.log(`[Chart] Using cached data (${cachedTrades.length} trades)`);
                        allTrades = cachedTrades;
                        sendToChart({ type: 'trades', trades: allTrades, tf: currentTF });
                        updatePriceDisplay(cachedTrades);
                        return;
                    }
                } catch (e) {
                    console.warn('[Chart] Cache invalid, refetching...');
                }
            }
            
            console.log('[Chart] Fetching fresh data...');
            const sigRes = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [TOKEN_CA, { limit: 1000 }] })
            });
            const sigData = await sigRes.json();
            if (!sigData.result || sigData.result.length === 0) {
                sendToChart({ type: 'noData', msg: 'No transactions found' });
                return;
            }

            const sigs = sigData.result;
            const trades = [];
            const MAX_TRADES = 200;
            const MAX_SIGS_TO_CHECK = 300;
            const BATCH_SIZE = 20;
            
            console.log(`[Chart] Processing ${MAX_SIGS_TO_CHECK} transactions in batches of ${BATCH_SIZE}...`);

            for (let i = 0; i < Math.min(sigs.length, MAX_SIGS_TO_CHECK) && trades.length < MAX_TRADES; i += BATCH_SIZE) {
                const batchSigs = sigs.slice(i, i + BATCH_SIZE);
                
                const batchRequest = batchSigs.map((sig, idx) => ({
                    jsonrpc: '2.0',
                    id: i + idx,
                    method: 'getTransaction',
                    params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
                }));

                try {
                    const batchRes = await fetch(X1_RPC, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(batchRequest)
                    });
                    
                    const batchData = await batchRes.json();
                    
                    batchData.forEach((txData, idx) => {
                        if (!txData?.result) return;
                        const trade = parseTrade(batchSigs[idx], txData);
                        if (trade) trades.push(trade);
                    });
                    
                    console.log(`[Chart] Processed batch ${Math.floor(i/BATCH_SIZE) + 1}, found ${trades.length} trades so far...`);
                    
                } catch(e) {
                    console.warn('[Chart] Batch request failed:', e);
                    continue;
                }
                
                if (trades.length >= MAX_TRADES) break;
            }

            trades.sort((a, b) => a.time - b.time);
            allTrades = trades;

            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    trades: allTrades,
                    timestamp: Date.now()
                }));
                console.log('[Chart] Data cached for 5 minutes');
            } catch (e) {
                console.warn('[Chart] Failed to cache data:', e);
            }

            console.log(`[Chart] ✅ Finished! Processed ${Math.min(sigs.length, MAX_SIGS_TO_CHECK)} transactions, found ${trades.length} valid trades`);
            if (trades.length > 0) {
                sendToChart({ type: 'trades', trades: allTrades, tf: currentTF });
                updatePriceDisplay(allTrades);
            } else {
                sendToChart({ type: 'noData', msg: 'No swap trades found yet' });
            }
        } catch(e) {
            console.error('Chart fetch error:', e);
            sendToChart({ type: 'noData', msg: 'Error loading chart' });
        }
    }

    document.querySelectorAll('.chart-tf-btn[data-tf]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tf = parseInt(btn.getAttribute('data-tf'));
            if (isNaN(tf)) return;
            currentTF = tf;
            document.querySelectorAll('.chart-tf-btn[data-tf]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const labels = {1:'1m',5:'5m',15:'15m',60:'1h',240:'4h',1440:'1d'};
            document.querySelector('.chart-timeframe-label').textContent = labels[tf] || tf+'m';
            sendToChart({ type: 'setTF', tf: currentTF });
        });
    });

    const volBtn = document.getElementById('volToggle');
    if (volBtn) {
        volBtn.classList.toggle('active', showVolume);
        volBtn.addEventListener('click', () => {
            showVolume = !showVolume;
            volBtn.classList.toggle('active', showVolume);
            sendToChart({ type: 'setVol', vol: showVolume });
        });
    }

    fetchTrades();
    setInterval(fetchTrades, 60000);
})();

// ========================================
// XDEX API OVERRIDE - MUST BE LAST!
// ========================================
(function() {
    console.log('🚀 Loading XDEX API price override...');
    
    const TOKEN_CA = '4o4UheANLdqF4gSV4zWTbCTCercQNSaTm6nVcDetzPb2';
    const TOTAL_SUPPLY = 404404;
    
    // OVERRIDE fetchTokenPrice
    window.fetchTokenPrice = async function() {
        console.log('📊 Fetching price from XDEX API...');
        try {
            const res = await fetch(`https://api.xdex.xyz/api/token-price/price?network=X1%20Mainnet&address=${TOKEN_CA}`);
            const data = await res.json();
            
            if (data?.price) {
                window.currentPrice = data.price;
                const priceEl = document.getElementById('priceXNT');
                const chartPriceEl = document.getElementById('chartPrice');
                const chartPriceChangeEl = document.getElementById('chartPriceChange');
                
                if (priceEl) priceEl.textContent = `${data.price.toFixed(6)} XNT`;
                if (chartPriceEl) chartPriceEl.textContent = `${data.price.toFixed(6)} XNT`;
                
                if (chartPriceChangeEl && data.change_24h !== undefined) {
                    const isPos = data.change_24h >= 0;
                    chartPriceChangeEl.textContent = `(${isPos ? '+' : ''}${data.change_24h.toFixed(2)}%)`;
                    chartPriceChangeEl.style.color = isPos ? '#00ff00' : '#ff0000';
                }
                
                console.log('✅ Price updated:', data.price, 'XNT');
                return data.price;
            }
        } catch (e) {
            console.error('❌ XDEX API error:', e);
        }
        return null;
    };
    
    // OVERRIDE calculateMarketCap
    window.calculateMarketCap = function() {
        console.log('💰 Calculating market cap...');
        if (!window.currentPrice) {
            console.log('⚠️ No price yet');
            return;
        }
        const mcap = TOTAL_SUPPLY * window.currentPrice;
        const formatted = mcap >= 1e6 ? (mcap/1e6).toFixed(2)+'M' : 
                         mcap >= 1e3 ? (mcap/1e3).toFixed(2)+'K' : mcap.toFixed(2);
        document.getElementById('marketCap').textContent = `${formatted} XNT`;
        console.log('✅ Market cap:', formatted, 'XNT');
    };
    
    // INITIALIZE
    if (document.getElementById('priceXNT')) {
        console.log('📊 Starting XDEX price updates...');
        
        // Initial load
        fetchTokenPrice().then(() => {
            calculateMarketCap();
            fetchAllHolders();
            fetchDetailedTransactions();
        });
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            console.log('🔄 Auto-refresh...');
            fetchTokenPrice().then(calculateMarketCap);
        }, 30000);
    }
    
    console.log('✅ XDEX API override loaded!');
})();
// ========================================
// SIMPLE PRICE SYNC FIX - ADD TO END OF script.js
// ========================================
(function() {
    console.log('🔄 Starting price sync from chart...');
    
    const TOTAL_SUPPLY = 404404;
    
    // Function to sync price from chart to stats section
    function syncPriceFromChart() {
        const chartPriceEl = document.getElementById('chartPrice');
        const priceXNTEl = document.getElementById('priceXNT');
        const marketCapEl = document.getElementById('marketCap');
        
        if (!chartPriceEl || !priceXNTEl || !marketCapEl) return;
        
        // Get price from chart (format: "0.001859 XNT")
        const chartPriceText = chartPriceEl.textContent;
        
        // Extract just the number
        const priceMatch = chartPriceText.match(/(\d+\.\d+)/);
        
        if (priceMatch) {
            const price = parseFloat(priceMatch[1]);
            
            // Update Price XNT
            priceXNTEl.textContent = chartPriceText; // Copy exact format
            console.log('✅ Price synced from chart:', price, 'XNT');
            
            // Calculate Market Cap
            const mcap = price * TOTAL_SUPPLY;
            
            let formatted;
            if (mcap >= 1e6) {
                formatted = (mcap / 1e6).toFixed(2) + 'M';
            } else if (mcap >= 1e3) {
                formatted = (mcap / 1e3).toFixed(2) + 'K';
            } else {
                formatted = mcap.toFixed(2);
            }
            
            marketCapEl.textContent = `${formatted} XNT`;
            console.log('✅ Market cap calculated:', formatted, 'XNT');
            
            // Store in window for other functions
            window.currentPrice = price;
        }
    }
    
    // Watch for changes to chart price
    const chartPriceEl = document.getElementById('chartPrice');
    if (chartPriceEl) {
        // Initial sync after 2 seconds (wait for chart to load)
        setTimeout(syncPriceFromChart, 2000);
        
        // Watch for changes using MutationObserver
        const observer = new MutationObserver(() => {
            console.log('📊 Chart price changed, syncing...');
            syncPriceFromChart();
        });
        
        observer.observe(chartPriceEl, { 
            childList: true, 
            characterData: true, 
            subtree: true 
        });
        
        // Also sync every 5 seconds as backup
        setInterval(syncPriceFromChart, 5000);
        
        console.log('✅ Price sync active - watching chart price');
    }
})();

console.log('✅ Simple price sync loaded');
