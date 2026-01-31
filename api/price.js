// Vercel Serverless Function - Proxy for xDEX API
// Bypasses CORS by making the request server-side

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
        const X1_RPC = 'https://rpc.mainnet.x1.xyz/';

        // Step 1: Get token decimals from chain
        let decimals = 9; // default fallback
        try {
            const supplyRes = await fetch(X1_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenSupply', params: [TOKEN_CA] })
            });
            const supplyData = await supplyRes.json();
            if (supplyData.result && supplyData.result.value) {
                decimals = supplyData.result.value.decimals;
            }
        } catch (e) {
            console.log('Could not fetch decimals, using default 9');
        }

        // Step 2: Ask xDEX: "If I put in 1 XNT, how many 404 tokens do I get out?"
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
        console.log('xDEX raw response:', JSON.stringify(data));

        // Extract the raw output amount (this is in SMALLEST UNITS, not human-readable)
        let rawOutput = null;
        if (data.estimatedOutputAmount) rawOutput = data.estimatedOutputAmount;
        else if (data.output_amount) rawOutput = data.output_amount;
        else if (data.data && data.data.estimatedOutputAmount) rawOutput = data.data.estimatedOutputAmount;
        else if (data.data && data.data.output_amount) rawOutput = data.data.output_amount;
        else if (data.result) rawOutput = data.result;

        if (rawOutput && parseFloat(rawOutput) > 0) {
            const rawOutputNum = parseFloat(rawOutput);
            // Convert from smallest units to human-readable token amount
            const humanOutput = rawOutputNum / Math.pow(10, decimals);
            // Price per token = 1 XNT / humanOutput tokens
            const pricePerToken = 1 / humanOutput;

            console.log(`decimals=${decimals} | rawOutput=${rawOutputNum} | humanOutput=${humanOutput} | price=${pricePerToken}`);

            res.status(200).json({
                success: true,
                price: pricePerToken,
                humanOutput: humanOutput,
                rawOutput: rawOutputNum,
                decimals: decimals,
                raw: data
            });
        } else {
            res.status(200).json({ success: false, error: 'No output amount in response', raw: data });
        }
    } catch (error) {
        console.error('xDEX API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
