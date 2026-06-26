"""
PoultryPulse AI - Package Model Files for Google Colab
This script packages model files and testing files for upload to Google Colab
"""

import os
import shutil
import zipfile
from pathlib import Path

def package_for_colab():
    """Package model files and testing files for Google Colab upload"""
    
    # Define paths
    project_root = Path(__file__).parent
    models_dir = project_root / "models"
    tests_dir = project_root / "apps" / "web" / "__tests__"
    output_dir = project_root / "colab_package"
    
    # Create output directory
    output_dir.mkdir(exist_ok=True)
    
    # Create subdirectories in output
    (output_dir / "models").mkdir(exist_ok=True)
    (output_dir / "tests").mkdir(exist_ok=True)
    (output_dir / "scripts").mkdir(exist_ok=True)
    
    print("Packaging files for Google Colab...")
    print(f"Source models directory: {models_dir}")
    print(f"Source tests directory: {tests_dir}")
    print(f"Output directory: {output_dir}")
    
    # Copy model files
    print("\n=== Copying Model Files ===")
    model_files = [
        "arima_model.pkl",
        "calibration_scalars.json",
        "lightgbm.onnx",
        "lightgbm.pkl",
        "prophet_model.pkl",
        "ridge_meta.pkl",
        "tft_quantized.onnx"
    ]
    
    for model_file in model_files:
        src = models_dir / model_file
        dst = output_dir / "models" / model_file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"[OK] Copied: {model_file}")
        else:
            print(f"[WARN] Not found: {model_file}")
    
    # Copy test files
    print("\n=== Copying Test Files ===")
    if tests_dir.exists():
        # Copy API tests
        api_tests = tests_dir / "api"
        if api_tests.exists():
            for test_file in api_tests.glob("*.ts"):
                shutil.copy2(test_file, output_dir / "tests" / test_file.name)
                print(f"[OK] Copied test: {test_file.name}")
        
        # Copy middleware tests
        middleware_tests = tests_dir / "middleware"
        if middleware_tests.exists():
            for test_file in middleware_tests.glob("*.ts"):
                shutil.copy2(test_file, output_dir / "tests" / test_file.name)
                print(f"[OK] Copied test: {test_file.name}")
        
        # Copy setup file
        setup_file = tests_dir / "setup.ts"
        if setup_file.exists():
            shutil.copy2(setup_file, output_dir / "tests" / setup_file.name)
            print(f"[OK] Copied test: {setup_file.name}")
    
    # Copy inference script
    print("\n=== Copying Scripts ===")
    inference_src = project_root / "temp_colab_extract" / "models_inference.py"
    if inference_src.exists():
        shutil.copy2(inference_src, output_dir / "scripts" / "models_inference.py")
        print(f"[OK] Copied: models_inference.py")
    else:
        print(f"[WARN] Not found: models_inference.py")
    
    # Copy requirements
    requirements_src = project_root / "temp_colab_extract" / "requirements.txt"
    if requirements_src.exists():
        shutil.copy2(requirements_src, output_dir / "scripts" / "requirements.txt")
        print(f"[OK] Copied: requirements.txt")
    else:
        print(f"[WARN] Not found: requirements.txt")
    
    # Copy training scripts
    training_src = project_root / "temp_colab_extract" / "training"
    if training_src.exists():
        training_dst = output_dir / "scripts" / "training"
        training_dst.mkdir(exist_ok=True)
        for training_file in training_src.glob("*.py"):
            shutil.copy2(training_file, training_dst / training_file.name)
            print(f"[OK] Copied training script: {training_file.name}")
    
    # Copy the Colab notebook
    notebook_src = project_root / "colab_model_testing.ipynb"
    if notebook_src.exists():
        shutil.copy2(notebook_src, output_dir / "colab_model_testing.ipynb")
        print(f"[OK] Copied: colab_model_testing.ipynb")
    
    # Create README
    readme_content = """# PoultryPulse AI - Google Colab Package

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
"""
    
    with open(output_dir / "README.md", "w", encoding="utf-8") as f:
        f.write(readme_content)
    print(f"[OK] Created: README.md")
    
    # Create ZIP archive
    print("\n=== Creating ZIP Archive ===")
    zip_path = project_root / "poutrysense_colab_package.zip"
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in output_dir.rglob("*"):
            if file_path.is_file():
                arcname = file_path.relative_to(output_dir)
                zipf.write(file_path, arcname)
                print(f"[ZIP] Added to ZIP: {arcname}")
    
    print(f"\n[OK] Package created successfully!")
    print(f"[ZIP] ZIP file: {zip_path}")
    print(f"[DIR] Unzipped directory: {output_dir}")
    print(f"\nNext steps:")
    print(f"1. Upload {zip_path.name} to Google Drive")
    print(f"2. Extract it in Google Drive")
    print(f"3. Open colab_model_testing.ipynb in Google Colab")

if __name__ == "__main__":
    package_for_colab()
