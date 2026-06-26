import sys, os
sys.path.append('colab_package')
from models_inference import ModelInferenceService
service = ModelInferenceService(models_dir='models')
service.load_models()
print('Load test completed')
