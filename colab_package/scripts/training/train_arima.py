"""
PoultryPulse AI — ARIMA(0,1,4) Baseline Training
File: apps/pipeline/training/train_arima.py
Reference: TRD v1.0 §4.1 (ARIMA baseline), PRD v3.0 §6.2 (Weeks 5-6)

Karnataka paper specification: ARIMA(0,1,4) — first differencing, MA(4)
Training time: <2 min on Railway.app CPU (1 vCPU, 512MB RAM)
Cost: ~Rs12/run
"""

import os
import json
import pickle
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from sklearn.metrics import mean_absolute_percentage_error

logger = logging.getLogger(__name__)

# Model configuration per Karnataka paper specification
ARIMA_ORDER = (0, 1, 4)  # AR=0, I=1 (first differencing), MA=4
HOLDOUT_MONTHS = 6
MIN_TRAINING_MONTHS = 30

# Accuracy gates per TRD §4.2
MAPE_THRESHOLD = 18.0  # Weeks 5-6 baseline target
DIRECTIONAL_THRESHOLD = 65.0  # Weeks 5-6 baseline target


def load_price_data(data_path: str) -> pd.DataFrame:
    """
    Load historical broiler price data from Parquet or CSV.
    Expects columns: date, district, broiler_price_per_kg
    """
    path = Path(data_path)
    if path.suffix == '.parquet':
        df = pd.read_parquet(data_path)
    elif path.suffix == '.csv':
        df = pd.read_csv(data_path, parse_dates=['date'])
    else:
        raise ValueError(f"Unsupported file format: {path.suffix}")
    
    # Validate required columns
    required_cols = ['date', 'district', 'broiler_price_per_kg']
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    
    # Sort by date
    df = df.sort_values('date').reset_index(drop=True)
    
    # Validate price range per TRD §3.3 (Rs80–Rs250)
    invalid_prices = df[
        (df['broiler_price_per_kg'] < 80) | (df['broiler_price_per_kg'] > 250)
    ]
    if len(invalid_prices) > 0:
        logger.warning(
            f"Found {len(invalid_prices)} prices outside valid range (80-250). "
            "These will be interpolated."
        )
        df.loc[invalid_prices.index, 'broiler_price_per_kg'] = np.nan
        df['broiler_price_per_kg'] = df['broiler_price_per_kg'].interpolate(
            method='linear', limit=3
        )
    
    return df


def check_stationarity(series: pd.Series) -> Dict[str, Any]:
    """
    Augmented Dickey-Fuller test for stationarity.
    ARIMA(0,1,4) uses first differencing (I=1) for non-stationary series.
    """
    result = adfuller(series.dropna(), autolag='AIC')
    return {
        'adf_statistic': float(result[0]),
        'p_value': float(result[1]),
        'used_lag': int(result[2]),
        'n_obs': int(result[3]),
        'critical_values': {k: float(v) for k, v in result[4].items()},
        'is_stationary': result[1] < 0.05
    }


