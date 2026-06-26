"""
PoultryPulse AI — Numeric Watermarking
File: apps/api/watermark/numeric_perturbation.py
Reference: TRD v1.0 §6.1
Micro-perturbation of forecast prices (±0.5%) unique per customer.
"""

import hashlib
from typing import Dict, Any

def get_perturbation_factor(customer_id: str, date_str: str) -> float:
    """
    Generate a deterministic perturbation factor between -0.005 and +0.005
    based on the customer_id and the date.
    This guarantees the same customer gets the same perturbed value on the same day.
    """
    seed = f"{customer_id}_{date_str}".encode('utf-8')
    h = hashlib.sha256(seed).hexdigest()
    
    # Convert first 8 hex characters to an integer (0 to 4294967295)
    val = int(h[:8], 16)
    
    # Map to [-0.5%, +0.5%]
    max_val = 4294967295
    normalized = (val / max_val) * 0.01 - 0.005
    
    return normalized

def apply_numeric_watermark(price: float, customer_id: str, date_str: str) -> float:
    """
    Apply micro-perturbation to a price.
    """
    factor = get_perturbation_factor(customer_id, date_str)
    perturbed_price = price * (1 + factor)
    
    # Round to 1 decimal place to mimic normal pricing, but keep the unique signature
    return round(perturbed_price, 1)

def apply_numeric_watermark_to_prediction(prediction: Dict[str, Any], customer_id: str, date_str: str) -> Dict[str, Any]:
    """
    Apply numeric watermarking to all price points in a prediction dictionary.
    """
    watermarked = prediction.copy()
    
    for key in ['p10', 'p50', 'p90']:
        if key in watermarked and isinstance(watermarked[key], (int, float)):
            watermarked[key] = apply_numeric_watermark(watermarked[key], customer_id, date_str)
            
    return watermarked

if __name__ == "__main__":
    # Test
    price = 162.5
    cid_A = "CUST-A"
    cid_B = "CUST-B"
    date = "2026-05-16"
    
    print(f"Original: {price}")
    print(f"Customer A: {apply_numeric_watermark(price, cid_A, date)}")
    print(f"Customer B: {apply_numeric_watermark(price, cid_B, date)}")
