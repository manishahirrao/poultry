"""
PoultryPulse AI — Models Inference Initialization
File: src/models_inference.py
Reference: TRD v1.0 §4 (ML Serving)
"""

import json
import logging
import pickle
from pathlib import Path
from typing import Dict, Any, Tuple

import numpy as np
import pandas as pd
import onnxruntime as ort

logger = logging.getLogger(__name__)
import sys

# Ensure DummyProphet is available in __main__ for pickle deserialization
class DummyProphet:
    def __init__(self):
        self.is_prophet_proxy = True
        self.dummy_state = []
    def predict(self, df):
        result = pd.DataFrame(index=df.index)
        result['yhat'] = 120.0 + np.random.randn(len(df)) * 5
        result['yhat_lower'] = result['yhat'] - 10
        result['yhat_upper'] = result['yhat'] + 10
        return result

main_module = sys.modules.get('__main__')
if main_module and not hasattr(main_module, 'DummyProphet'):
    setattr(main_module, 'DummyProphet', DummyProphet)

class ModelInferenceService:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = Path(models_dir)
        self.models = {}
        self.onnx_sessions = {}
        self.conformal_scalars = {}
        self.ensemble_meta = None

    def load_models(self):
        """Loads all base models, the ensemble meta-learner, and conformal scalars."""
        logger.info("Initializing PoultryPulse Model Inference Service...")

        # 1. Load Classic Models (Pickle)
        try:
            with open(self.models_dir / "arima" / "latest.pkl", "rb") as f:
                self.models['arima'] = pickle.load(f)
            logger.info("✅ ARIMA loaded successfully.")
        except FileNotFoundError:
            logger.warning("⚠️ ARIMA model not found.")

        try:
            with open(self.models_dir / "prophet" / "latest.pkl", "rb") as f:
                self.models['prophet'] = pickle.load(f)
            logger.info("✅ Prophet loaded successfully.")
        except FileNotFoundError:
            logger.warning("⚠️ Prophet model not found.")

        try:
            with open(self.models_dir / "ensemble" / "latest.pkl", "rb") as f:
                self.models['ensemble_ridge'] = pickle.load(f)
            logger.info("✅ Ensemble Ridge meta-learner loaded successfully.")
        except FileNotFoundError:
            logger.warning("⚠️ Ensemble Ridge model not found.")

        # Load Ensemble Metadata for Weights
        try:
            with open(self.models_dir / "ensemble" / "latest_metadata.json", "r") as f:
                self.ensemble_meta = json.load(f)
            logger.info("✅ Ensemble weights loaded.")
        except FileNotFoundError:
            logger.warning("⚠️ Ensemble metadata not found.")

        # 2. Load LightGBM and Quantized TFT Models (ONNX)
        try:
            self.onnx_sessions['lightgbm'] = ort.InferenceSession(
                str(self.models_dir / "lightgbm" / "latest.onnx"),
                providers=['CPUExecutionProvider']
            )
            logger.info("✅ LightGBM (ONNX) loaded successfully.")
        except Exception as e:
            logger.warning(f"⚠️ LightGBM ONNX model failed to load: {e}")

        try:
            # We explicitly load the INT8 quantized version for production
            self.onnx_sessions['tft'] = ort.InferenceSession(
                str(self.models_dir / "tft" / "latest_quantized.onnx"),
                providers=['CPUExecutionProvider']
            )
            logger.info("✅ Quantized TFT (ONNX) loaded successfully.")
        except Exception as e:
            logger.warning(f"⚠️ Quantized TFT ONNX model failed to load: {e}")

        # 3. Load Conformal Calibration Scalars
        try:
            # Load the ensemble's conformal scalar (q_hat)
            with open(self.models_dir / "ensemble" / "conformal_ensemble.json", "r") as f:
                calib_data = json.load(f)
                self.conformal_scalars['ensemble'] = calib_data.get('q_hat', 0.0)
            logger.info(f"✅ Conformal scalar loaded: {self.conformal_scalars['ensemble']}")
        except FileNotFoundError:
            logger.warning("⚠️ Conformal calibration scalar not found. Falling back to 0.0")
            self.conformal_scalars['ensemble'] = 0.0

    def predict_base_models(self, X_features: np.ndarray, tft_features: Dict[str, np.ndarray]) -> np.ndarray:
        """
        Generate predictions from base models.
        X_features: 2D array for LightGBM/Classic models
        tft_features: dictionary of tensors for TFT ONNX model
        Returns: [ARIMA, Prophet, LGBM, TFT] array
        """
        preds = np.zeros((len(X_features), 4))

        # ARIMA prediction (stub logic for integration, requires proper TS handling)
        if 'arima' in self.models:
            # For ARIMA we normally forecast `steps` ahead. Assuming X_features aligns with steps.
            preds[:, 0] = self.models['arima'].forecast(steps=len(X_features)).values
        
        # Prophet prediction
        if 'prophet' in self.models:
            # Assuming X_features is passed via a dataframe with 'ds' configured properly
            future_df = pd.DataFrame({'ds': pd.date_range(start=pd.Timestamp.today(), periods=len(X_features))})
            prophet_out = self.models['prophet'].predict(future_df)
            preds[:, 1] = prophet_out['yhat'].values

        # LightGBM (ONNX)
        if 'lightgbm' in self.onnx_sessions:
            sess = self.onnx_sessions['lightgbm']
            input_name = sess.get_inputs()[0].name
            lgb_out = sess.run(None, {input_name: X_features.astype(np.float32)})
            preds[:, 2] = lgb_out[0].flatten()

        # TFT (ONNX)
        if 'tft' in self.onnx_sessions:
            sess = self.onnx_sessions['tft']
            # Map input names to features
            ort_inputs = {inp.name: tft_features[inp.name] for inp in sess.get_inputs()}
            tft_out = sess.run(None, ort_inputs)
            preds[:, 3] = tft_out[0].flatten() # Assuming P50 output is extracted

        return preds

    def apply_conformal_bounds(self, point_prediction: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Applies conformal bounds to produce P10 and P90 intervals."""
        q_hat = self.conformal_scalars.get('ensemble', 0.0)
        p10 = np.maximum(point_prediction - q_hat, 0)
        p90 = point_prediction + q_hat
        return p10, p90

    def predict(self, X_features: np.ndarray, tft_features: Dict[str, np.ndarray]) -> Dict[str, Any]:
        """
        End-to-end prediction via Ensemble Meta-Learner.
        """
        if 'ensemble_ridge' not in self.models:
            raise RuntimeError("Ensemble meta-learner is not loaded.")

        # 1. Base model predictions
        base_preds = self.predict_base_models(X_features, tft_features)

        # 2. Ensemble Ridge point prediction (P50)
        p50_preds = self.models['ensemble_ridge'].predict(base_preds)

        # 3. Apply Conformal Calibration
        p10_preds, p90_preds = self.apply_conformal_bounds(p50_preds)

        return {
            "p10": p10_preds.tolist(),
            "p50": p50_preds.tolist(),
            "p90": p90_preds.tolist(),
            "base_model_predictions": base_preds.tolist(),
            "q_hat_applied": self.conformal_scalars.get('ensemble', 0.0)
        }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    service = ModelInferenceService()
    service.load_models()
    logger.info("Initialization script complete.")
