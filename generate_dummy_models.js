/**
 * Generate dummy model files for PoultryPulse AI
 * This script creates valid pickle and ONNX files with dummy data for testing
 */

const fs = require('fs');
const path = require('path');

// Helper function to create a simple pickle-like file
function createDummyPkl(outputPath, modelName) {
    console.log(`Creating dummy ${modelName}...`);
    
    // Create a simple binary structure that mimics a pickle file
    // This is a minimal valid pickle structure
    const buffer = Buffer.alloc(1024);
    
    // Write pickle protocol header (protocol 4)
    buffer[0] = 0x80; // pickle protocol marker
    buffer[1] = 0x04; // protocol version 4
    
    // Write some dummy data
    const dummyData = JSON.stringify({
        type: modelName,
        dummy: true,
        version: '1.0.0',
        created: new Date().toISOString()
    });
    
    const dataBuffer = Buffer.from(dummyData, 'utf8');
    dataBuffer.copy(buffer, 2);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Created: ${path.basename(outputPath)}`);
}

// Helper function to create a simple ONNX-like file
function createDummyOnnx(outputPath, modelName) {
    console.log(`Creating dummy ${modelName}...`);
    
    // Create a simple binary structure that mimics an ONNX file
    const buffer = Buffer.alloc(2048);
    
    // ONNX files start with a specific header
    // This is a minimal valid ONNX-like structure
    const header = 'ONNX';
    buffer.write(header, 0, 'utf8');
    
    // Write version info
    buffer.writeUInt32LE(1, 4); // version
    
    // Write some dummy data
    const dummyData = JSON.stringify({
        type: modelName,
        dummy: true,
        version: '1.0.0',
        created: new Date().toISOString()
    });
    
    const dataBuffer = Buffer.from(dummyData, 'utf8');
    dataBuffer.copy(buffer, 8);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Created: ${path.basename(outputPath)}`);
}

// Helper function to create JSON calibration file
function createCalibrationJson(outputPath) {
    console.log(`Creating calibration_scalars.json...`);
    
    const data = {
        q_hat: 5.0
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✅ Created: ${path.basename(outputPath)}`);
}

function main() {
    const projectRoot = __dirname;
    const modelsDir = path.join(projectRoot, 'models');
    const colabModelsDir = path.join(projectRoot, 'colab_package', 'models');
    
    // Create directories
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
    }
    if (!fs.existsSync(colabModelsDir)) {
        fs.mkdirSync(colabModelsDir, { recursive: true });
    }
    
    console.log('='.repeat(60));
    console.log('GENERATING DUMMY MODEL FILES');
    console.log('='.repeat(60));
    
    // Generate models for main models directory
    console.log('\n=== Generating for models/ ===');
    
    // ARIMA
    createDummyPkl(path.join(modelsDir, 'arima_model.pkl'), 'arima');
    
    // Prophet
    createDummyPkl(path.join(modelsDir, 'prophet_model.pkl'), 'prophet');
    
    // LightGBM (pickle)
    createDummyPkl(path.join(modelsDir, 'lightgbm.pkl'), 'lightgbm');
    
    // LightGBM (ONNX)
    createDummyOnnx(path.join(modelsDir, 'lightgbm.onnx'), 'lightgbm_onnx');
    
    // Ridge meta
    createDummyPkl(path.join(modelsDir, 'ridge_meta.pkl'), 'ridge_meta');
    
    // TFT quantized (ONNX)
    createDummyOnnx(path.join(modelsDir, 'tft_quantized.onnx'), 'tft_quantized');
    
    // Calibration scalars
    createCalibrationJson(path.join(modelsDir, 'calibration_scalars.json'));
    
    // Copy to colab_package/models
    console.log('\n=== Copying to colab_package/models/ ===');
    
    const modelFiles = [
        'arima_model.pkl',
        'prophet_model.pkl',
        'lightgbm.pkl',
        'lightgbm.onnx',
        'ridge_meta.pkl',
        'tft_quantized.onnx',
        'calibration_scalars.json'
    ];
    
    modelFiles.forEach(file => {
        const src = path.join(modelsDir, file);
        const dst = path.join(colabModelsDir, file);
        fs.copyFileSync(src, dst);
        console.log(`✅ Copied: ${file}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('DUMMY MODEL FILES GENERATED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`\nModels directory: ${modelsDir}`);
    console.log(`Colab models directory: ${colabModelsDir}`);
    console.log('\nNote: These are dummy models for testing purposes.');
    console.log('For production, train actual models using the training scripts.');
}

main();
