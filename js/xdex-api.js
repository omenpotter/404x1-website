// xdex-api.js - XDEX API Integration for 404x1 Platform

const XDEX_API_BASE = 'https://api.xdex.xyz';
const NETWORK = 'X1%20Mainnet'; // URL-encoded "X1 Mainnet"

// Main token addresses for 404x1
const TOKEN_ADDRESSES = {
    XNT: 'XNMbEwZFFBKQhqyW3taa8cAUp1xBUHfyzRFJQvZET4m',
    WSOL: 'So11111111111111111111111111111111111111112',
    // Add your 404x1 token address here when minted
    TOKEN_404x1: 'YOUR_TOKEN_MINT_ADDRESS_HERE'
};

// Cache for API responses (5 minute TTL)
const cache = {
    prices: { data: null, timestamp: 0, ttl: 5 * 60 * 1000 },
    pools: { data: null, timestamp: 0, ttl: 5 * 60 * 1000 },
    validators: { data: null, timestamp: 0, ttl: 10 * 60 * 1000 }
};

// ============================================
// TOKEN PRICE ENDPOINTS
// ============================================

/**
 * Get multiple token prices in one call
 * @param {string[]} addresses - Array of token mint addresses
 * @returns {Promise<Object>} Price data for all tokens
 */
async function getTokenPrices(addresses = Object.values(TOKEN_ADDRESSES)) {
    const cacheKey = 'prices';
    
    // Check cache
    if (cache[cacheKey].data && Date.now() - cache[cacheKey].timestamp < cache[cacheKey].ttl) {
        return cache[cacheKey].data;
    }
    
    try {
        const addressList = addresses.join(',');
        const url = `${XDEX_API_BASE}/api/token-price/prices?network=${NETWORK}&token_addresses=${addressList}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Cache the result
        cache[cacheKey].data = data;
        cache[cacheKey].timestamp = Date.now();
        
        return data;
    } catch (error) {
        console.error('Error fetching token prices:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get single token price
 * @param {string} address - Token mint address
 * @returns {Promise<Object>} Price data
 */
async function getTokenPrice(address) {
    try {
        const url = `${XDEX_API_BASE}/api/token-price/price?network=${NETWORK}&address=${address}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching token price:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get LP token price
 * @param {string} lpMintAddress - LP token mint address
 * @returns {Promise<Object>} LP price data
 */
async function getLPTokenPrice(lpMintAddress) {
    try {
        const url = `${XDEX_API_BASE}/api/token-price/lp-price?network=${NETWORK}&address=${lpMintAddress}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching LP token price:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// WALLET TOKEN ENDPOINTS
// ============================================

/**
 * Get all tokens in a wallet with metadata
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<Object>} Wallet tokens with names, symbols, images
 */
async function getWalletTokens(walletAddress) {
    try {
        const url = `${XDEX_API_BASE}/api/xendex/wallet/tokens?network=${NETWORK}&wallet_address=${walletAddress}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching wallet tokens:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// POOL ENDPOINTS
// ============================================

/**
 * Get all pools on X1 Mainnet
 * @returns {Promise<Object>} List of all pools
 */
async function getAllPools() {
    const cacheKey = 'pools';
    
    // Check cache
    if (cache[cacheKey].data && Date.now() - cache[cacheKey].timestamp < cache[cacheKey].ttl) {
        return cache[cacheKey].data;
    }
    
    try {
        const url = `${XDEX_API_BASE}/api/xendex/pool/list?network=${NETWORK}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Cache the result
        cache[cacheKey].data = data;
        cache[cacheKey].timestamp = Date.now();
        
        return data;
    } catch (error) {
        console.error('Error fetching pools:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get pool status
 * @returns {Promise<Object>} Pool status information
 */
async function getPoolStatus() {
    try {
        const url = `${XDEX_API_BASE}/api/xendex/pool/status?network=${NETWORK}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching pool status:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get specific pool by address
 * @param {string} poolAddress - Pool address
 * @returns {Promise<Object>} Pool details
 */
async function getPool(poolAddress) {
    try {
        const url = `${XDEX_API_BASE}/api/xendex/pool/${poolAddress}?network=${NETWORK}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching pool:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get pool by token pair
 * @param {string} token1Address - First token address
 * @param {string} token2Address - Second token address
 * @returns {Promise<Object>} Pool for token pair
 */
async function getPoolByTokenPair(token1Address, token2Address) {
    try {
        const url = `${XDEX_API_BASE}/api/xendex/pool/tokens/${token1Address}/${token2Address}?network=${NETWORK}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching pool by token pair:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// VALIDATOR ENDPOINTS
// ============================================

/**
 * Get all validators
 * @returns {Promise<Object>} List of validators
 */
async function getValidators() {
    const cacheKey = 'validators';
    
    // Check cache
    if (cache[cacheKey].data && Date.now() - cache[cacheKey].timestamp < cache[cacheKey].ttl) {
        return cache[cacheKey].data;
    }
    
    try {
        const url = `${XDEX_API_BASE}/api/xendex/validators?network=${NETWORK}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Cache the result
        cache[cacheKey].data = data;
        cache[cacheKey].timestamp = Date.now();
        
        return data;
    } catch (error) {
        console.error('Error fetching validators:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// CHART DATA ENDPOINTS
// ============================================

/**
 * Get chart history data
 * @returns {Promise<Object>} Historical chart data
 */
async function getChartHistory() {
    try {
        const url = `${XDEX_API_BASE}/api/xendex/chart/history?network=${NETWORK}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching chart history:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current chart price
 * @returns {Promise<Object>} Current price chart data
 */
async function getChartPrice() {
    try {
        const url = `${XDEX_API_BASE}/api/xendex/chart/price?network=${NETWORK}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching chart price:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {number} decimals - Number of decimals (default 6)
 * @returns {string} Formatted price
 */
function formatPrice(price, decimals = 6) {
    if (!price || isNaN(price)) return '0.00';
    
    if (price < 0.000001) {
        return price.toExponential(2);
    }
    
    return price.toFixed(decimals);
}

/**
 * Format large numbers (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    if (!num || isNaN(num)) return '0';
    
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    
    return num.toFixed(2);
}

/**
 * Get price change percentage
 * @param {number} currentPrice - Current price
 * @param {number} previousPrice - Previous price
 * @returns {Object} { percentage, isPositive }
 */
function getPriceChange(currentPrice, previousPrice) {
    if (!currentPrice || !previousPrice) return { percentage: 0, isPositive: true };
    
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    return {
        percentage: Math.abs(change).toFixed(2),
        isPositive: change >= 0
    };
}

// ============================================
// DISPLAY FUNCTIONS FOR HOMEPAGE
// ============================================

/**
 * Update token price display on homepage
 * @param {string} tokenAddress - Token mint address
 * @param {string} elementId - DOM element ID to update
 */
async function updateTokenPriceDisplay(tokenAddress, elementId) {
    const priceElement = document.getElementById(elementId);
    if (!priceElement) return;
    
    try {
        priceElement.textContent = 'Loading...';
        
        const data = await getTokenPrice(tokenAddress);
        
        if (data.success && data.price) {
            priceElement.textContent = `$${formatPrice(data.price)}`;
        } else {
            priceElement.textContent = 'N/A';
        }
    } catch (error) {
        console.error('Error updating price display:', error);
        priceElement.textContent = 'Error';
    }
}

/**
 * Update multiple token prices on homepage
 */
async function updateAllTokenPrices() {
    try {
        const data = await getTokenPrices();
        
        if (data.success && data.prices) {
            // Update XNT price
            const xntPrice = document.getElementById('xnt-price');
            if (xntPrice && data.prices[TOKEN_ADDRESSES.XNT]) {
                xntPrice.textContent = `$${formatPrice(data.prices[TOKEN_ADDRESSES.XNT])}`;
            }
            
            // Update 404x1 token price if exists
            const token404x1Price = document.getElementById('404x1-token-price');
            if (token404x1Price && data.prices[TOKEN_ADDRESSES.TOKEN_404x1]) {
                token404x1Price.textContent = `$${formatPrice(data.prices[TOKEN_ADDRESSES.TOKEN_404x1])}`;
            }
        }
    } catch (error) {
        console.error('Error updating all token prices:', error);
    }
}

/**
 * Update pool stats on homepage
 */
async function updatePoolStats() {
    try {
        const data = await getPoolStatus();
        
        if (data.success && data.stats) {
            const totalPools = document.getElementById('total-pools');
            const totalLiquidity = document.getElementById('total-liquidity');
            const totalVolume = document.getElementById('total-volume');
            
            if (totalPools) totalPools.textContent = data.stats.total_pools || '0';
            if (totalLiquidity) totalLiquidity.textContent = `$${formatNumber(data.stats.total_liquidity || 0)}`;
            if (totalVolume) totalVolume.textContent = `$${formatNumber(data.stats.total_volume_24h || 0)}`;
        }
    } catch (error) {
        console.error('Error updating pool stats:', error);
    }
}

/**
 * Auto-refresh prices every 30 seconds
 */
function startPriceAutoRefresh() {
    // Initial load
    updateAllTokenPrices();
    updatePoolStats();
    
    // Refresh every 30 seconds
    setInterval(() => {
        updateAllTokenPrices();
    }, 30000);
    
    // Refresh pool stats every 5 minutes
    setInterval(() => {
        updatePoolStats();
    }, 300000);
}

// ============================================
// EXPORT API
// ============================================

window.XDEX_API = {
    // Token functions
    getTokenPrices,
    getTokenPrice,
    getLPTokenPrice,
    getWalletTokens,
    
    // Pool functions
    getAllPools,
    getPoolStatus,
    getPool,
    getPoolByTokenPair,
    
    // Validator functions
    getValidators,
    
    // Chart functions
    getChartHistory,
    getChartPrice,
    
    // Utility functions
    formatPrice,
    formatNumber,
    getPriceChange,
    
    // Display functions
    updateTokenPriceDisplay,
    updateAllTokenPrices,
    updatePoolStats,
    startPriceAutoRefresh,
    
    // Constants
    TOKEN_ADDRESSES,
    NETWORK
};

// Auto-start price refresh when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPriceAutoRefresh);
} else {
    startPriceAutoRefresh();
}
