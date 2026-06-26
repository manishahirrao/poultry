import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET ?mandi=gorakhpur&days=30
// Returns Array<{ date: string, spread: number }>
// Fetches 30-day spread history for middleman price checks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mandi = searchParams.get('mandi') || 'gorakhpur';
    const days = parseInt(searchParams.get('days') || '30');

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // For MVP, we'll generate mock spread history data
    // In production, this would fetch from a middleman_price_logs table
    // where users submit their middleman price checks over time
    
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Generate mock spread data with some realistic variation
    // In production: fetch from middleman_price_logs table
    // SELECT date, (middleman_price - mandi_benchmark) as spread
    // FROM middleman_price_logs
    // WHERE mandi = $1 AND date >= $2
    // ORDER BY date ASC
    
    const mockData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic spread values between ₹2 and ₹12
      // with some random variation
      const baseSpread = 5 + Math.random() * 4;
      const spread = Math.round(baseSpread * 10) / 10;
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        spread,
      });
    }

    // In production, replace with actual database query:
    // const { data, error } = await supabase
    //   .from('middleman_price_logs')
    //   .select('date, spread')
    //   .eq('mandi', mandi.toLowerCase())
    //   .gte('date', startDate.toISOString().split('T')[0])
    //   .order('date', { ascending: true });

    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Spread history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
