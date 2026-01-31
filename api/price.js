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

        // Ask xDEX: "If I put in 1 XNT, how many 404 tokens do I get out?"
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

        // xDEX returns estimatedOutputAmount already human-readable
        // e.g. 518.88 means 1 XNT buys 518.88 tokens
        let outputAmount = null;
        if (data.estimatedOutputAmount) outputAmount = data.estimatedOutputAmount;
        else if (data.output_amount) outputAmount = data.output_amount;
        else if (data.data && data.data.estimatedOutputAmount) outputAmount = data.data.estimatedOutputAmount;
        else if (data.data && data.data.output_amount) outputAmount = data.data.output_amount;
        else if (data.result) outputAmount = data.result;

        if (outputAmount && parseFloat(outputAmount) > 0) {
            const outputNum = parseFloat(outputAmount);
            // Price per token = 1 XNT / outputNum tokens
            // e.g. 1 / 518.88 = 0.00192727 XNT per token
            const pricePerToken = 1 / outputNum;

            console.log(`outputAmount=${outputNum} | price=${pricePerToken}`);

            res.status(200).json({
                success: true,
                price: pricePerToken,
                outputAmount: outputNum,
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
