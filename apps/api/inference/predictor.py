"""
PoultryPulse AI — ML Predictor (ONNX Runtime Wrapper)
File: apps/api/inference/predictor.py
Version: v1.0 | May 2026
Design Reference: TRD v1.0 §2 (L4 ONNX quantised), Architecture v1.0 §3.1
"""

from typing import Dict, List, Any
import onnxruntime as ort
import numpy as np
import pandas as pd
from pathlib import Path
import structlog

logger = structlog.get_logger()


class Predictor:
    """
    ONNX Runtime wrapper for ML inference.
    Handles model loading, prediction, and hot-reloading.
    
    Target: <200ms P95 latency on Railway.app CPU (1 vCPU)
    """
    
    def __init__(self, model_path: str):
        """
        Initialize predictor with ONNX model.
        
        Args:
            model_path: Path to ONNX model file (.onnx)
        """
        self.model_path = Path(model_path)
        self.session: ort.InferenceSession = None
        self.model_version: str = "unknown"
        self.input_name: str = None
        self.output_names: List[str] = None
        
        self._load_model()
    
    def _load_model(self):
        """
        Load ONNX model and initialize inference session.
        """
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        logger.info("loading_model", model_path=str(self.model_path))
        
        # Create inference session with CPU provider
        # INT8 quantised model runs efficiently on CPU
        self.session = ort.InferenceSession(
            str(self.model_path),
            providers=['CPUExecutionProvider']
        )
        
        # Extract input/output names
        self.input_name = self.session.get_inputs()[0].name
        self.output_names = [output.name for output in self.session.get_outputs()]
        
        # Extract model version from metadata if available
        metadata = self.session.get_modelmeta()
        if metadata and metadata.custom_metadata_map:
            self.model_version = metadata.custom_metadata_map.get('version', 'unknown')
        else:
            # Fallback: use filename as version
            self.model_version = self.model_path.stem
        
        logger.info(
            "model_loaded_successfully",
            model_version=self.model_version,
            input_name=self.input_name,
            output_names=self.output_names,
            providers=self.session.get_providers()
        )
    
    def predict(self, feature_matrix: List[float]) -> Dict[str, Any]:
        """
        Run ensemble inference on feature matrix.
        
        Args:
            feature_matrix: List of 45 features (as specified in TRD §4.3)
        
        Returns:
            Dictionary with p10, p50, p90, drivers, confidence, model_version
        """
        if self.session is None:
            raise RuntimeError("Model not loaded")
        
        # Validate input length (45 features expected)
        if len(feature_matrix) != 45:
            raise ValueError(f"Expected 45 features, got {len(feature_matrix)}")
        
        # Convert to numpy array and reshape for ONNX
        input_array = np.array(feature_matrix, dtype=np.float32).reshape(1, -1)
        
        # Run inference
        outputs = self.session.run(
            self.output_names,
            {self.input_name: input_array}
        )
        
        # Parse outputs (assuming TFT model with quantile outputs)
        # Output order: [p10, p50, p90, confidence, feature_importances]
        p10 = float(outputs[0][0][0])
        p50 = float(outputs[1][0][0])
        p90 = float(outputs[2][0][0])
        confidence = float(outputs[3][0][0])
        
        # Validate invariant: p10 <= p50 <= p90
        if not (p10 <= p50 <= p90):
            logger.warning(
                "prediction_invariant_violation",
                p10=p10,
                p50=p50,
                p90=p90
            )
            # Swap values to maintain invariant
            p10, p50, p90 = sorted([p10, p50, p90])
        
        # Extract top 3 price drivers from feature importances
        feature_importances = outputs[4][0] if len(outputs) > 4 else np.zeros(45)
        drivers = self._extract_drivers(feature_importances)
        
        # Build prediction result
        prediction = {
            "p10": round(p10, 2),
            "p50": round(p50, 2),
            "p90": round(p90, 2),
            "drivers": drivers,
            "confidence": round(float(confidence), 3),
            "model_version": self.model_version,
            "staleness_flag": False,
            "predicted_at": pd.Timestamp.now().isoformat()
        }
        
        logger.info(
            "prediction_complete",
            p50=prediction["p50"],
            confidence=prediction["confidence"],
            model_version=prediction["model_version"]
        )
        
        return prediction
    
    def _extract_drivers(self, feature_importances: np.ndarray) -> List[Dict[str, Any]]:
        """
        Extract top 3 price drivers from feature importances.
        
        Args:
            feature_importances: Array of 45 feature importance scores
        
        Returns:
            List of top 3 PriceDriver objects
        """
        # Feature names mapping (must match TRD §4.3 specification)
        FEATURE_NAMES = [
            "feed_cost_ratio_lag42",
            "price_lag_1d",
            "price_lag_7d",
            "price_lag_14d",
            "price_lag_42d",
            "price_ma_7d",
            "price_ma_30d",
            "price_std_30d",
            "price_momentum_14d",
            "trend_slope_14d",
            "festival_7d_flag",
            "heat_stress_7d",
            "hpai_district_flag",
            "hpai_adjacent_district_flag",
            "rainfall_7d_mm",
            "temperature_celsius",
            "cold_wave_binary",
            "month_sin",
            "month_cos",
            "weekend_flag",
            "necc_zone_price_delta",
            "egg_price_weekly_change",
            "national_egg_production_index",
            "maize_price_per_quintal",
            "soybean_price_per_quintal",
            "palm_oil_price",
            "fuel_price_delta",
            "search_interest_7d_avg",
            "doc_placement_lag42",
            "monsoon_phase",
            "is_festival_week",
            "days_to_next_festival",
            "feed_cost_ratio_42d",
            "soy_price_lag42",
            "necc_weekly_production",
            "ncdex_maize_change",
            "mcx_soy_change",
            "imd_forecast_temp",
            "imd_forecast_rainfall",
            "dahdf_hpai_alert",
            "global_poultry_index",
            "feed_cost_index",
            "demand_index",
            "supply_index"
        ]
        
        # Hindi descriptions for top drivers
        DRIVER_DESCRIPTIONS_HI = {
            "feed_cost_ratio_lag42": "चारे की लागत में बढ़ोतरी से भाव प्रभावित",
            "price_lag_7d": "पिछले सप्ताह का भाव रुझान",
            "festival_7d_flag": "त्योहार की मांग से भाव बढ़ा",
            "heat_stress_7d": "गर्मी से पक्षियों की मृत्यु दर बढ़ी",
            "hpai_district_flag": "बीमारी की चेतावनी से आपूर्ति कम",
            "price_momentum_14d": "14 दिन का भाव रुझान",
            "necc_zone_price_delta": "अंडे की राष्ट्रीय दर में बदलाव",
            "maize_price_per_quintal": "मक्के की कीमत से चारे की लागत",
            "festival_7d_flag": "त्योहार के कारण मांग बढ़ी",
            "rainfall_7d_mm": "बारिश से परिवहन प्रभावित"
        }
        
        # Get indices of top 3 features by importance
        top_indices = np.argsort(feature_importances)[-3:][::-1]
        
        drivers = []
        for idx in top_indices:
            feature_name = FEATURE_NAMES[idx] if idx < len(FEATURE_NAMES) else f"feature_{idx}"
            importance = float(feature_importances[idx])
            
            # Determine impact direction based on feature name
            impact = "positive" if importance > 0 else "negative"
            magnitude = abs(importance)
            
            # Get Hindi description
            description_hi = DRIVER_DESCRIPTIONS_HI.get(
                feature_name,
                f"{feature_name} से भाव प्रभावित"
            )
            
            drivers.append({
                "factor": feature_name,
                "impact": impact,
                "magnitude": round(magnitude, 4),
                "description_hi": description_hi
            })
        
        return drivers
    
    def reload_model(self):
        """
        Hot-swap champion ONNX model without restarting the process.
        Called via POST /admin/reload-model endpoint.
        """
        logger.info("reloading_model", current_version=self.model_version)
        
        # Close current session
        if self.session:
            del self.session
            self.session = None
        
        # Reload model
        self._load_model()
        
        logger.info(
            "model_reloaded_successfully",
            new_version=self.model_version
        )
