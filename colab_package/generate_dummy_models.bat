@echo off
REM Generate Dummy ML Models for Colab Package
REM This script generates properly structured dummy models that preserve ML logic

echo Generating dummy ML models with preserved logic...
echo.

REM Try to find Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Found Python in PATH
    python colab_package\generate_simple_dummy_models.py
    goto :end
)

REM Try py launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo Found Python launcher
    py colab_package\generate_simple_dummy_models.py
    goto :end
)

REM Try common Python installations
if exist "C:\Python311\python.exe" (
    echo Found Python 3.11
    "C:\Python311\python.exe" colab_package\generate_simple_dummy_models.py
    goto :end
)

if exist "C:\Python310\python.exe" (
    echo Found Python 3.10
    "C:\Python310\python.exe" colab_package\generate_simple_dummy_models.py
    goto :end
)

if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe" (
    echo Found Python 3.11 in AppData
    "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe" colab_package\generate_simple_dummy_models.py
    goto :end
)

echo ERROR: Python not found. Please install Python or add it to your PATH.
echo Then run: python colab_package\generate_simple_dummy_models.py

:end
echo.
echo Done!