def temporal_split(
    df: pd.DataFrame,
    holdout_months: int = HOLDOUT_MONTHS
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Strict temporal train/test split.
    PRD §6.5 Rule 1: NEVER use random split on time series.
    """
    df = df.sort_values('date')
    cutoff_date = df['date'].max() - pd.DateOffset(months=holdout_months)
    
    train = df[df['date'] <= cutoff_date].copy()
    test = df[df['date'] > cutoff_date].copy()
    
    logger.info(
        f"Temporal split: train={len(train)} rows "
        f"(up to {cutoff_date.date()}), test={len(test)} rows"
    )
    
    return train, test


def compute_directional_accuracy(
    actual: np.ndarray,
    predicted: np.ndarray
) -> float:
    """
    Directional accuracy: did model predict correct price direction?
    PRD §6.1: sign(forecast_t - forecast_{t-1}) == sign(actual_t - actual_{t-1})
    """
    actual_direction = np.sign(np.diff(actual))
    predicted_direction = np.sign(np.diff(predicted))
    
    correct = np.sum(actual_direction == predicted_direction)
    total = len(actual_direction)
    
    return (correct / total) * 100 if total > 0 else 0.0


def train_arima(
    data_path: str,
    district: str = 'gorakhpur',
    output_dir: str = 'models/arima',
    holdout_months: int = HOLDOUT_MONTHS
) -> Dict[str, Any]:
    """
    Train ARIMA(0,1,4) baseline model per Karnataka paper specification.
    
    Args:
        data_path: Path to historical price data (Parquet/CSV)
        district: Target district for training
        output_dir: Directory to save model artifacts
        holdout_months: Number of months for holdout test set
    
    Returns:
        Dictionary with training results, metrics, and model path
    """
    start_time = datetime.utcnow()
    logger.info(f"Starting ARIMA(0,1,4) training for {district}")
    
    # Load data
    df = load_price_data(data_path)
    
    # Filter to target district
    df_district = df[df['district'].str.lower() == district.lower()].copy()
    if len(df_district) == 0:
        raise ValueError(f"No data found for district: {district}")
    
    # Set date as index for time series
    df_district = df_district.set_index('date')
    price_series = df_district['broiler_price_per_kg']
    
    # Check data completeness
    total_days = (price_series.index.max() - price_series.index.min()).days
    completeness = len(price_series) / total_days * 100 if total_days > 0 else 0
    logger.info(f"Data completeness: {completeness:.1f}%")
    
    if completeness < 95:
        logger.warning(
            f"Data completeness {completeness:.1f}% is below 95% threshold. "
            "PRD §6.2 Week 1-2: Do NOT proceed without 95% completeness."
        )
    
    # Stationarity check
    stationarity = check_stationarity(price_series)
    logger.info(
        f"ADF test: statistic={stationarity['adf_statistic']:.4f}, "
        f"p-value={stationarity['p_value']:.4f}, "
        f"stationary={stationarity['is_stationary']}"
    )
    
    # Temporal split — PRD §6.5 Rule 1
    df_district_reset = df_district.reset_index()
    train_df, test_df = temporal_split(df_district_reset, holdout_months)
    
    train_series = train_df.set_index('date')['broiler_price_per_kg']
    test_series = test_df.set_index('date')['broiler_price_per_kg']
    
    # Train ARIMA(0,1,4)
    logger.info(f"Training ARIMA{ARIMA_ORDER} on {len(train_series)} observations")
    
    model = ARIMA(
        train_series,
        order=ARIMA_ORDER,
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    fitted_model = model.fit()
    
    # Model summary
    logger.info(f"AIC: {fitted_model.aic:.2f}, BIC: {fitted_model.bic:.2f}")
    
    # Generate predictions on test set
    forecast = fitted_model.forecast(steps=len(test_series))
    
    # Compute metrics
    actual_values = test_series.values
    predicted_values = forecast.values
    
    # MAPE
    mape = mean_absolute_percentage_error(actual_values, predicted_values) * 100
    
    # Directional accuracy
    directional_accuracy = compute_directional_accuracy(actual_values, predicted_values)
    
    # MAE
    mae = np.mean(np.abs(actual_values - predicted_values))
    
    # RMSE
    rmse = np.sqrt(np.mean((actual_values - predicted_values) ** 2))
    
    logger.info(
        f"ARIMA Results — MAPE: {mape:.2f}%, "
        f"Directional: {directional_accuracy:.1f}%, "
        f"MAE: Rs{mae:.2f}, RMSE: Rs{rmse:.2f}"
    )
    
    # Check accuracy gates
    mape_passed = mape < MAPE_THRESHOLD
    directional_passed = directional_accuracy > DIRECTIONAL_THRESHOLD
    
    if not mape_passed:
        logger.warning(
            f"MAPE {mape:.2f}% exceeds threshold {MAPE_THRESHOLD}%. "
            "PRD §6.2: If baseline MAPE > 25%, data quality problem."
        )
    
    if not directional_passed:
        logger.warning(
            f"Directional accuracy {directional_accuracy:.1f}% below threshold "
            f"{DIRECTIONAL_THRESHOLD}%."
        )
    
    # Save model artifact
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    model_filename = f"arima_{district}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pkl"
    model_path = output_path / model_filename
    
    with open(model_path, 'wb') as f:
        pickle.dump(fitted_model, f)
    
    # Save metadata
    training_time = (datetime.utcnow() - start_time).total_seconds()
    
    metadata = {
        'model_type': 'arima',
        'order': list(ARIMA_ORDER),
        'district': district,
        'training_samples': len(train_series),
        'test_samples': len(test_series),
        'train_date_range': {
            'start': str(train_series.index.min()),
            'end': str(train_series.index.max())
        },
        'test_date_range': {
            'start': str(test_series.index.min()),
            'end': str(test_series.index.max())
        },
        'metrics': {
            'mape': round(mape, 4),
            'directional_accuracy': round(directional_accuracy, 2),
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'aic': round(fitted_model.aic, 2),
            'bic': round(fitted_model.bic, 2)
        },
        'gates_passed': {
            'mape': mape_passed,
            'directional': directional_passed
        },
        'stationarity_test': stationarity,
        'data_completeness': round(completeness, 2),
        'model_path': str(model_path),
        'training_time_seconds': round(training_time, 2),
        'trained_at': datetime.utcnow().isoformat(),
        'version': model_filename.replace('.pkl', '')
    }
    
    metadata_path = output_path / model_filename.replace('.pkl', '_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2, default=str)
    
    logger.info(f"Model saved to {model_path}")
    logger.info(f"Metadata saved to {metadata_path}")
    
    return metadata


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train ARIMA(0,1,4) baseline model')
    parser.add_argument('--data-path', required=True, help='Path to price data')
    parser.add_argument('--district', default='gorakhpur', help='Target district')
    parser.add_argument('--output-dir', default='models/arima', help='Output directory')
    parser.add_argument('--holdout-months', type=int, default=6, help='Holdout months')
    
    args = parser.parse_args()
    
    logging.basicConfig(level=logging.INFO)
    result = train_arima(
        data_path=args.data_path,
        district=args.district,
        output_dir=args.output_dir,
        holdout_months=args.holdout_months
    )
    
    print(json.dumps(result, indent=2))
