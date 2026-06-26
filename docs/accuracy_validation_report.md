# PoultryPulse AI — Accuracy Validation Report
## 95%+ Pre-Launch Accuracy Gate Certification

**Report Date:** [To be filled on completion]
**Validation Period:** 6-month out-of-sample holdout (Gorakhpur district)
**Model Version:** [To be filled]
**Status:** 🟡 IN PROGRESS — All three gates must pass before launch

---

## Executive Summary

This report documents the accuracy validation process for the PoultryPulse AI price prediction model. Per PRD §6 and TRD §4, the model must achieve **ALL THREE** accuracy gates simultaneously before any commercial launch:

1. **Directional Accuracy >95%** — Correct prediction of price rise/fall direction
2. **MAPE <6%** — Mean Absolute Percentage Error of point forecasts
3. **Conformal Coverage 78–82%** — 80% confidence intervals contain actual price 78–82% of the time

**NON-NEGOTIABLE BLOCKER:** No customer onboarding, no subscription activation, no press/investor communication until all three gates are cleared and manual validation is complete.

---

## 1. Automated Backtesting Results

### 1.1 Holdout Dataset Specification

| Parameter | Value |
|-----------|-------|
| **Holdout Period** | 6 months (most recent 6 months of data) |
| **District** | Gorakhpur (primary) + Deoria, Kushinagar, Basti, Maharajganj |
| **Commodity** | Broiler live weight (per kg) |
| **Data Points** | ~180 daily predictions (30 days × 6 months) |
| **Training Cutoff** | [Date] |
| **Test Period** | [Start Date] to [End Date] |
| **Data Sources** | AGMARKNET, NECC, IMD, NCDEX, MCX, DAHDF |

### 1.2 Accuracy Gate Metrics

#### Gate 1: Directional Accuracy

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Directional Accuracy** | >95% | [To be calculated] | 🟡 PENDING |
| **Total Predictions** | 180 | [To be filled] | — |
| **Correct Direction** | ≥171 | [To be filled] | — |
| **Incorrect Direction** | ≤9 | [To be filled] | — |

**Calculation Formula:**
```
directional_accuracy = (count(sign(forecast_t - forecast_{t-1}) == sign(actual_t - actual_{t-1})) / total_predictions) × 100
```

**Pass Criteria:** `directional_accuracy >= 95.0%`

---

#### Gate 2: Mean Absolute Percentage Error (MAPE)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **MAPE (30-day rolling)** | <6% | [To be calculated] | 🟡 PENDING |
| **MAPE (90-day rolling)** | <6% | [To be calculated] | 🟡 PENDING |
| **MAPE (full holdout)** | <6% | [To be calculated] | 🟡 PENDING |
| **Worst Daily MAPE** | <15% | [To be filled] | — |
| **Best Daily MAPE** | <1% | [To be filled] | — |

**Calculation Formula:**
```
MAPE = mean(|actual_t - forecast_t| / actual_t) × 100
```

**Pass Criteria:** `MAPE_30day < 6.0%` AND `MAPE_90day < 6.0%`

---

#### Gate 3: Conformal Interval Coverage

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **P10-P90 Coverage** | 78–82% | [To be calculated] | 🟡 PENDING |
| **Total Predictions with Intervals** | 180 | [To be filled] | — |
| **Actuals Within Interval** | 140–148 | [To be filled] | — |
| **Actuals Below P10** | ≤20 | [To be filled] | — |
| **Actuals Above P90** | ≤20 | [To be filled] | — |

**Calculation Formula:**
```
coverage = count(actual_t >= p10_t AND actual_t <= p90_t) / total_predictions × 100
```

**Pass Criteria:** `78.0% <= coverage <= 82.0%`

---

### 1.3 Stress Test Results

Per PRD §6.2, the model must be stress-tested on three historical shock events:

#### Stress Test 1: Nov–Mar 2024 UP Price Crash

| Metric | Result | Status |
|--------|--------|--------|
| **Event Period** | Nov 2024 – Mar 2025 | — |
| **Directional Accuracy** | [To be calculated] | 🟡 PENDING |
| **MAPE During Crash** | [To be calculated] | 🟡 PENDING |
| **Pass Criteria** | Directional >90% | — |

