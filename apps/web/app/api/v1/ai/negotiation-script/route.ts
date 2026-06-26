import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST { district: string, offeredPrice: number, benchmarkPrice: number }
// Returns { script: string, cachedAt: string }
// Generates Hindi negotiation script via Claude API with caching
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { district, offeredPrice, benchmarkPrice } = body;

    if (!district || !offeredPrice || !benchmarkPrice) {
      return NextResponse.json(
        { error: 'district, offeredPrice, and benchmarkPrice are required' },
        { status: 400 }
      );
    }

    // Round price to nearest ₹2 for cache efficiency
    const priceBucket = Math.round(offeredPrice / 2) * 2;
    const cacheKey = `${district}_${priceBucket}`;

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check cache first
    const { data: cachedData } = await supabase
      .from('ai_cache')
      .select('response, created_at')
      .eq('cache_key', cacheKey)
      .eq('cache_type', 'negotiation_script')
      .gt('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()) // 4 hours
      .single();

    if (cachedData) {
      return NextResponse.json({
        script: (cachedData as any).response,
        cachedAt: (cachedData as any).created_at,
      });
    }

    // Generate new script via Claude API
    const claudeApiKey = process.env.ANTHROPIC_API_KEY;
    if (!claudeApiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a poultry price assistant for farmers in Gorakhpur, UP, India.
Generate a 2-3 sentence negotiation script in Hindi (Devanagari script only) 
that a farmer can say to a trader to negotiate a better price.
Be direct, factual, and friendly. Reference the mandi benchmark price.
Respond with ONLY the Hindi script. No preamble, no explanation.`;

    const userPrompt = `Offered: ₹${offeredPrice}/kg, Mandi Benchmark: ₹${benchmarkPrice}/kg, District: ${district}`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate negotiation script' },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const script = claudeData.content[0].text;

    // Cache the response
    await (supabase.from('ai_cache') as any).insert({
      cache_key: cacheKey,
      cache_type: 'negotiation_script',
      response: script,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      script,
      cachedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Negotiation script API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
