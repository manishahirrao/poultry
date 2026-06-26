"""
PoultryPulse AI — LightGBM Training with Optuna
File: apps/pipeline/training/train_lightgbm.py
Reference: TRD v1.0 §4.1, PRD v3.0 §6.2 (Weeks 7-9)
45 features, TimeSeriesSplit n=5, Optuna 50 trials, SHAP analysis
Training time: 15-20 min on CPU | Cost: ~Rs25/run
"""

import json, pickle, logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
import lightgbm as lgb
import optuna
import shap
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_percentage_error
from train_arima import load_price_data, temporal_split, compute_directional_accuracy, HOLDOUT_MONTHS

logger = logging.getLogger(__name__)
MAPE_THRESHOLD = 12.0
DIRECTIONAL_THRESHOLD = 80.0

# 45 feature names per TRD §4.3
FEATURE_NAMES = [
    "feed_cost_ratio_lag42", "soy_price_lag42", "price_lag_7d", "price_ma_7d",
    "festival_7d_flag", "heat_stress_7d", "price_lag_1d", "monsoon_phase",
    "price_std_30d", "hpai_district_flag", "doc_placement_lag42",
    "rainfall_7d_mm", "price_lag_30d", "fuel_price_delta", "cold_wave_binary",
    "price_momentum_14d", "weekend_flag", "month_sin", "month_cos",
    "necc_zone_price_delta", "price_lag_14d", "price_lag_42d", "price_ma_30d",
    "trend_slope_14d", "hpai_adjacent_district_flag", "temperature_celsius",
    "egg_price_weekly_change", "national_egg_production_index",
    "maize_price_per_quintal", "soybean_price_per_quintal", "palm_oil_price",
    "search_interest_7d_avg", "is_festival_week", "days_to_next_festival",
    "feed_cost_ratio_42d", "necc_weekly_production", "ncdex_maize_change",
    "mcx_soy_change", "imd_forecast_temp", "imd_forecast_rainfall",
    "dahdf_hpai_alert", "global_poultry_index", "feed_cost_index",
    "demand_index", "supply_index"
]


def load_feature_matrix(data_path: str, district: str = 'gorakhpur') -> Tuple[pd.DataFrame, pd.Series]:
    """Load 45-feature matrix. Returns (X, y) where y = broiler_price_per_kg."""
    path = Path(data_path)
    if path.suffix == '.parquet':
        df = pd.read_parquet(data_path)
    else:
        df = pd.read_csv(data_path, parse_dates=['date'])

    df = df[df['district'].str.lower() == district.lower()].sort_values('date').reset_index(drop=True)
    if len(df) == 0:
        raise ValueError(f"No data for district: {district}")

    # Use available feature columns (may be subset of 45)
    available_features = [f for f in FEATURE_NAMES if f in df.columns]
    if len(available_features) < 10:
        raise ValueError(f"Only {len(available_features)} features found. Need at least 10.")
    logger.info(f"Using {len(available_features)}/{len(FEATURE_NAMES)} features")

    X = df[available_features].copy()
    y = df['broiler_price_per_kg'].copy()
    return X, y, df['date']


def optuna_objective(trial, X_train, y_train):
    """Optuna objective for LightGBM hyperparameter tuning."""
    params = {
        'objective': 'regression',
        'metric': 'mape',
        'boosting_type': 'gbdt',
        'verbosity': -1,
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'n_estimators': trial.suggest_int('n_estimators', 100, 1000),
        'max_depth': trial.suggest_int('max_depth', 3, 12),
        'num_leaves': trial.suggest_int('num_leaves', 8, 256),
        'min_child_samples': trial.suggest_int('min_child_samples', 5, 100),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0),
        'reg_alpha': trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
        'reg_lambda': trial.suggest_float('reg_lambda', 1e-8, 10.0, log=True),
    }

    # TimeSeriesSplit n=5 per PRD §6.5 Rule 3
    tscv = TimeSeriesSplit(n_splits=5)
    mape_scores = []

    for train_idx, val_idx in tscv.split(X_train):
        X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

        model = lgb.LGBMRegressor(**params)
        model.fit(
            X_tr, y_tr,
            eval_set=[(X_val, y_val)],
            callbacks=[lgb.early_stopping(50, verbose=False), lgb.log_evaluation(0)]
        )
        preds = model.predict(X_val)
        mape_scores.append(mean_absolute_percentage_error(y_val, preds) * 100)

    return np.mean(mape_scores)


