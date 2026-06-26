# PoultryPulse AI — ML Inference API

FastAPI-based ML inference service for poultry price prediction and sell signal computation.

## Overview

This service provides:
- ONNX Runtime-based model inference with INT8 quantisation
- Sell signal computation based on prediction confidence and batch data
- Structured logging with model version and latency tracking
- Hot-reload capability for model updates without restart

## Requirements

- Python 3.10+
- ONNX model file at `models/champion/latest.onnx`

## Installation

```bash
pip install -r requirements.txt
```

## Environment Variables

- `MODEL_PATH`: Path to ONNX model file (default: `models/champion/latest.onnx`)
- `VERCEL_DOMAIN`: Allowed CORS domain (default: `*.vercel.app`)
- `RAILWAY_INTERNAL`: Railway internal network address (default: `127.0.0.1`)
- `PORT`: Server port (default: `8000`)

## Running the Service

### Development

```bash
python main.py
```

### Production

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4
```

## API Endpoints

### POST /v1/predict

Main prediction endpoint.

**Request Body:**
```json
{
  "mandi": "gorakhpur",
  "features": [0.1, 0.2, ...],  // 45 features
  "batch": {
    "batch_id": "string",
    "bird_count": 10000,
    "grow_start": "2026-04-15",
    "expected_harvest_range": ["2026-05-20", "2026-05-27"],
    "feed_cost_total": 50000
  }
}
```

**Response:**
```json
{
  "p10": 155.0,
  "p50": 162.0,
  "p90": 168.0,
  "drivers": [...],
  "confidence": 0.92,
  "model_version": "v1.0.0",
  "staleness_flag": false,
  "predicted_at": "2026-05-21T10:30:00",
  "sell_signal": {
    "signal": "SELL_NOW",
    "signal_strength": 0.85,
    "optimal_window_start": "2026-05-21T10:30:00",
    "optimal_window_end": "2026-05-23T10:30:00",
    "profit_estimate": 274000.0
  },
  "inference_latency_ms": 45.2
}
```

### GET /v1/accuracy

Returns accuracy metrics from model registry.

**Response:**
```json
{
  "mape_30d": 0.058,
  "directional_accuracy_30d": 0.952,
  "conformal_coverage_80": 0.795,
  "as_of": "2026-05-21",
  "model_version": "v1.0.0",
  "gates_passed": {
    "mape": true,
    "directional": true,
    "conformal": true
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_version": "v1.0.0",
  "model_loaded": true,
  "service": "poultrypulse-ml-inference"
}
```

### POST /admin/reload-model

Hot-reload the champion model without restarting.

**Response:**
```json
{
  "status": "success",
  "old_version": "v1.0.0",
  "new_version": "v1.1.0",
  "message": "Model reloaded successfully"
}
```

## Running Tests

```bash
pytest tests/test_predictor.py -v
```

With coverage:
```bash
pytest tests/test_predictor.py --cov=inference --cov-report=html
```

## Performance Targets

- Inference latency: <200ms P95 on Railway.app CPU (1 vCPU)
- Model load time: <5s on startup
- Hot-reload time: <1s

## Design References

- TRD v1.0 §2 (L4 ML Serving)
- Architecture v1.0 §3
- PRD v3.0 §4.1 (Sell signal logic)
