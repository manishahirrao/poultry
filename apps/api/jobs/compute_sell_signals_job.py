"""
ComputeSellSignalsJob - Daily cron job that pre-computes sell signals for all mandis at 6:15 AM IST
(after price forecast data is refreshed at 6:00 AM). Avoids on-demand computation latency.

Run daily at 6:15 AM IST (12:45 AM UTC)
"""

import asyncio
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from supabase import create_client, Client
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')


def create_supabase_client() -> Client:
    """Create Supabase client with service role key"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def compute_signal_from_forecast(
    forecast: List[Dict[str, Any]],
    avg30_price: float
) -> Dict[str, Any]:
    """
    Compute sell signal from forecast data.
    Same logic as in API route (FSC-API-002).
    
    Returns signal dict with:
    - signal: 'SELL_NOW' | 'HOLD' | 'CAUTION'
    - optimalWindowStart: ISO date or null
    - optimalWindowEnd: ISO date or null
    - expectedP50Low: number or null
    - expectedP50High: number or null
    - confidence: 1-5
    - reasons: list of strings
    """
    if not forecast or len(forecast) == 0:
        return {
            'signal': 'HOLD',
            'optimalWindowStart': None,
            'optimalWindowEnd': None,
            'expectedP50Low': None,
            'expectedP50High': None,
            'confidence': 3,
            'reasons': ['No forecast data available'],
        }
    
    # Get today's P50
    today_p50 = forecast[0].get('p50') if forecast else avg30_price
    
    # Find optimal window (highest P50 in next 14 days)
    optimal_idx = 0
    max_p50 = today_p50
    
    for i, f in enumerate(forecast[:14]):  # Look at next 14 days
        p50 = f.get('p50')
        if p50 and p50 > max_p50:
            max_p50 = p50
            optimal_idx = i
    
    # Determine signal based on price difference from 30-day average
    price_diff = max_p50 - avg30_price
    
    if price_diff >= 5:
        signal = 'SELL_NOW'
        confidence = 5
        reasons = ['Price significantly above 30-day average']
    elif price_diff >= 2:
        signal = 'SELL_NOW'
        confidence = 4
        reasons = ['Price above 30-day average']
    elif price_diff >= -2:
        signal = 'HOLD'
        confidence = 3
        reasons = ['Price near 30-day average']
    elif price_diff >= -5:
        signal = 'CAUTION'
        confidence = 2
        reasons = ['Price below 30-day average']
    else:
        signal = 'CAUTION'
        confidence = 1
        reasons = ['Price significantly below 30-day average']
    
    # Calculate optimal window
    optimal_window_start = None
    optimal_window_end = None
    expected_p50_low = None
    expected_p50_high = None
    
    if optimal_idx > 0:
        optimal_window_start = forecast[optimal_idx].get('forecast_date')
        # End window 2 days after optimal
        if optimal_idx + 2 < len(forecast):
            optimal_window_end = forecast[optimal_idx + 2].get('forecast_date')
        
        expected_p50_high = max_p50
        # P10 as lower bound (estimate as 95% of P50)
        expected_p50_low = max_p50 * 0.95
    
    return {
        'signal': signal,
        'optimalWindowStart': optimal_window_start,
        'optimalWindowEnd': optimal_window_end,
        'expectedP50Low': expected_p50_low,
        'expectedP50High': expected_p50_high,
        'confidence': confidence,
        'reasons': reasons,
    }


async def send_slack_alert(message: str):
    """Send alert to Slack webhook"""
    if not SLACK_WEBHOOK_URL:
        print(f"[Slack] Webhook URL not set, skipping alert: {message}")
        return
    
    import aiohttp
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                SLACK_WEBHOOK_URL,
                json={'text': message}
            ) as response:
                if response.status == 200:
                    print(f"[Slack] Alert sent successfully")
                else:
                    print(f"[Slack] Failed to send alert: {response.status}")
    except Exception as e:
        print(f"[Slack] Error sending alert: {e}")


async def compute_sell_signals():
    """Main function to compute sell signals for all active mandis"""
    print('[SignalJob] Starting sell signal pre-computation...')
    
    try:
        supabase = create_supabase_client()
    except Exception as e:
        print(f'[SignalJob] Failed to create Supabase client: {e}')
        return
    
    today = datetime.utcnow().date().isoformat()
    
    # Get all covered mandis
    try:
        mandis_response = supabase.table('mandis').select('id, name').eq('is_active', True).execute()
        mandis = mandis_response.data
    except Exception as e:
        print(f'[SignalJob] Failed to fetch mandis: {e}')
        return
    
    if not mandis or len(mandis) == 0:
        print('[SignalJob] No active mandis found')
        return
    
    computed = 0
    errors = 0
    
    for mandi in mandis:
        try:
            mandi_id = mandi['id']
            mandi_name = mandi['name']
            
            # Fetch 14-day forecast for this mandi
            end_date = (datetime.utcnow() + timedelta(days=14)).date().isoformat()
            
            forecast_response = supabase.table('price_forecasts') \
                .select('forecast_date, p50') \
                .eq('mandi_id', mandi_id) \
                .gte('forecast_date', today) \
                .lte('forecast_date', end_date) \
                .order('forecast_date', asc=True) \
                .execute()
            
            forecast = forecast_response.data
            
            # Fetch 30-day average for baseline
            try:
                avg_response = supabase.rpc('get_30day_avg_price', {'p_mandi_id': mandi_id}).execute()
                avg30_price = avg_response.data[0].get('avg_price') if avg_response.data else 160
            except Exception as e:
                print(f'[SignalJob] Failed to fetch 30-day avg for {mandi_id}: {e}')
                avg30_price = 160  # Fallback
            
            # Compute signal
            signal = compute_signal_from_forecast(forecast, avg30_price)
            
            # Upsert into sell_signals table
            supabase.table('sell_signals').upsert({
                'mandi_id': mandi_id,
                'signal_date': today,
                'signal': signal['signal'],
                'optimal_win_start': signal['optimalWindowStart'],
                'optimal_win_end': signal['optimalWindowEnd'],
                'expected_p50_low': signal['expectedP50Low'],
                'expected_p50_high': signal['expectedP50High'],
                'confidence': signal['confidence'],
                'reasons': signal['reasons'],
                'computed_at': datetime.utcnow().isoformat(),
            }, on_conflict='mandi_id,signal_date').execute()
            
            computed += 1
            print(f'[SignalJob] Computed signal for {mandi_name} ({mandi_id}): {signal["signal"]}')
            
        except Exception as err:
            print(f'[SignalJob] Error for mandi {mandi_id}: {err}')
            errors += 1
            # Continue to next mandi — don't fail the whole job
    
    print(f'[SignalJob] Done: {computed} computed, {errors} errors')
    
    # Alert admin if more than 20% errors
    if errors > len(mandis) * 0.2:
        await send_slack_alert(f'[SignalJob] HIGH ERROR RATE: {errors}/{len(mandis)} mandis failed')


if __name__ == '__main__':
    asyncio.run(compute_sell_signals())