**Description:** Simulate the severe price crash of Nov–Mar 2024 when oversupply from AP/Telangana caused UP prices to drop ₹15–20/kg. The model must correctly predict the downward direction.

---

#### Stress Test 2: HPAI District Alert

| Metric | Result | Status |
|--------|--------|--------|
| **Event Date** | [Date of most recent HPAI alert] | — |
| **District** | Gorakhpur / Adjacent | — |
| **Price Impact Prediction** | [To be calculated] | 🟡 PENDING |
| **Supply Shock Feature Fired** | [Yes/No] | 🟡 PENDING |
| **Pass Criteria** | Supply shock feature activates within 24h of alert | — |

**Description:** Verify that the `hpai_district_flag` feature correctly activates when DAHDF reports HPAI within 200km of Gorakhpur, and the model adjusts price forecasts downward appropriately.

---

#### Stress Test 3: Diwali 2023 Demand Spike

| Metric | Result | Status |
|--------|--------|--------|
| **Event Period** | Diwali 2023 week | — |
| **Festival Feature Fired** | [Yes/No] | 🟡 PENDING |
| **Directional Accuracy** | [To be calculated] | 🟡 PENDING |
| **Pass Criteria** | Festival feature activates 7 days before Diwali | — |

**Description:** Verify that the `festival_7d_flag` feature correctly identifies Diwali and the model predicts the demand-driven price increase.

---

## 2. Manual Ground-Truth Validation

### 2.1 Validation Protocol

Per PRD §6.2 and Architecture §8 (Week 16), the founding team must manually validate **30+ consecutive daily predictions** by physically visiting Gorakhpur mandis and comparing model forecasts to actual mandi prices.

**Validation Team:**
- **CTO / Data Head:** [Name]
- **Validation Period:** [Start Date] to [End Date] (30+ consecutive days)
- **Mandi Locations:** Gorakhpur APMC, Deoria Mandi, Kushinagar Mandi
- **Validation Method:** Physical mandi visits + phone calls to 3 traders per mandi

### 2.2 Daily Validation Log

| Date | Mandi | Model Forecast (P50) | Actual Mandi Price | Directional Match | MAPE | Notes |
|------|-------|---------------------|-------------------|------------------|------|-------|
| [Date 1] | Gorakhpur | ₹[value] | ₹[value] | [✓/✗] | [%] | [Notes] |
| [Date 2] | Gorakhpur | ₹[value] | ₹[value] | [✓/✗] | [%] | [Notes] |
| [Date 3] | Deoria | ₹[value] | ₹[value] | [✓/✗] | [%] | [Notes] |
| ... | ... | ... | ... | ... | ... | ... |
| [Date 30+] | [Mandi] | ₹[value] | ₹[value] | [✓/✗] | [%] | [Notes] |

**Summary Statistics:**
- **Total Days Validated:** [To be filled]
- **Directional Accuracy (Manual):** [To be calculated]%
- **MAPE (Manual):** [To be calculated]%
- **Pass Criteria:** Directional >90% on manual validation

### 2.3 Validation Sign-Off

**I certify that the above manual validation was conducted by physical mandi visits over 30+ consecutive days. The results accurately reflect actual market conditions.**

- **Signature:** _______________________
- **Name:** [CTO / Data Head Name]
- **Title:** [Title]
- **Date:** [Date]

---

## 3. Feature Importance Analysis

### 3.1 Top 10 Features by SHAP Value

| Rank | Feature Name | SHAP Importance | Causal Reason |
|------|--------------|-----------------|---------------|
| 1 | feed_cost_ratio_lag42 | [To be calculated] | Feed cost 42 days ago determines today's supply-side cost pressure |
| 2 | price_lag_7d | [To be calculated] | Last week's price is strongest near-term predictor |
| 3 | price_ma_7d | [To be calculated] | Smoothed trend removes daily noise |
| 4 | festival_7d_flag | [To be calculated] | Demand spikes around festivals in UP |
| 5 | heat_stress_7d | [To be calculated] | Heat stress reduces feed conversion ratio, increases mortality |
| 6 | hpai_district_flag | [To be calculated] | Disease supply shock |
| 7 | price_lag_1d | [To be calculated] | Day-before price autocorrelation |
| 8 | month_sin / month_cos | [To be calculated] | Circular encoding of seasonal patterns |
| 9 | necc_zone_price_delta | [To be calculated] | Regional arbitrage signal |
| 10 | rainfall_7d_mm | [To be calculated] | Heavy rain disrupts transport |

