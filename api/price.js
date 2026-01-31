// Vercel Serverless Function - Proxy for xDEX API
// Bypasses CORS by making the request server-side

// Deep-scan an object for the first numeric value in a plausible token-output range
// xDEX has changed field names before — this finds it regardless of nesting/naming
function findOutputAmount(obj, depth = 0) {
    if (depth > 4) return null; // don't recurse too deep
    if (obj == null) return null;

    // If it's a number directly in plausible range (10–999999 tokens output for 1 XNT)
    if (typeof obj === 'number' && obj >= 10 && obj <= 999999) return obj;
    // String that parses to a number in range
    if (typeof obj === 'string') {
        const n = parseFloat(obj);
        if (!isNaN(n) && n >= 10 && n <= 999999) return n;
    }

    if (typeof obj !== 'object') return null;

    // Priority field names to check first
    const priorityKeys = ['estimatedOutputAmount', 'output_amount', 'outputAmount', 'estimated_output_amount', 'result', 'amount', 'out'];
    for (const key of priorityKeys) {
        if (obj[key] != null) {
            const val = typeof obj[key] === 'object' ? findOutputAmount(obj[key], depth + 1) : findOutputAmount(obj[key], depth);
            if (val != null) return val;
        }
    }

    // Then scan all other keys
    for (const key of Object.keys(obj)) {
        if (priorityKeys.includes(key)) continue;
        const val = findOutputAmount(obj[key], depth + 1);
        if (val != null) return val;
    }

    return null;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const TOKEN_CA = '4o4UheANLdqF4gSV4zWTbCTCercQNSaTm6nVcDetzPb2';
        const WXNT_ADDRESS = 'So11111111111111111111111111111111111111112';

        const response = await fetch('https://api.xdex.xyz/api/xendex/swap/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
        console.log('xDEX raw:', JSON.stringify(data));

        // Deep-scan the response for the output amount — works regardless of field names
        const outputNum = findOutputAmount(data);

        if (outputNum && outputNum > 0) {
            const pricePerToken = 1 / outputNum;
            console.log(`Found outputAmount=${outputNum} | price=${pricePerToken}`);
            res.status(200).json({
                success: true,
                price: pricePerToken,
                outputAmount: outputNum,
                raw: data
            });
        } else {
            // Return raw so frontend can log and debug
            res.status(200).json({ success: false, error: 'Could not find output amount', raw: data });
        }
    } catch (error) {
        console.error('xDEX API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
