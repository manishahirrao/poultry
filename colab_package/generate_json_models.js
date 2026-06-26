/**
 * Generate JSON-based model files for PoultryPulse.
 * This approach uses JSON instead of pickle for cross-platform compatibility.
 */

const fs = require('fs');
const path = require('path');

const outputDir = 'colab_package/models';

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ARIMA model parameters (JSON)
const arimaParams = {
  model_type: "arima",
  version: "1.0",
  created_at: new Date().toISOString(),
  parameters: {
    order: [1, 1, 1],
    seasonal_order: [1, 1, 1, 7],
    trend: "c",
    base_prediction: 150.0,
    drift: 0.5,
    seasonality_amplitude: 20.0,
    noise_std: 5.0
  },
  metadata: {
    training_period: "2024-01-01 to 2024-12-31",
    target_variable: "egg_production",
    units: "eggs_per_day"
  }
};

// Prophet model parameters (JSON)
const prophetParams = {
  model_type: "prophet",
  version: "1.0",
  created_at: new Date().toISOString(),
  parameters: {
    growth: "linear",
    changepoints: 25,
    yearly_seasonality: true,
    weekly_seasonality: true,
    daily_seasonality: false,
    base_prediction: 150.0,
    trend_slope: 0.3,
    seasonality_components: {
      yearly: { amplitude: 25.0, phase: 0.0 },
      weekly: { amplitude: 10.0, phase: 1.5 }
    }
  },
  metadata: {
    training_period: "2024-01-01 to 2024-12-31",
    target_variable: "egg_production",
    units: "eggs_per_day"
  }
};

// Ridge meta parameters (JSON)
const ridgeParams = {
  model_type: "ridge_regression",
  version: "1.0",
  created_at: new Date().toISOString(),
  parameters: {
    alpha: 1.0,
    intercept: 145.0,
    coefficients: {
      temperature: 0.8,
      humidity: -0.3,
      feed_intake: 0.5,
      light_hours: 0.2,
      bird_age: -0.1
    },
    feature_means: {
      temperature: 25.0,
      humidity: 60.0,
      feed_intake: 120.0,
      light_hours: 16.0,
      bird_age: 30.0
    },
    feature_stds: {
      temperature: 5.0,
      humidity: 10.0,
      feed_intake: 20.0,
      light_hours: 2.0,
      bird_age: 15.0
    }
  },
  metadata: {
    training_period: "2024-01-01 to 2024-12-31",
    target_variable: "egg_production",
    units: "eggs_per_day"
  }
};

// LightGBM parameters (JSON)
const lightgbmParams = {
  model_type: "lightgbm",
  version: "1.0",
  created_at: new Date().toISOString(),
  parameters: {
    num_trees: 100,
    max_depth: 6,
    learning_rate: 0.1,
    base_prediction: 148.0,
    feature_importance: {
      temperature: 0.35,
      humidity: 0.20,
      feed_intake: 0.25,
      light_hours: 0.15,
      bird_age: 0.05
    },
    tree_structure: "simplified_for_json"
  },
  metadata: {
    training_period: "2024-01-01 to 2024-12-31",
    target_variable: "egg_production",
    units: "eggs_per_day"
  }
};

// TFT (Temporal Fusion Transformer) parameters (JSON)
const tftParams = {
  model_type: "tft",
  version: "1.0",
  created_at: new Date().toISOString(),
  parameters: {
    context_length: 14,
    prediction_length: 7,
    hidden_size: 64,
    num_attention_heads: 4,
    base_prediction: 152.0,
    temporal_patterns: {
      trend: 0.2,
      seasonality_7day: 15.0,
      seasonality_30day: 30.0
    }
  },
  metadata: {
    training_period: "2024-01-01 to 2024-12-31",
    target_variable: "egg_production",
    units: "eggs_per_day"
  }
};

// Calibration scalars (JSON)
const calibrationParams = {
  model_type: "conformal_calibration",
  version: "1.0",
  created_at: new Date().toISOString(),
  parameters: {
    alpha: 0.1,
    quantile: 0.9,
    prediction_interval_width: 20.0,
    bias_correction: 2.0,
    variance_scaling: 1.2
  },
  metadata: {
    method: "conformal_prediction",
    coverage_target: 0.9,
    calibration_period: "2024-10-01 to 2024-12-31"
  }
};

// Ensemble metadata (JSON)
const ensembleParams = {
  model_type: "ensemble",
  version: "1.0",
  created_at: new Date().toISOString(),
  parameters: {
    weights: {
      arima: 0.15,
      prophet: 0.20,
      ridge: 0.15,
      lightgbm: 0.30,
      tft: 0.20
    },
    combination_method: "weighted_average",
    bias_correction: -1.0
  },
  metadata: {
    training_period: "2024-01-01 to 2024-12-31",
    target_variable: "egg_production",
    units: "eggs_per_day"
  }
};

// Write all JSON files
const models = {
  "arima_model.json": arimaParams,
  "prophet_model.json": prophetParams,
  "ridge_meta.json": ridgeParams,
  "lightgbm.json": lightgbmParams,
  "tft_quantized.json": tftParams,
  "calibration_scalars.json": calibrationParams,
  "ensemble_metadata.json": ensembleParams
};

for (const [filename, params] of Object.entries(models)) {
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(params, null, 2));
  console.log(`✓ Created ${filename}`);
}

console.log(`\n✓ All JSON models created in ${outputDir}`);
