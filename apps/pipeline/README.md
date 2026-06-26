# PoultryPulse AI - Data Pipeline

## Overview

This directory contains the Airflow data pipeline for PoultryPulse AI, implementing the data ingestion, validation, feature engineering, ML inference, accuracy monitoring, model retraining, and watermark audit layers.

## Architecture

The pipeline follows a serverless-first architecture on Astronomer.io (Airflow) with the following DAGs:

### DAG Schedule

| DAG | Schedule | Purpose |
|-----|----------|---------|
| `dag_raw_ingest` | 04:30 IST daily | Ingest raw data from AGMARKNET, NECC, IMD, NCDEX, MCX |
| `dag_validate` | 05:00 IST daily | Great Expectations data validation |
| `dag_feature_eng` | 05:15 IST daily | Compute 45-feature Parquet matrix |
| `dag_model_infer` | 06:00 IST daily | ML inference and prediction storage |
| `dag_accuracy_monitor` | 08:00 IST daily | Track MAPE, directional accuracy, conformal coverage |
| `dag_model_retrain` | Sundays 02:00 IST | Weekly model retraining with champion/challenger framework |
| `dag_watermark_audit` | 22:00 IST daily | Watermark detection and IP audit |

## Directory Structure

```
apps/pipeline/
├── dags/
│   ├── __init__.py
│   ├── dag_raw_ingest.py          # Raw data ingestion from public sources
│   ├── dag_validate.py            # Great Expectations validation
│   ├── dag_feature_eng.py         # 45-feature engineering
│   ├── dag_model_infer.py         # ML inference endpoint calls
│   ├── dag_accuracy_monitor.py    # Accuracy metrics tracking
│   ├── dag_model_retrain.py       # Weekly model retraining
│   └── dag_watermark_audit.py     # IP protection audit
├── great_expectations/
│   ├── __init__.py
│   └── expectations/
│       ├── __init__.py
│       └── daily_completeness.json  # Validation suite configuration
├── tests/
│   ├── __init__.py
│   └── test_features.py            # Feature engineering unit tests
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## Data Sources

### Public Data Sources (Zero-Cost)

1. **AGMARKNET** (data.gov.in API)
   - Daily broiler prices for target mandis
   - Mandis: Gorakhpur, Deoria, Basti, Kushinagar, Maharajganj

2. **NECC** (necc.co.in)
   - Daily egg prices (UP zone)
   - Feed cost proxy

3. **IMD** (api.imd.gov.in)
   - District-level weather forecasts
   - Temperature, humidity, rainfall, heat wave flags

4. **NCDEX/MCX**
   - Maize, palm oil, soybean oil prices
   - Feed cost proxies

## Feature Engineering

The pipeline computes 45 features including:

- **Lag features**: price_lag_1d, price_lag_7d, price_lag_14d, price_lag_42d
- **Rolling statistics**: 7d and 30d mean/std
- **Feed cost ratio**: broiler_price / maize_price (42d lag)
- **Festival flags**: 7-day window around major festivals
- **Heat stress**: Days >35°C in 7-day window
- **HPAI flags**: 14-day rolling HPAI alerts
- **Circular encoding**: month_sin, month_cos
- **Trend slope**: 14-day linear regression slope
- **NECC features**: Egg price weekly change
- **Google Trends**: Search interest 7d average

## ML Architecture

### Champion/Challenger Framework

- **Challenger models**: LightGBM + TFT trained weekly
- **Promotion criteria**: >2% MAPE improvement over champion
- **ONNX quantization**: ~70% size reduction
- **Accuracy thresholds**:
  - MAPE < 6%
  - Directional accuracy > 95%
  - Conformal coverage 78-82%

### Inference

- FastAPI endpoint: POST /v1/predict
- Returns: p10, p50, p90, drivers, confidence
- Circuit breaker: 3 consecutive failures → serve T-1 prediction
- Sanity check: Reject predictions outside [₹100, ₹250]

## Data Validation

### Great Expectations Suite

The `daily_completeness.json` suite validates:

- **Critical fields**: broiler_price_per_kg, mandi_name, date, completeness_overall
- **Completeness threshold**: 95%
- **Price range**: ₹100-₹250 (sanity check)
- **Mandi whitelist**: Target mandis in Gorakhpur belt
- **Source whitelist**: agmarknet, necc, imd, ncdex, mcx

Validation failures block downstream DAGs and trigger Slack alerts.

## IP Protection

### Watermark Audit

- **LSB watermarking**: Hidden in prediction images
- **Pattern**: PP-{user_id}-{timestamp}-{hash}
- **Session/device binding**: Detect multiple devices/users
- **IP theft detection**: Bulk exports, API abuse
- **Account suspension**: Automatic for critical violations

## Testing

Run unit tests for feature engineering:

```bash
cd apps/pipeline
python -m pytest tests/test_features.py -v
```

## Dependencies

Install required packages:

```bash
pip install -r requirements.txt
```

Key dependencies:
- Airflow 2.8.0
- Great Expectations 0.18.12
- pandas, numpy, pyarrow
- scikit-learn, lightgbm, statsmodels
- onnx, onnxruntime
- pytrends, stegano

## Environment Variables

Required environment variables:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `INFERENCE_API_URL`: FastAPI inference endpoint
- `SLACK_WEBHOOK_URL`: Slack alert webhook
- `AGMARKNET_API_KEY`: data.gov.in API key

## Deployment

Deploy to Astronomer.io:

```bash
# Build Docker image
docker build -t poultrypulse-pipeline .

# Push to Astronomer
astro deploy
```

## Monitoring

- **Slack alerts**: Critical failures, accuracy threshold violations, security alerts
- **Accuracy dashboard**: 30-day rolling MAPE, directional accuracy
- **Watermark audit**: Daily violation reports

## Compliance

- **DPDP Act 2023**: Data localization, consent management
- **95% accuracy mandate**: Pre-launch gate
- **Zero-cost at zero users**: Public data sources only

## References

- TRD §3.1-3.4: Data ingestion and validation
- TRD §4.2-4.3: ML architecture and feature engineering
- TRD §5.2: IP protection and watermarking
- Architecture §2.2-3.3: Pipeline and ML architecture
