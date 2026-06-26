"""
PoultryPulse AI — Sell Signal Computation
File: apps/api/inference/sell_signal.py
Version: v1.0 | May 2026
Design Reference: PRD v3.0 §4.1 (Rajesh persona — sell signal is the core value)
"""

from typing import Dict, Any
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger()

# Sell signal types
SELL_SIGNALS = ['SELL_NOW', 'HOLD', 'SELL_SOON']


def compute_sell_signal(prediction: Dict[str, Any], batch: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute sell signal recommendation based on prediction and batch data.
    
    Args:
        prediction: PredictionResult dict with p10, p50, p90, confidence, etc.
        batch: BatchRecord dict with batch_id, bird_count, grow_start, 
               expected_harvest_range, feed_cost_total
    
    Returns:
        Dict with signal, signal_strength, optimal_window_start, optimal_window_end, profit_estimate
    """
    p50 = prediction.get('p50', 0)
    p10 = prediction.get('p10', 0)
    p90 = prediction.get('p90', 0)
    confidence = prediction.get('confidence', 0)
    
    # Extract batch information
    grow_start = batch.get('grow_start')
    expected_harvest_range = batch.get('expected_harvest_range', [])
    bird_count = batch.get('bird_count', 0)
    feed_cost_total = batch.get('feed_cost_total', 0)
    
    # Parse dates
    try:
        grow_start_date = datetime.fromisoformat(grow_start)
        harvest_start = datetime.fromisoformat(expected_harvest_range[0]) if expected_harvest_range else None
        harvest_end = datetime.fromisoformat(expected_harvest_range[1]) if expected_harvest_range else None
    except (ValueError, TypeError, IndexError):
        logger.warning("invalid_batch_dates", batch=batch)
        # Default to 42-day grow-out if dates invalid
        grow_start_date = datetime.now() - timedelta(days=35)
        harvest_start = datetime.now() + timedelta(days=7)
        harvest_end = datetime.now() + timedelta(days=14)
    
    # Calculate days to harvest
    today = datetime.now()
    days_to_harvest = (harvest_start - today).days if harvest_start else 7
    
    # Calculate price trend (using confidence interval tightness)
    price_spread = p90 - p10
    price_trend_strength = 1.0 - (price_spread / p50) if p50 > 0 else 0
    
    # Determine signal based on PRD §4.1 specifications
    signal = "HOLD"
    signal_strength = 0.0
    
    # SELL_NOW: P50 within 3 days of peak, directional confidence >90%
    if confidence > 0.90 and days_to_harvest <= 3:
        signal = "SELL_NOW"
        signal_strength = confidence * price_trend_strength
        logger.info(
            "sell_now_signal",
            confidence=confidence,
            days_to_harvest=days_to_harvest,
            p50=p50
        )
    
    # SELL_SOON: upward trend forecast, harvest window ≤7 days out
    elif p50 > (p10 + p90) / 2 and days_to_harvest <= 7:
        signal = "SELL_SOON"
        # Signal strength based on how close to optimal window
        signal_strength = 0.7 + (0.3 * (1 - days_to_harvest / 7))
        logger.info(
            "sell_soon_signal",
            p50=p50,
            days_to_harvest=days_to_harvest,
            signal_strength=signal_strength
        )
    
    # HOLD: P50 trending up, harvest window >7 days, confidence >80%
    elif confidence > 0.80 and days_to_harvest > 7:
        signal = "HOLD"
        signal_strength = confidence * 0.8
        logger.info(
            "hold_signal",
            confidence=confidence,
            days_to_harvest=days_to_harvest,
            p50=p50
        )
    
    # Fallback: if confidence is low, recommend caution
    elif confidence < 0.80:
        signal = "HOLD"
        signal_strength = 0.5
        logger.warning(
            "low_confidence_hold",
            confidence=confidence,
            p50=p50
        )
    
    # Calculate optimal window
    if signal == "SELL_NOW":
        optimal_window_start = today.isoformat()
        optimal_window_end = (today + timedelta(days=2)).isoformat()
    elif signal == "SELL_SOON":
        optimal_window_start = (today + timedelta(days=2)).isoformat()
        optimal_window_end = (today + timedelta(days=5)).isoformat()
    else:  # HOLD
        optimal_window_start = harvest_start.isoformat() if harvest_start else (today + timedelta(days=7)).isoformat()
        optimal_window_end = harvest_end.isoformat() if harvest_end else (today + timedelta(days=14)).isoformat()
    
    # Calculate profit estimate
    # Assuming avg weight 2kg per bird at harvest
    avg_weight_kg = 2.0
    gross_revenue = bird_count * avg_weight_kg * p50
    net_profit = gross_revenue - feed_cost_total
    
    profit_estimate = max(0, net_profit)  # Don't show negative profit
    
    logger.info(
        "sell_signal_computed",
        signal=signal,
        signal_strength=signal_strength,
        profit_estimate=profit_estimate,
        p50=p50
    )
    
    return {
        "signal": signal,
        "signal_strength": round(signal_strength, 3),
        "optimal_window_start": optimal_window_start,
        "optimal_window_end": optimal_window_end,
        "profit_estimate": round(profit_estimate, 2),
        "p50_reference": round(p50, 2),
        "confidence": round(confidence, 3)
    }


def validate_signal_invariant(signal_result: Dict[str, Any]) -> bool:
    """
    Validate that signal strength is within valid range [0.0, 1.0].
    
    Args:
        signal_result: Dict returned by compute_sell_signal
    
    Returns:
        True if invariant holds, False otherwise
    """
    signal_strength = signal_result.get('signal_strength', 0)
    signal = signal_result.get('signal', '')
    
    # Signal strength must be between 0 and 1
    if not (0.0 <= signal_strength <= 1.0):
        logger.error(
            "signal_strength_invariant_violation",
            signal=signal,
            signal_strength=signal_strength
        )
        return False
    
    # Signal must be valid
    if signal not in SELL_SIGNALS:
        logger.error(
            "invalid_signal_type",
            signal=signal
        )
        return False
    
    return True
