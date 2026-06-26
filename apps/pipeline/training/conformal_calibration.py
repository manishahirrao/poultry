"""
PoultryPulse AI — Conformal Calibration  [PRODUCTION FIXED]
File: apps/pipeline/training/conformal_calibration.py
"""

import json
import logging
import numpy as np
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

def calibrate_conformal_intervals(
    y_calib: np.ndarray,
    preds_calib: np.ndarray,
    alpha: float = 0.20
) -> float:
    """
    Calculate the conformal interval bound q_hat.
    alpha=0.20 → 80% confidence interval per PRD §6.1.
    """
    logger.info(f"Calibrating conformal intervals: n={len(y_calib)}, alpha={alpha}")
    n = len(y_calib)
    if n == 0:
        raise ValueError("Calibration set is empty — cannot compute conformal bound.")
    if n < 30:
        logger.warning(f"Calibration set has only {n} samples. Recommend >=30 for reliable coverage.")

    residuals = np.abs(y_calib - preds_calib)
    quantile_val = np.ceil((n + 1) * (1 - alpha)) / n
    quantile_val = min(max(quantile_val, 0.0), 1.0)
    q_hat = float(np.quantile(residuals, quantile_val, method='higher'))
    logger.info(f"Conformal boundary (q_hat): Rs {q_hat:.2f}")
    return q_hat


def apply_conformal_bounds(preds: np.ndarray, q_hat: float):
    """Apply conformal boundary to produce P10 and P90."""
    p10 = np.maximum(preds - q_hat, 0)  # Price cannot be negative
    p90 = preds + q_hat
    return p10, p90


def validate_coverage(
    y_test: np.ndarray,
    p10: np.ndarray,
    p90: np.ndarray,
    target_min: float = 78.0,
    target_max: float = 82.0
) -> dict:
    """
    CRITICAL GATE: Validate that 78–82% of actual values fall within [P10, P90].
    TRD §4.2: Block model promotion if coverage outside this band.
    """
    within = np.sum((y_test >= p10) & (y_test <= p90))
    coverage = float(within / len(y_test) * 100)
    passed = target_min <= coverage <= target_max

    result = {
        'coverage_pct': round(coverage, 2),
        'within_interval': int(within),
        'total_samples': len(y_test),
        'target_band': f"{target_min}-{target_max}%",
        'gate_passed': passed,
    }

    if passed:
        logger.info(f"✅ Coverage gate passed: {coverage:.2f}% in [{target_min}, {target_max}]%")
    else:
        logger.error(
            f"❌ Coverage gate FAILED: {coverage:.2f}% outside [{target_min}, {target_max}]%. "
            "Block model promotion. Recalibrate alpha or expand calibration set."
        )
    return result


def save_calibration_artifact(
    q_hat: float,
    coverage_result: dict,
    model_type: str,
    district: str,
    output_dir: str
) -> str:
    """Save q_hat and coverage report to JSON for use at inference time."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    artifact = {
        'q_hat': q_hat,
        'alpha': 0.20,
        'model_type': model_type,
        'district': district,
        'coverage_validation': coverage_result,
        'calibrated_at': datetime.utcnow().isoformat(),
    }
    fn = output_path / f"conformal_{model_type}_{district}.json"
    with open(fn, 'w') as f:
        json.dump(artifact, f, indent=2)

    logger.info(f"Conformal artifact saved: {fn}")
    return str(fn)