def train_lightgbm(
    data_path: str, district: str = 'gorakhpur',
    output_dir: str = 'models/lightgbm', holdout_months: int = HOLDOUT_MONTHS,
    n_trials: int = 50
) -> Dict[str, Any]:
    """Train LightGBM with Optuna tuning, SHAP analysis, and accuracy validation."""
    start_time = datetime.utcnow()
    logger.info(f"Starting LightGBM training for {district} ({n_trials} Optuna trials)")

    X, y, dates = load_feature_matrix(data_path, district)

    # Temporal split
    cutoff_idx = int(len(X) * (1 - holdout_months / 36))
    X_train, X_test = X.iloc[:cutoff_idx], X.iloc[cutoff_idx:]
    y_train, y_test = y.iloc[:cutoff_idx], y.iloc[cutoff_idx:]
    logger.info(f"Train: {len(X_train)}, Test: {len(X_test)}")

    # Optuna hyperparameter search
    logger.info(f"Running Optuna optimization ({n_trials} trials)")
    study = optuna.create_study(direction='minimize', study_name='lgb_poultrypulse')
    study.optimize(lambda trial: optuna_objective(trial, X_train, y_train), n_trials=n_trials, show_progress_bar=True)

    best_params = study.best_params
    best_params.update({'objective': 'regression', 'metric': 'mape', 'boosting_type': 'gbdt', 'verbosity': -1})
    logger.info(f"Best params: {best_params}")

    # Train final model with best params
    final_model = lgb.LGBMRegressor(**best_params)
    final_model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        callbacks=[lgb.early_stopping(50, verbose=False), lgb.log_evaluation(0)]
    )

    # Predictions & metrics
    predictions = final_model.predict(X_test)
    mape = mean_absolute_percentage_error(y_test, predictions) * 100
    da = compute_directional_accuracy(y_test.values, predictions)
    mae = float(np.mean(np.abs(y_test.values - predictions)))

    logger.info(f"LightGBM — MAPE: {mape:.2f}%, DA: {da:.1f}%, MAE: Rs{mae:.2f}")

    # SHAP analysis
    logger.info("Computing SHAP values")
    explainer = shap.TreeExplainer(final_model)
    shap_values = explainer.shap_values(X_test)
    feature_importance = dict(zip(X_test.columns, np.abs(shap_values).mean(axis=0)))
    top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10]
    logger.info(f"Top 10 features: {[f[0] for f in top_features]}")

    # Verify feed_cost_lag42 in top 3 (PRD §6.2 requirement)
    top3_names = [f[0] for f in top_features[:3]]
    feed_in_top3 = 'feed_cost_ratio_lag42' in top3_names
    if not feed_in_top3:
        logger.warning("feed_cost_ratio_lag42 NOT in top 3 features — possible data alignment issue per PRD §6.2")

    # Save model
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    fn = f"lightgbm_{district}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    model_path = output_path / f"{fn}.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(final_model, f)

    # Also save as LightGBM native format
    final_model.booster_.save_model(str(output_path / f"{fn}.txt"))

    metadata = {
        'model_type': 'lightgbm', 'district': district,
        'training_samples': len(X_train), 'test_samples': len(X_test),
        'features_used': list(X_train.columns),
        'best_hyperparameters': best_params,
        'optuna_trials': n_trials, 'best_trial_mape': round(study.best_value, 4),
        'metrics': {'mape': round(mape, 4), 'directional_accuracy': round(da, 2), 'mae': round(mae, 2)},
        'shap_top_10': [{'feature': f, 'importance': round(v, 6)} for f, v in top_features],
        'feed_cost_lag42_in_top3': feed_in_top3,
        'gates_passed': {'mape': mape < MAPE_THRESHOLD, 'directional': da > DIRECTIONAL_THRESHOLD},
        'model_path': str(model_path),
        'training_time_seconds': round((datetime.utcnow() - start_time).total_seconds(), 2),
        'trained_at': datetime.utcnow().isoformat(), 'version': fn
    }
    with open(output_path / f"{fn}_metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2, default=str)

    return metadata


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Train LightGBM with Optuna')
    parser.add_argument('--data-path', required=True)
    parser.add_argument('--district', default='gorakhpur')
    parser.add_argument('--output-dir', default='models/lightgbm')
    parser.add_argument('--n-trials', type=int, default=50)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)
    print(json.dumps(train_lightgbm(args.data_path, args.district, args.output_dir, n_trials=args.n_trials), indent=2))