**Validation:** Per PRD §6.3, `feed_cost_ratio_lag42` must be in top 3 features. If not, data alignment issue exists.

---

## 4. Model Registry Information

| Parameter | Value |
|-----------|-------|
| **Champion Model Version** | [To be filled] |
| **Champion MAPE (30-day)** | [To be filled]% |
| **Champion Directional Accuracy** | [To be filled]% |
| **Champion Conformal Coverage** | [To be filled]% |
| **Promotion Date** | [To be filled] |
| **S3 Artifact Path** | `models/champion/latest.onnx` |
| **Quantised** | Yes (INT8 dynamic quantisation) |
| **Inference Latency (P95)** | [To be filled]ms (target: <200ms) |

---

## 5. Final Accuracy Gate Decision

### 5.1 Gate Status Summary

| Gate | Target | Actual | Status |
|------|--------|--------|--------|
| **Gate 1: Directional Accuracy** | >95% | [To be filled]% | 🟡 PENDING |
| **Gate 2: MAPE** | <6% | [To be filled]% | 🟡 PENDING |
| **Gate 3: Conformal Coverage** | 78–82% | [To be filled]% | 🟡 PENDING |
| **Manual Validation** | >90% directional | [To be filled]% | 🟡 PENDING |
| **Stress Tests** | All 3 pass | [To be filled] | 🟡 PENDING |

### 5.2 Go/No-Go Decision

**ALL THREE GATES MUST PASS SIMULTANEOUSLY**

- **Decision:** 🟡 PENDING — Awaiting validation results
- **Authorized By:** [CEO Name], [CTO Name]
- **Decision Date:** [To be filled]

**IF ALL GATES PASS:**
- ✅ Green light for Phase 0 commercial launch
- ✅ Customer onboarding may begin (S1 segment: Gorakhpur belt)
- ✅ Press and investor communication permitted
- ✅ Subscription activation enabled

**IF ANY GATE FAILS:**
- ❌ BLOCKER — No commercial activity permitted
- ❌ Return to Week 9 of 16-week execution plan
- ❌ Investigate root cause
- ❌ Re-train model with additional features or data
- ❌ Re-run full validation cycle

---

## 6. Appendix: Validation Scripts

### 6.1 Automated Backtesting Script

