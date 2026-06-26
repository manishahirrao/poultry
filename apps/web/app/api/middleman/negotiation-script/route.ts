import { NextRequest, NextResponse } from 'next/server';

interface NegotiationScriptRequest {
  mandiP50: number;
  middlemanPrice: number;
  spread: number;
  spreadPct: number;
  verdict: 'fair' | 'caution' | 'exploit';
}

export async function POST(request: NextRequest) {
  try {
    const body: NegotiationScriptRequest = await request.json();
    const { mandiP50, middlemanPrice, spread, spreadPct, verdict } = body;

    // Validate input
    if (!mandiP50 || !middlemanPrice || spread === undefined || !verdict) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is available
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      // Fallback: return a template-based script if API key is not configured
      const fallbackScript = generateFallbackScript(mandiP50, middlemanPrice, spread, spreadPct, verdict);
      return NextResponse.json({ script: fallbackScript });
    }

    // Call Anthropic API to generate Hindi negotiation script
    const systemPrompt = "You are a poultry farmer negotiation coach. Generate a short, natural Hindi script (4-6 sentences) that a farmer can use to negotiate a better price from their middleman. Use market data provided. Be conversational, not aggressive. Sound like a real farmer talking.";

    const userMessage = `Mandi benchmark price: ₹${mandiP50}/kg
Middleman offered price: ₹${middlemanPrice}/kg
Spread: ₹${spread}/kg (${spreadPct}%)
Verdict: ${verdict}

Generate a Hindi negotiation script for this situation.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'false',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, response.statusText);
      // Fallback to template-based script on API error
      const fallbackScript = generateFallbackScript(mandiP50, middlemanPrice, spread, spreadPct, verdict);
      return NextResponse.json({ script: fallbackScript });
    }

    const data = await response.json();
    const script = data.content[0]?.text || generateFallbackScript(mandiP50, middlemanPrice, spread, spreadPct, verdict);

    return NextResponse.json({ script });

  } catch (error) {
    console.error('Negotiation script API error:', error);
    return NextResponse.json(
      { error: 'Could not generate script, try again' },
      { status: 500 }
    );
  }
}

// Fallback script generator when API is unavailable
function generateFallbackScript(
  mandiP50: number,
  middlemanPrice: number,
  spread: number,
  spreadPct: number,
  verdict: 'fair' | 'caution' | 'exploit'
): string {
  const scripts: Record<string, string> = {
    fair: `भाई साहब, आज मंडी में भाव ₹${mandiP50}/kg चल रहा है। आप मुझे ₹${middlemanPrice}/kg दे रहे हैं, जो ठीक है। लेकिन अगर थोड़ा और बढ़ा सकें तो बेहतर रहेगा। मेरे पास अच्छी क्वालिटी का मुर्गा है, इसलिए थोड़ा और देखिए।`,
    caution: `भाई साहब, आज मंडी में भाव ₹${mandiP50}/kg है और आप ₹${middlemanPrice}/kg दे रहे हैं। स्प्रेड ₹${spread}/kg (${spreadPct}%) हो गया है। मार्केट में और भी खरीदार हैं, इसलिए थोड़ा सोचिए। हम लंबे समय से काम कर रहे हैं, इसलिए बेहतर भाव दीजिए।`,
    exploit: `भाई साहब, यह तो बहुत ज्यादा हो गया। मंडी में ₹${mandiP50}/kg है और आप ₹${middlemanPrice}/kg दे रहे हैं। स्प्रेड ₹${spread}/kg (${spreadPct}%) है जो बहुत ज्यादा है। मैं दूसरे खरीदार से भी बात करूंगा। अगर भाव सही नहीं करेंगे तो मैं बाकी जगह भी देखूंगा।`
  };

  return scripts[verdict] || scripts.fair;
}
