// Vercel Serverless Function - Proxy for xDEX API
// This bypasses CORS by making the request server-side

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        const TOKEN_CA = '4o4UheANLdqF4gSV4zWTbCTCercQNSaTm6nVcDetzPb2';
        const WXNT_ADDRESS = '111111111111111111111111111111111111111111';
        
        // Make request to xDEX API
        const response = await fetch('https://api.xdex.xyz/api/xendex/swap/prepare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                network: 'X1 Mainnet',
                wallet: '11111111111111111111111111111111',
                token_in: WXNT_ADDRESS,
                token_out: TOKEN_CA,
                token_in_amount: 1,
                is_exact_amount_in: true
            })
        });
        
        const data = await response.json();
        
        // Extract price from various possible response formats
        let price = null;
        if (data.estimatedOutputAmount) {
            price = parseFloat(data.estimatedOutputAmount);
        } else if (data.output_amount) {
            price = parseFloat(data.output_amount);
        } else if (data.data && data.data.estimatedOutputAmount) {
            price = parseFloat(data.data.estimatedOutputAmount);
        } else if (data.result) {
            price = parseFloat(data.result);
        }
        
        if (price && price > 0) {
            res.status(200).json({ success: true, price, raw: data });
        } else {
            res.status(200).json({ success: false, error: 'Invalid price data', raw: data });
        }
    } catch (error) {
        console.error('xDEX API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
