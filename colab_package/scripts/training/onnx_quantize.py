"""
PoultryPulse AI — ONNX Quantisation Pipeline  [PRODUCTION FIXED]
File: apps/pipeline/training/onnx_quantize.py
TRD §4.4: Rs3,685/month saving vs always-on GPU.
"""

import os
import json
import logging
import numpy as np
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)


def export_tft_to_onnx(
    checkpoint_path: str,
    dataset_params_path: str,
    output_onnx_path: str,
    max_encoder_length: int = 90
) -> bool:
    """
    Export TFT PyTorch Lightning checkpoint to ONNX FP32.
    Requires: pytorch-forecasting, torch, onnx
    """
    import torch
    import pickle
    from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet

    logger.info(f"Exporting TFT {checkpoint_path} -> {output_onnx_path}")
    try:
        with open(dataset_params_path, 'rb') as f:
            dataset_params = pickle.load(f)

        model = TemporalFusionTransformer.load_from_checkpoint(checkpoint_path)
        model.eval()

        # Create a dummy batch matching the dataset structure
        # Shape: (batch=1, encoder_length, n_features)
        n_features = len(dataset_params.get('time_varying_unknown_reals', [])) + \
                     len(dataset_params.get('time_varying_known_reals', []))
        dummy_x = {
            'encoder_cont': torch.randn(1, max_encoder_length, max(n_features, 1)),
            'encoder_cat': torch.zeros(1, max_encoder_length, 1, dtype=torch.long),
            'encoder_lengths': torch.tensor([max_encoder_length]),
            'decoder_cont': torch.randn(1, 30, max(n_features, 1)),
            'decoder_cat': torch.zeros(1, 30, 1, dtype=torch.long),
            'decoder_lengths': torch.tensor([30]),
            'decoder_target_lengths': torch.tensor([30]),
            'groups': torch.zeros(1, 1, dtype=torch.long),
            'target_scale': torch.ones(1, 2),
        }

        torch.onnx.export(
            model,
            (dummy_x,),
            output_onnx_path,
            opset_version=17,
            do_constant_folding=True,
            input_names=list(dummy_x.keys()),
            output_names=['p10', 'p50', 'p90'],
            dynamic_axes={'encoder_cont': {0: 'batch'}, 'decoder_cont': {0: 'batch'}},
        )
        logger.info(f"ONNX export complete: {output_onnx_path}")
        return True

    except Exception as e:
        logger.error(f"TFT ONNX export failed: {e}")
        return False


def export_lightgbm_to_onnx(
    model_pkl_path: str,
    output_onnx_path: str,
    n_features: int = 45
) -> bool:
    """Export LightGBM model to ONNX using onnxmltools."""
    import pickle
    try:
        import onnxmltools
        from onnxmltools.convert import convert_lightgbm
        from onnxmltools.utils import save_model
        from skl2onnx.common.data_types import FloatTensorType

        logger.info(f"Exporting LightGBM {model_pkl_path} -> {output_onnx_path}")
        with open(model_pkl_path, 'rb') as f:
            lgb_model = pickle.load(f)

        initial_type = [('float_input', FloatTensorType([None, n_features]))]
        onnx_model = convert_lightgbm(lgb_model, initial_types=initial_type, target_opset=17)
        save_model(onnx_model, output_onnx_path)
        logger.info(f"LightGBM ONNX saved: {output_onnx_path}")
        return True

    except Exception as e:
        logger.error(f"LightGBM ONNX export failed: {e}")
        return False


def quantize_onnx_model(input_onnx_path: str, output_quant_path: str) -> dict:
    """Apply dynamic INT8 quantization. TRD §4.4."""
    from onnxruntime.quantization import quantize_dynamic, QuantType

    logger.info(f"Quantizing {input_onnx_path} -> {output_quant_path}")
    try:
        quantize_dynamic(
            model_input=input_onnx_path,
            model_output=output_quant_path,
            weight_type=QuantType.QInt8,
        )
        orig_size = os.path.getsize(input_onnx_path)
        quant_size = os.path.getsize(output_quant_path)
        reduction = (1 - quant_size / orig_size) * 100

        logger.info(f"Size: {orig_size/1e6:.1f}MB -> {quant_size/1e6:.1f}MB ({reduction:.1f}% reduction)")
        return {
            'status': 'success',
            'original_size_bytes': orig_size,
            'quantized_size_bytes': quant_size,
            'size_reduction_pct': round(reduction, 2),
            'quantized_path': output_quant_path,
        }
    except Exception as e:
        logger.error(f"Quantization failed: {e}")
        return {'status': 'failed', 'error': str(e)}


def validate_quantization_accuracy(
    fp32_onnx_path: str,
    int8_onnx_path: str,
    X_test: np.ndarray,
    y_test: np.ndarray,
    mape_tolerance: float = 0.5,
    directional_tolerance: float = 1.0
) -> dict:
    """
    TRD §4.4 accuracy regression test.
    |quant_mape - fp_mape| < 0.5% AND |quant_dir - fp_dir| < 1%.
    Blocks deployment if either fails.
    """
    import onnxruntime as ort

    def run_inference(onnx_path: str) -> np.ndarray:
        sess = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
        input_name = sess.get_inputs()[0].name
        result = sess.run(None, {input_name: X_test.astype(np.float32)})
        return result[0].flatten()  # P50 predictions

    fp_preds = run_inference(fp32_onnx_path)
    int8_preds = run_inference(int8_onnx_path)

    def mape(actual, predicted):
        return float(np.mean(np.abs((actual - predicted) / actual)) * 100)

    def dir_acc(actual, predicted):
        a_dir = np.sign(np.diff(actual))
        p_dir = np.sign(np.diff(predicted))
        return float(np.mean(a_dir == p_dir) * 100)

    fp_mape = mape(y_test, fp_preds)
    int8_mape = mape(y_test, int8_preds)
    fp_dir = dir_acc(y_test, fp_preds)
    int8_dir = dir_acc(y_test, int8_preds)

    mape_delta = abs(int8_mape - fp_mape)
    dir_delta = abs(int8_dir - fp_dir)

    mape_ok = mape_delta < mape_tolerance
    dir_ok = dir_delta < directional_tolerance
    all_ok = mape_ok and dir_ok

    result = {
        'gate_passed': all_ok,
        'fp32_mape': round(fp_mape, 4),
        'int8_mape': round(int8_mape, 4),
        'mape_delta': round(mape_delta, 4),
        'mape_tolerance': mape_tolerance,
        'mape_ok': mape_ok,
        'fp32_dir_acc': round(fp_dir, 2),
        'int8_dir_acc': round(int8_dir, 2),
        'dir_delta': round(dir_delta, 2),
        'dir_tolerance': directional_tolerance,
        'dir_ok': dir_ok,
    }

    if all_ok:
        logger.info(f"✅ Quantization accuracy regression: PASSED (MAPE delta={mape_delta:.4f}%, Dir delta={dir_delta:.2f}%)")
    else:
        logger.error(
            f"❌ Quantization accuracy regression: FAILED. "
            f"MAPE delta={mape_delta:.4f}% (limit {mape_tolerance}%). "
            f"Dir delta={dir_delta:.2f}% (limit {directional_tolerance}%). "
            "DO NOT deploy quantized model."
        )
    return result
