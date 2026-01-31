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
        // Correct wrapped XNT address on X1 (same format as wrapped SOL on Solana)
        const WXNT_ADDRESS = 'So11111111111111111111111111111111111111112';

        // Ask xDEX: "If I put in 1 XNT, how many 404 tokens do I get out?"
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
        console.log('xDEX raw response:', JSON.stringify(data));

        // Extract how many 404 tokens come out for 1 XNT input
        let outputAmount = null;
        if (data.estimatedOutputAmount) {
            outputAmount = parseFloat(data.estimatedOutputAmount);
        } else if (data.output_amount) {
            outputAmount = parseFloat(data.output_amount);
        } else if (data.data && data.data.estimatedOutputAmount) {
            outputAmount = parseFloat(data.data.estimatedOutputAmount);
        } else if (data.data && data.data.output_amount) {
            outputAmount = parseFloat(data.data.output_amount);
        } else if (data.result) {
            outputAmount = parseFloat(data.result);
        }

        if (outputAmount && outputAmount > 0) {
            // Price per 404 token in XNT = 1 XNT / outputAmount tokens
            // e.g. 1 XNT buys 4000 tokens → each token = 0.00025 XNT
            const pricePerToken = 1 / outputAmount;
            res.status(200).json({
                success: true,
                price: pricePerToken,
                outputAmount: outputAmount,
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
