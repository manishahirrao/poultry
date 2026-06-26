"""
PoultryPulse AI — Facebook Prophet Training
File: apps/pipeline/training/train_prophet.py
Reference: TRD v1.0 §4.1, PRD v3.0 §6.4
Training time: <5 min | Cost: ~Rs15/run
"""

import json, pickle, logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import numpy as np
import pandas as pd
from prophet import Prophet
from sklearn.metrics import mean_absolute_percentage_error
from train_arima import load_price_data, temporal_split, compute_directional_accuracy, HOLDOUT_MONTHS

logger = logging.getLogger(__name__)

# Indian festival calendar for UP region (PRD §6.3)
INDIAN_HOLIDAYS = [
    {'holiday': 'diwali', 'ds': '2023-11-12', 'lower_window': -7, 'upper_window': 3},
    {'holiday': 'holi', 'ds': '2023-03-08', 'lower_window': -7, 'upper_window': 2},
    {'holiday': 'eid_ul_fitr', 'ds': '2023-04-22', 'lower_window': -3, 'upper_window': 3},
    {'holiday': 'eid_ul_adha', 'ds': '2023-06-29', 'lower_window': -3, 'upper_window': 3},
    {'holiday': 'navratri', 'ds': '2023-10-15', 'lower_window': -2, 'upper_window': 9},
    {'holiday': 'raksha_bandhan', 'ds': '2023-08-30', 'lower_window': -2, 'upper_window': 2},
    {'holiday': 'christmas', 'ds': '2023-12-25', 'lower_window': -3, 'upper_window': 2},
    {'holiday': 'diwali', 'ds': '2024-11-01', 'lower_window': -7, 'upper_window': 3},
    {'holiday': 'holi', 'ds': '2024-03-25', 'lower_window': -7, 'upper_window': 2},
    {'holiday': 'eid_ul_fitr', 'ds': '2024-04-11', 'lower_window': -3, 'upper_window': 3},
    {'holiday': 'eid_ul_adha', 'ds': '2024-06-17', 'lower_window': -3, 'upper_window': 3},
    {'holiday': 'navratri', 'ds': '2024-10-03', 'lower_window': -2, 'upper_window': 9},
    {'holiday': 'diwali', 'ds': '2025-10-20', 'lower_window': -7, 'upper_window': 3},
    {'holiday': 'holi', 'ds': '2025-03-14', 'lower_window': -7, 'upper_window': 2},
    {'holiday': 'eid_ul_fitr', 'ds': '2025-03-31', 'lower_window': -3, 'upper_window': 3},
    {'holiday': 'diwali', 'ds': '2026-10-09', 'lower_window': -7, 'upper_window': 3},
    {'holiday': 'holi', 'ds': '2026-03-04', 'lower_window': -7, 'upper_window': 2},
    {'holiday': 'eid_ul_fitr', 'ds': '2026-03-20', 'lower_window': -3, 'upper_window': 3},
]


def train_prophet(
    data_path: str, district: str = 'gorakhpur',
    output_dir: str = 'models/prophet', holdout_months: int = HOLDOUT_MONTHS,
    changepoint_prior_scale: float = 0.05
) -> Dict[str, Any]:
    start_time = datetime.utcnow()
    logger.info(f"Starting Prophet training for {district}")

    df = load_price_data(data_path)
    df_district = df[df['district'].str.lower() == district.lower()].copy()
    if len(df_district) == 0:
        raise ValueError(f"No data for district: {district}")

    train_df, test_df = temporal_split(df_district, holdout_months)
    train_p = train_df[['date', 'broiler_price_per_kg']].rename(columns={'date': 'ds', 'broiler_price_per_kg': 'y'})
    test_p = test_df[['date', 'broiler_price_per_kg']].rename(columns={'date': 'ds', 'broiler_price_per_kg': 'y'})

    holidays = pd.DataFrame(INDIAN_HOLIDAYS)
    holidays['ds'] = pd.to_datetime(holidays['ds'])

    model = Prophet(
        changepoint_prior_scale=changepoint_prior_scale,
        seasonality_prior_scale=10.0, holidays_prior_scale=10.0,
        yearly_seasonality=10, weekly_seasonality=True, daily_seasonality=False,
        holidays=holidays, uncertainty_samples=1000, interval_width=0.80
    )
    model.add_seasonality(name='monthly', period=30.5, fourier_order=5)

    logger.info(f"Training Prophet on {len(train_p)} observations")
    model.fit(train_p)

    forecast = model.predict(test_p[['ds']])
    predicted = forecast['yhat'].values
    actual = test_p['y'].values

    mape = mean_absolute_percentage_error(actual, predicted) * 100
    da = compute_directional_accuracy(actual, predicted)
    mae = float(np.mean(np.abs(actual - predicted)))
    lower, upper = forecast['yhat_lower'].values, forecast['yhat_upper'].values
    coverage = float(np.sum((actual >= lower) & (actual <= upper)) / len(actual) * 100)

    logger.info(f"Prophet — MAPE: {mape:.2f}%, DA: {da:.1f}%, Coverage: {coverage:.1f}%")

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    fn = f"prophet_{district}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pkl"
    with open(output_path / fn, 'wb') as f:
        pickle.dump(model, f)

    metadata = {
        'model_type': 'prophet', 'district': district,
        'training_samples': len(train_p), 'test_samples': len(test_p),
        'metrics': {'mape': round(mape, 4), 'directional_accuracy': round(da, 2),
                     'mae': round(mae, 2), 'coverage_80': round(coverage, 2)},
        'model_path': str(output_path / fn),
        'training_time_seconds': round((datetime.utcnow() - start_time).total_seconds(), 2),
        'trained_at': datetime.utcnow().isoformat(), 'version': fn.replace('.pkl', '')
    }
    with open(output_path / fn.replace('.pkl', '_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2, default=str)
    return metadata


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-path', required=True)
    parser.add_argument('--district', default='gorakhpur')
    parser.add_argument('--output-dir', default='models/prophet')
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(train_prophet(args.data_path, args.district, args.output_dir), indent=2))
