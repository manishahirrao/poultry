# Google Colab Upload Instructions for PoultryPulse AI Models

## Overview
This guide explains how to upload and use PoultryPulse AI models in Google Colab for inference and testing.

## Prerequisites
- Google account with Google Drive
- Access to Google Colab (colab.research.google.com)
- Model files packaged using `package_models_for_colab.py`

## Step 1: Package Files Locally

Run the packaging script to bundle all necessary files:

```bash
python package_models_for_colab.py
```

This will create:
- `colab_package/` directory with all files
- `poutrysense_colab_package.zip` archive

## Step 2: Upload to Google Drive

### Option A: Upload ZIP File (Recommended)
1. Go to [drive.google.com](https://drive.google.com)
2. Create a new folder named `poutrysense_models`
3. Upload `poutrysense_colab_package.zip` to this folder
4. Right-click the ZIP file and select "Extract here"
5. You should now see the extracted contents

### Option B: Upload Individual Files
1. Go to [drive.google.com](https://drive.google.com)
2. Create a folder structure:
   ```
   MyDrive/
   └── poutrysense_models/
       ├── models/
       ├── tests/
       ├── scripts/
       └── colab_model_testing.ipynb
   ```
3. Upload files to their respective folders:
   - Model files (.pkl, .onnx, .json) → `models/`
   - Test files (.ts) → `tests/`
   - Scripts (.py, .txt) → `scripts/`
   - Notebook → root of `poutrysense_models/`

## Step 3: Open in Google Colab

1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Click **File** → **Open notebook**
3. Select the **Google Drive** tab
4. Navigate to `MyDrive/poutrysense_models/`
5. Click on `colab_model_testing.ipynb`
6. The notebook will open in Colab

## Step 4: Configure Runtime (Optional but Recommended)

1. In Colab, click **Runtime** → **Change runtime type**
2. Select **GPU** for faster inference (if available)
3. Click **Save**

## Step 5: Run the Notebook

Execute the cells in order:

### Cell 1: Mount Google Drive
```python
from google.colab import drive
drive.mount('/content/drive')
```
- Click the authorization link
- Sign in to your Google account
- Copy the authorization code
- Paste it in the notebook and press Enter

### Cell 2: Install Dependencies
```python
!pip install -q numpy pandas scikit-learn lightgbm statsmodels prophet onnxruntime pytest
```
- This will take 2-3 minutes

### Cell 3: Import Libraries
- Sets up paths and imports required libraries

### Cell 4: Load Models
- Initializes the ModelInferenceService
- Loads all model files from Google Drive
- You should see ✅ messages for each successfully loaded model

### Cell 5-6: Run Tests
- Executes comprehensive model tests
- Runs API test simulations
- Displays test results

### Cell 7: Sample Inference
- Runs sample predictions with dummy data
- Displays prediction intervals (P10, P50, P90)

### Cell 8: Export Results
- Saves test results to `test_results.json` in Google Drive

## File Structure After Upload

Your Google Drive should look like this:

```
MyDrive/
└── poutrysense_models/
    ├── models/
    │   ├── arima_model.pkl
    │   ├── calibration_scalars.json
    │   ├── lightgbm.onnx
    │   ├── lightgbm.pkl
    │   ├── prophet_model.pkl
    │   ├── ridge_meta.pkl
    │   └── tft_quantized.onnx
    ├── tests/
    │   ├── farms.test.ts
    │   ├── auth.test.ts
    │   └── setup.ts
    ├── scripts/
    │   ├── models_inference.py
    │   ├── requirements.txt
    │   └── training/
    │       ├── train_arima.py
    │       ├── train_lightgbm.py
    │       ├── train_prophet.py
    │       └── ...
    ├── colab_model_testing.ipynb
    └── test_results.json (generated after running)
```

## Troubleshooting

### Issue: "Models directory not found"
**Solution:** Ensure you uploaded files to `MyDrive/poutrysense_models/models/`

### Issue: Model loading fails
**Solution:** Check that all model files are uploaded and not corrupted. File sizes should be:
- arima_model.pkl: ~5MB
- lightgbm.onnx: ~15MB
- prophet_model.pkl: ~8MB
- tft_quantized.onnx: ~37MB

### Issue: GPU not available
**Solution:** Runtime → Change runtime type → Select GPU (if available in your plan)

### Issue: Out of memory
**Solution:** 
- Use CPU runtime instead of GPU
- Reduce batch size in inference
- Restart runtime and clear cache

### Issue: Authorization fails
**Solution:** 
- Ensure you're signed in to the correct Google account
- Try revoking Colab access and re-authorizing
- Use a different browser if needed

## Advanced Usage

### Running Custom Predictions

After loading models, you can run custom predictions:

```python
# Prepare your features
X_custom = np.array([...])  # Your feature array

# Run prediction
predictions = service.predict(X_custom)

# Access results
p10 = predictions['p10']  # 10th percentile
p50 = predictions['p50']  # Median
p90 = predictions['p90']  # 90th percentile
```

### Training New Models

The training scripts are included in `scripts/training/`:

```python
# Example: Train LightGBM
!python scripts/training/train_lightgbm.py
```

### Running Specific Tests

```python
# Run only model loading tests
tester.test_model_loading()

# Run only conformal calibration tests
tester.test_conformal_calibration()
```

## Storage Requirements

- Total model files: ~80MB
- Google Drive free tier: 15GB (sufficient)
- Colab disk space: ~70GB (sufficient)

## Performance Expectations

- **Model loading:** 10-30 seconds
- **Single prediction:** <1 second
- **Batch prediction (7 days):** 1-3 seconds
- **Full test suite:** 30-60 seconds

## Next Steps

1. ✅ Upload files to Google Drive
2. ✅ Open notebook in Colab
3. ✅ Run all cells to verify setup
4. ✅ Review test results
5. ✅ Experiment with custom predictions
6. ✅ Export models for production if needed

## Support

For issues or questions:
- Check the test results in `test_results.json`
- Review the Colab notebook cell outputs
- Ensure all dependencies are installed correctly
- Verify file paths in Google Drive

## File Locations

- **Local project:** `d:\Saas\poutrysense\`
- **Packaging script:** `package_models_for_colab.py`
- **Colab notebook:** `colab_model_testing.ipynb`
- **ZIP archive:** `poutrysense_colab_package.zip`
- **Google Drive:** `MyDrive/poutrysense_models/`
