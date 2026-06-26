"""
PoultryPulse AI — Facebook Prophet Training
File: apps/pipeline/training/train_prophet.py
Reference: TRD v1.0 §4.1, PRD v3.0 §6.4
Training time: <5 min | Cost: ~Rs15/run
"""

import json, pickle, logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from prophet import Prophet
from sklearn.metrics import mean_absolute_percentage_error
from train_arima import load_price_data, temporal_split, compute_directional_accuracy, HOLDOUT_MONTHS
import sys
sys.path.append(str(Path(__file__).parent.parent / 'dags'))
from dag_feature_eng import (
    compute_feed_cost_features,
    compute_weather_features,
    compute_disease_features,
    compute_calendar_features,
    compute_price_lag_features,
    compute_rolling_statistics,
    compute_supply_features,
    compute_external_market_features
)

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

# Additional regressors for Prophet (features that improve forecasting)
PROPHET_REGRESSORS = [
    'feed_cost_ratio_lag42',      # Most important feature per spec
    'maize_price_current',         # Current feed cost
    'heat_stress_7d',              # Weather impact on supply
    'monsoon_phase',               # Seasonal supply impact
    'hpai_district_flag',          # Disease shock
    'festival_7d_flag',            # Demand spike (complements holidays)
    'price_ma_7d',                 # Recent trend
    'price_std_30d',               # Volatility signal
]


def prepare_prophet_regressors(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare additional regressors for Prophet.
    Prophet can handle external regressors that improve forecasting accuracy.
    We select features that complement Prophet's built-in holiday/seasonality handling.
    """
    df_indexed = df.set_index('date')
    
    regressors = {}
    
    # Feed cost features (most important)
    feed_cost = compute_feed_cost_features(df_indexed)
    regressors['feed_cost_ratio_lag42'] = feed_cost['feed_cost_ratio_lag42']
    regressors['maize_price_current'] = feed_cost['maize_price_current']
    
    # Weather features
    weather = compute_weather_features(df_indexed)
    regressors['heat_stress_7d'] = weather['heat_stress_7d']
    regressors['monsoon_phase'] = weather['monsoon_phase']
    
    # Disease features
    disease = compute_disease_features(df_indexed)
    regressors['hpai_district_flag'] = disease['hpai_district_flag']
    
    # Calendar features (complements built-in holidays)
    calendar = compute_calendar_features(df_indexed)
    regressors['festival_7d_flag'] = calendar['festival_7d_flag']
    
    # Price statistics
    rolling = compute_rolling_statistics(df_indexed)
    regressors['price_ma_7d'] = rolling['price_ma_7d']
    regressors['price_std_30d'] = rolling['price_std_30d']
    
    regressors_df = pd.DataFrame(regressors)
    regressors_df = regressors_df.fillna(method='ffill').fillna(0)
    
    return regressors_df.reset_index()


def train_prophet(
    data_path: str, district: str = 'gorakhpur',
    output_dir: str = 'models/prophet', holdout_months: int = HOLDOUT_MONTHS,
    changepoint_prior_scale: float = 0.05,
    use_regressors: bool = True
) -> Dict[str, Any]:
    start_time = datetime.utcnow()
    logger.info(f"Starting Prophet training for {district} (regressors={use_regressors})")

    df = load_price_data(data_path)
    df_district = df[df['district'].str.lower() == district.lower()].copy()
    if len(df_district) == 0:
        raise ValueError(f"No data for district: {district}")

    train_df, test_df = temporal_split(df_district, holdout_months)
    train_p = train_df[['date', 'broiler_price_per_kg']].rename(columns={'date': 'ds', 'broiler_price_per_kg': 'y'})
    test_p = test_df[['date', 'broiler_price_per_kg']].rename(columns={'date': 'ds', 'broiler_price_per_kg': 'y'})

    # Prepare additional regressors if requested
    train_regressors = None
    test_regressors = None
    if use_regressors:
        logger.info("Preparing additional regressors for Prophet")
        full_regressors = prepare_prophet_regressors(df_district)
        train_regressors = full_regressors[full_regressors['date'].isin(train_df['date'])]
        test_regressors = full_regressors[full_regressors['date'].isin(test_df['date'])]
        logger.info(f"Regressors: {PROPHET_REGRESSORS}")

    holidays = pd.DataFrame(INDIAN_HOLIDAYS)
    holidays['ds'] = pd.to_datetime(holidays['ds'])

    model = Prophet(
        changepoint_prior_scale=changepoint_prior_scale,
        seasonality_prior_scale=10.0, holidays_prior_scale=10.0,
        yearly_seasonality=10, weekly_seasonality=True, daily_seasonality=False,
        holidays=holidays, uncertainty_samples=1000, interval_width=0.80
    )
    model.add_seasonality(name='monthly', period=30.5, fourier_order=5)

    # Add additional regressors
    if use_regressors:
        for regressor in PROPHET_REGRESSORS:
            if regressor in train_regressors.columns:
                model.add_regressor(regressor)
                logger.info(f"Added regressor: {regressor}")

    logger.info(f"Training Prophet on {len(train_p)} observations")
    
    if use_regressors:
        # Merge regressors with training data
        train_merged = train_p.merge(train_regressors, on='ds', how='left')
        model.fit(train_merged)
    else:
        model.fit(train_p)

    # Prepare test data with regressors
    if use_regressors:
        test_merged = test_p.merge(test_regressors, on='ds', how='left')
        forecast = model.predict(test_merged)
    else:
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
        'additional_regressors': PROPHET_REGRESSORS if use_regressors else [],
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
    parser.add_argument('--use-regressors', action='store_true', help='Use additional regressors')
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(train_prophet(args.data_path, args.district, args.output_dir), indent=2))
