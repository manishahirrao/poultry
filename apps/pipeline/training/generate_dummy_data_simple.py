"""
Simple Dummy Data Generator - Run with: python generate_dummy_data_simple.py
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

# Generate dates
dates = pd.date_range(start='2023-01-01', end='2026-05-20', freq='D')
n_days = len(dates)
district = 'gorakhpur'

print(f"Generating {n_days} days of dummy data...")

# Base price with realistic patterns
base_price = 150.0
price_trend = np.linspace(0, 20, n_days)
seasonal_pattern = 10 * np.sin(2 * np.pi * np.arange(n_days) / 365)
weekly_pattern = 3 * np.sin(2 * np.pi * np.arange(n_days) / 7)
random_noise = np.random.normal(0, 5, n_days)

broiler_price = base_price + price_trend + seasonal_pattern + weekly_pattern + random_noise
broiler_price = np.clip(broiler_price, 80, 250)

# Feed prices
maize_price = 2000 + 200 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 100, n_days)
soy_price = 3500 + 300 * np.sin(2 * np.pi * np.arange(n_days) / 365 + np.pi/4) + np.random.normal(0, 150, n_days)
palm_oil_price = 5500 + 400 * np.sin(2 * np.pi * np.arange(n_days) / 365 + np.pi/2) + np.random.normal(0, 200, n_days)

# Temperature
temp_base = 25 + 15 * np.sin(2 * np.pi * (np.arange(n_days) - 60) / 365)
temperature = temp_base + np.random.normal(0, 5, n_days)

# Rainfall
rainfall = np.where(
    (dates.month >= 6) & (dates.month <= 9),
    np.random.exponential(20, n_days),
    np.random.exponential(2, n_days)
)

# Other features
egg_price = 5.5 + 0.5 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 0.5, n_days)
necc_zone_avg = broiler_price * (1 + np.random.normal(0, 0.02, n_days))
doc_placement = 10000 + 2000 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 500, n_days)
doc_placement = np.maximum(doc_placement, 0)
fuel_price = 80 + 0.01 * np.arange(n_days) + np.random.normal(0, 2, n_days)
transport_disruption = np.random.choice([0, 1], n_days, p=[0.98, 0.02])
ncdex_maize_futures = maize_price * (1 + np.random.normal(0, 0.01, n_days))
global_poultry_index = 100 + 5 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 2, n_days)
google_trends = 50 + 20 * np.sin(2 * np.pi * np.arange(n_days) / 365) + np.random.normal(0, 10, n_days)
google_trends = np.clip(google_trends, 0, 100)
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

# Add some missing values
for col in ['rainfall_mm', 'google_trends', 'transport_disruption']:
    mask = np.random.random(n_days) < 0.05
    df.loc[mask, col] = np.nan

# Save files
output_dir = 'data'
import os
os.makedirs(output_dir, exist_ok=True)

# CSV
csv_path = f'{output_dir}/dummy_prices.csv'
df.to_csv(csv_path, index=False)
print(f"Saved CSV to {csv_path}")

# Parquet
try:
    parquet_path = f'{output_dir}/dummy_prices.parquet'
    df.to_parquet(parquet_path, index=False)
    print(f"Saved Parquet to {parquet_path}")
except:
    print("Parquet save failed (pyarrow may not be installed)")

# Metadata
metadata = {
    'rows': len(df),
    'columns': len(df.columns),
    'date_range': {'start': str(df['date'].min()), 'end': str(df['date'].max())},
    'district': district,
    'columns_list': list(df.columns),
    'price_stats': {
        'mean': float(df['broiler_price_per_kg'].mean()),
        'min': float(df['broiler_price_per_kg'].min()),
        'max': float(df['broiler_price_per_kg'].max()),
        'std': float(df['broiler_price_per_kg'].std())
    }
}

with open(f'{output_dir}/dummy_prices_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"Saved metadata to {output_dir}/dummy_prices_metadata.json")

print("\nDummy data generation complete!")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")
print(f"Price range: Rs{df['broiler_price_per_kg'].min():.2f} - Rs{df['broiler_price_per_kg'].max():.2f}")
print(f"\nUse this data to test models:")
print(f"  python train_arima.py --data-path {csv_path} --use-exogenous")
print(f"  python train_prophet.py --data-path {csv_path} --use-regressors")
print(f"  python train_lightgbm.py --data-path {csv_path}")
print(f"  python train_tft.py --data-path {csv_path}")
