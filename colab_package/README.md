# PoultryPulse AI - Google Colab Package

This package contains all necessary files for running PoultryPulse AI models in Google Colab.

## Directory Structure

```
colab_package/
├── models/              # Trained model files
│   ├── arima_model.pkl
│   ├── calibration_scalars.json
│   ├── lightgbm.onnx
│   ├── lightgbm.pkl
│   ├── prophet_model.pkl
│   ├── ridge_meta.pkl
│   └── tft_quantized.onnx
├── tests/               # Test files from the codebase
│   ├── farms.test.ts
│   └── auth.test.ts
├── scripts/             # Python scripts for inference and training
│   ├── models_inference.py
│   ├── requirements.txt
│   └── training/
└── colab_model_testing.ipynb  # Main Colab notebook
```

## Upload Instructions

1. **Upload to Google Drive:**
   - Upload the entire `colab_package` folder to your Google Drive
   - Recommended path: `MyDrive/poutrysense_models/`

2. **Open in Google Colab:**
   - Go to [colab.research.google.com](https://colab.research.google.com)
   - Click "File" → "Open notebook"
   - Select the "Google Drive" tab
   - Navigate to `poutrysense_models/colab_model_testing.ipynb`
   - Open the notebook

3. **Run the Notebook:**
   - Mount Google Drive (first cell)
   - Install dependencies (second cell)
   - Load models and run tests
   - Execute sample predictions

## Model Files

- **arima_model.pkl**: ARIMA time series model
- **prophet_model.pkl**: Prophet forecasting model
- **lightgbm.onnx**: LightGBM model in ONNX format
- **lightgbm.pkl**: LightGBM model in pickle format
- **tft_quantized.onnx**: Temporal Fusion Transformer (quantized)
- **ridge_meta.pkl**: Ensemble meta-learner (Ridge regression)
- **calibration_scalars.json**: Conformal calibration parameters

## Test Files

- **farms.test.ts**: API endpoint tests for farm management
- **auth.test.ts**: Authentication middleware tests

## Scripts

- **models_inference.py**: Model inference service class
- **requirements.txt**: Python dependencies
- **training/**: Model training scripts

## Usage

The Colab notebook provides:
1. Model loading and initialization
2. Comprehensive model testing
3. Sample inference demonstrations
4. API test simulations
5. Test result export

## Notes

- Model files are large (total ~80MB), ensure you have sufficient Google Drive space
- The notebook uses GPU if available for faster inference
- Test results are automatically saved to Google Drive
