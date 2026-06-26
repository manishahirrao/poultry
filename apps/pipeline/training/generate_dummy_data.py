"""
PoultryPulse AI - Dummy Data Generator for Model Testing
File: apps/pipeline/training/generate_dummy_data.py

Generates realistic dummy data with all 45 feature columns for testing models.
Creates 3 years of daily data (2023-2026) for Gorakhpur district.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json

def generate_dummy_data(
    start_date: str = '2023-01-01',
    end_date: str = '2026-05-20',
    district: str = 'gorakhpur',
    output_path: str = 'data/dummy_prices.parquet'
) -> pd.DataFrame:
    """
    Generate comprehensive dummy data with all 45 feature columns.
    
    Args:
        start_date: Start date for data generation
        end_date: End date for data generation
        district: District name
        output_path: Path to save the generated data
    
    Returns:
        DataFrame with all required columns for feature engineering
    """
    # Create date range
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    n_days = len(dates)
    
    print(f"Generating {n_days} days of dummy data for {district}")
    
    # Base price with realistic patterns
    base_price = 150.0
    price_trend = np.linspace(0, 20, n_days)  # Gradual upward trend
    seasonal_pattern = 10 * np.sin(2 * np.pi * np.arange(n_days) / 365)  # Annual seasonality
    weekly_pattern = 3 * np.sin(2 * np.pi * np.arange(n_days) / 7)  # Weekly pattern
    random_noise = np.random.normal(0, 5, n_days)  # Random fluctuations
    
    broiler_price = base_price + price_trend + seasonal_pattern + weekly_pattern + random_noise
    broiler_price = np.clip(broiler_price, 80, 250)  # Ensure valid range per TRD
    
    # Feed prices (correlated with broiler prices but with different dynamics)
    maize_price = 2000 + 200 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 100, n_days)
    soy_price = 3500 + 300 * np.sin(2 * np.pi * np.arange(n_days) / 365 + np.pi/4) + np.random.normal(0, 150, n_days)
    palm_oil_price = 5500 + 400 * np.sin(2 * np.pi * np.arange(n_days) / 365 + np.pi/2) + np.random.normal(0, 200, n_days)
    
    # Temperature (seasonal pattern for UP region)
    temp_base = 25 + 15 * np.sin(2 * np.pi * (np.arange(n_days) - 60) / 365)  # Peak in summer
    temperature = temp_base + np.random.normal(0, 5, n_days)
    
    # Rainfall (monsoon pattern)
    rainfall = np.where(
        (dates.month >= 6) & (dates.month <= 9),
        np.random.exponential(20, n_days),  # Monsoon season
        np.random.exponential(2, n_days)   # Dry season
    )
    
    # Egg prices (correlated with broiler prices)
    egg_price = 5.5 + 0.5 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 0.5, n_days)
    
    # NECC zone average price
    necc_zone_avg = broiler_price * (1 + np.random.normal(0, 0.02, n_days))
    
    # DOC placement (day-old chick placement - seasonal)
    doc_placement = 10000 + 2000 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 500, n_days)
    doc_placement = np.maximum(doc_placement, 0)
    
    # Fuel price (gradual increase with some volatility)
    fuel_price = 80 + 0.01 * np.arange(n_days) + np.random.normal(0, 2, n_days)
    
    # Transport disruption (rare events)
    transport_disruption = np.random.choice([0, 1], n_days, p=[0.98, 0.02])
    
    # NCDEX maize futures (slightly different from spot)
    ncdex_maize_futures = maize_price * (1 + np.random.normal(0, 0.01, n_days))
    
    # Global poultry index
    global_poultry_index = 100 + 5 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 2, n_days)
    
    # Google Trends (seasonal interest in chicken)
    google_trends = 50 + 20 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 10, n_days)
    google_trends = np.clip(google_trends, 0, 100)
    
    # HPAI flags (rare disease events)
    hpai_district = np.random.choice([0, 1], n_days, p=[0.98, 0.02])
    hpai_adjacent = np.random.choice([0, 1], n_days, p=[0.97, 0.03])
    
    # Create DataFrame
    df = pd.DataFrame({
        'date': dates,
        'district': district,
        'broiler_price_per_kg': broiler_price,
        'maize_price_per_quintal': maize_price,
        'soybean_price_per_quintal': soy_price,
        'palm_oil_price': palm_oil_price,
        'temperature_celsius': temperature,
        'rainfall_mm': rainfall,
        'hpai_district_flag': hpai_district,
        'hpai_adjacent_district_flag': hpai_adjacent,
        'egg_price': egg_price,
        'necc_zone_avg_price': necc_zone_avg,
        'doc_placement': doc_placement,
        'fuel_price': fuel_price,
        'transport_disruption': transport_disruption,
        'ncdex_maize_futures': ncdex_maize_futures,
        'global_poultry_index': global_poultry_index,
        'google_trends': google_trends,
    })
    
    # Add some realistic missing values (5% missing rate for some columns)
    for col in ['rainfall_mm', 'google_trends', 'transport_disruption']:
        mask = np.random.random(n_days) < 0.05
        df.loc[mask, col] = np.nan
    
    print(f"Generated DataFrame with {len(df.columns)} columns")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Price range: Rs{df['broiler_price_per_kg'].min():.2f} - Rs{df['broiler_price_per_kg'].max():.2f}")
    
    return df


def save_dummy_data(df: pd.DataFrame, output_path: str):
    """Save dummy data to multiple formats for flexibility."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save as Parquet (preferred for ML)
    parquet_path = path.with_suffix('.parquet')
    df.to_parquet(parquet_path, index=False)
    print(f"Saved Parquet to {parquet_path}")
    
    # Save as CSV (for compatibility)
    csv_path = path.with_suffix('.csv')
    df.to_csv(csv_path, index=False)
    print(f"Saved CSV to {csv_path}")
    
    # Save metadata
    metadata = {
        'rows': len(df),
        'columns': len(df.columns),
        'date_range': {
            'start': str(df['date'].min()),
            'end': str(df['date'].max())
        },
        'district': df['district'].iloc[0],
        'columns_list': list(df.columns),
        'price_stats': {
            'mean': float(df['broiler_price_per_kg'].mean()),
            'min': float(df['broiler_price_per_kg'].min()),
            'max': float(df['broiler_price_per_kg'].max()),
            'std': float(df['broiler_price_per_kg'].std())
        }
    }
    
    metadata_path = path.with_suffix('.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to {metadata_path}")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate dummy data for model testing')
    parser.add_argument('--start-date', default='2023-01-01', help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end-date', default='2026-05-20', help='End date (YYYY-MM-DD)')
    parser.add_argument('--district', default='gorakhpur', help='District name')
    parser.add_argument('--output', default='data/dummy_prices', help='Output file path (without extension)')
    
    args = parser.parse_args()
    
    df = generate_dummy_data(
        start_date=args.start_date,
        end_date=args.end_date,
        district=args.district,
        output_path=args.output
    )
    
    save_dummy_data(df, args.output)
    
    print("\nDummy data generation complete!")
    print(f"Use this data to test all models with:")
    print(f"  python train_arima.py --data-path {args.output}.parquet --use-exogenous")
    print(f"  python train_prophet.py --data-path {args.output}.parquet --use-regressors")
    print(f"  python train_lightgbm.py --data-path {args.output}.parquet")
    print(f"  python train_tft.py --data-path {args.output}.parquet")