```python
# apps/pipeline/tests/backtest_accuracy.py
"""
Automated backtesting script for 6-month Gorakhpur holdout validation.
Run this script to generate accuracy gate metrics.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Dict
import sys
sys.path.append('/apps/pipeline')

def load_holdout_data(start_date: str, end_date: str) -> pd.DataFrame:
    """
    Load 6-month holdout data from Supabase predictions table.
    """
    # TODO: Implement Supabase query
    pass

def calculate_directional_accuracy(forecasts: pd.Series, actuals: pd.Series) -> float:
    """
    Calculate directional accuracy: percentage of correct rise/fall predictions.
    """
    forecast_direction = np.sign(forecasts.diff().dropna())
    actual_direction = np.sign(actuals.diff().dropna())
    
    correct = (forecast_direction == actual_direction).sum()
    total = len(forecast_direction)
    
    return (correct / total) * 100

def calculate_mape(forecasts: pd.Series, actuals: pd.Series) -> float:
    """
    Calculate Mean Absolute Percentage Error.
    """
    mape = np.mean(np.abs((actuals - forecasts) / actuals)) * 100
    return mape

def calculate_conformal_coverage(
    p10: pd.Series, 
    p50: pd.Series, 
    p90: pd.Series, 
    actuals: pd.Series
) -> float:
    """
    Calculate conformal interval coverage for P10-P90 range.
    """
    within_interval = ((actuals >= p10) & (actuals <= p90)).sum()
    total = len(actuals)
    
    return (within_interval / total) * 100

def run_backtest(start_date: str, end_date: str) -> Dict[str, float]:
    """
    Run full backtesting suite and return all accuracy metrics.
    """
    df = load_holdout_data(start_date, end_date)
    
    metrics = {
        'directional_accuracy': calculate_directional_accuracy(df['p50'], df['actual_price']),
        'mape_30d': calculate_mape(df['p50'].rolling(30).mean(), df['actual_price'].rolling(30).mean()),
        'mape_90d': calculate_mape(df['p50'].rolling(90).mean(), df['actual_price'].rolling(90).mean()),
        'mape_full': calculate_mape(df['p50'], df['actual_price']),
        'conformal_coverage': calculate_conformal_coverage(df['p10'], df['p50'], df['p90'], df['actual_price']),
    }
    
    return metrics

def check_gates(metrics: Dict[str, float]) -> Dict[str, bool]:
    """
    Check if all accuracy gates pass.
    """
    gates = {
        'gate1_directional': metrics['directional_accuracy'] >= 95.0,
        'gate2_mape': metrics['mape_30d'] < 6.0 and metrics['mape_90d'] < 6.0,
        'gate3_conformal': 78.0 <= metrics['conformal_coverage'] <= 82.0,
    }
    
    return gates

if __name__ == '__main__':
    # Example usage
    start_date = '2025-11-01'
    end_date = '2026-05-01'
    
    metrics = run_backtest(start_date, end_date)
    gates = check_gates(metrics)
    
    print("=== ACCURACY GATE RESULTS ===")
    print(f"Directional Accuracy: {metrics['directional_accuracy']:.2f}% (Target: >95%) - {'✓ PASS' if gates['gate1_directional'] else '✗ FAIL'}")
    print(f"MAPE (30-day): {metrics['mape_30d']:.2f}% (Target: <6%) - {'✓ PASS' if gates['gate2_mape'] else '✗ FAIL'}")
    print(f"Conformal Coverage: {metrics['conformal_coverage']:.2f}% (Target: 78-82%) - {'✓ PASS' if gates['gate3_conformal'] else '✗ FAIL'}")
    
    if all(gates.values()):
        print("\n✅ ALL GATES PASSED - Ready for launch")
        sys.exit(0)
    else:
        print("\n❌ ONE OR MORE GATES FAILED - Cannot launch")
        sys.exit(1)
```

### 6.2 Manual Validation Template

```markdown
## Daily Validation Log Template

**Date:** [YYYY-MM-DD]
**Mandi:** [Gorakhpur / Deoria / Kushinagar / Basti / Maharajganj]
**Validator:** [Name]

### Model Forecast
- **P10:** ₹[value]/kg
- **P50:** ₹[value]/kg
- **P90:** ₹[value]/kg
- **Signal:** [SELL_NOW / HOLD / SELL_SOON]
- **Confidence:** [value]%

### Actual Mandi Price
- **Trader 1:** ₹[value]/kg
- **Trader 2:** ₹[value]/kg
- **Trader 3:** ₹[value]/kg
- **Average:** ₹[value]/kg
- **Time:** [HH:MM]

### Comparison
- **Directional Match:** [✓/✗] (Model predicted rise/fall correctly?)
- **MAPE:** [%]
- **Within Confidence Interval:** [Yes/No]

### Notes
[Observations, market conditions, any anomalies]

### Sign-Off
**Validator Signature:** ___________________
```

---

## 7. References

- **PRD v3.0 §6:** ML Architecture: The 95%+ Pre-Launch Accuracy Mandate
- **TRD v1.0 §4:** ML Architecture — 95%+ Pre-Launch Accuracy System
- **Architecture v1.0 §3:** ML Architecture — 95%+ Pre-Launch Accuracy System
- **Architecture v1.0 §8:** 16-Week Technical Execution Plan (Week 16: Manual Validation)

---

**Document Control:**
- **Version:** 1.0
- **Last Updated:** [Date]
- **Next Review:** After model retraining cycle
- **Distribution:** CTO, CEO, Data Head, Investors (after gate clearance)
