"""
PoultryPulse AI — Predictor Tests
File: apps/api/tests/test_predictor.py
Version: v1.0 | May 2026
Design Reference: TRD v1.0 §4.2 (Accuracy Gates)
"""

import pytest
import numpy as np
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
import tempfile
import onnxruntime as ort

from inference.predictor import Predictor
from inference.sell_signal import compute_sell_signal, validate_signal_invariant


class TestPredictor:
    """Unit tests for Predictor class"""
    
    @pytest.fixture
    def mock_onnx_session(self):
        """Create a mock ONNX session for testing"""
        mock_session = Mock(spec=ort.InferenceSession)
        
        # Mock input/output names
        mock_input = Mock()
        mock_input.name = "features"
        mock_session.get_inputs.return_value = [mock_input]
        
        mock_output1 = Mock()
        mock_output1.name = "p10"
        mock_output2 = Mock()
        mock_output2.name = "p50"
        mock_output3 = Mock()
        mock_output3.name = "p90"
        mock_output4 = Mock()
        mock_output4.name = "confidence"
        mock_output5 = Mock()
        mock_output5.name = "feature_importances"
        mock_session.get_outputs.return_value = [
            mock_output1, mock_output2, mock_output3, mock_output4, mock_output5
        ]
        
        # Mock run method to return realistic predictions
        def mock_run(output_names, input_dict):
            # Return p10=155, p50=162, p90=168, confidence=0.92, feature_importances
            return [
                np.array([[155.0]]),  # p10
                np.array([[162.0]]),  # p50
                np.array([[168.0]]),  # p90
                np.array([[0.92]]),   # confidence
                np.random.rand(45)    # feature importances
            ]
        
        mock_session.run = mock_run
        
        # Mock model metadata
        mock_meta = Mock()
        mock_meta.custom_metadata_map = {'version': 'v1.0.0-test'}
        mock_session.get_modelmeta.return_value = mock_meta
        
        # Mock providers
        mock_session.get_providers.return_value = ['CPUExecutionProvider']
        
        return mock_session
    
    @pytest.fixture
    def temp_model_file(self):
        """Create a temporary file to simulate ONNX model"""
        with tempfile.NamedTemporaryFile(suffix='.onnx', delete=False) as f:
            # Write dummy data (not a real ONNX model, just for file existence)
            f.write(b'dummy onnx data')
            temp_path = f.name
        
        yield temp_path
        
        # Cleanup
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    def test_predictor_initialization(self, temp_model_file, mock_onnx_session):
        """Test that Predictor initializes correctly with valid model path"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            
            assert predictor.model_path.name.endswith('.onnx')
            assert predictor.session is not None
            assert predictor.model_version == 'v1.0.0-test'
            assert predictor.input_name == 'features'
            assert len(predictor.output_names) == 5
    
    def test_predictor_file_not_found(self):
        """Test that Predictor raises FileNotFoundError for non-existent model"""
        with pytest.raises(FileNotFoundError):
            Predictor(model_path="nonexistent_model.onnx")
    
    def test_predict_returns_valid_result(self, temp_model_file, mock_onnx_session):
        """Test that predictor returns valid PredictionResult with all required fields"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            
            # Create test feature matrix (45 features)
            features = np.random.rand(45).tolist()
            
            result = predictor.predict(features)
            
            # Validate all required fields are present
            assert 'p10' in result
            assert 'p50' in result
            assert 'p90' in result
            assert 'drivers' in result
            assert 'confidence' in result
            assert 'model_version' in result
            assert 'staleness_flag' in result
            assert 'predicted_at' in result
            
            # Validate types
            assert isinstance(result['p10'], (int, float))
            assert isinstance(result['p50'], (int, float))
            assert isinstance(result['p90'], (int, float))
            assert isinstance(result['drivers'], list)
            assert isinstance(result['confidence'], (int, float))
            assert isinstance(result['model_version'], str)
            assert isinstance(result['staleness_flag'], bool)
    
    def test_predict_p10_p50_p90_invariant(self, temp_model_file, mock_onnx_session):
        """Test that p10 <= p50 <= p90 invariant always holds"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            
            features = np.random.rand(45).tolist()
            result = predictor.predict(features)
            
            # Validate invariant
            assert result['p10'] <= result['p50'] <= result['p90'], \
                f"Invariant violation: p10={result['p10']}, p50={result['p50']}, p90={result['p90']}"
    
    def test_predict_invariant_violation_correction(self, temp_model_file):
        """Test that predictor corrects invariant violation by sorting values"""
        # Create mock session that returns values in wrong order
        mock_session = Mock(spec=ort.InferenceSession)
        mock_input = Mock()
        mock_input.name = "features"
        mock_session.get_inputs.return_value = [mock_input]
        
        mock_output1 = Mock()
        mock_output1.name = "p10"
        mock_output2 = Mock()
        mock_output2.name = "p50"
        mock_output3 = Mock()
        mock_output3.name = "p90"
        mock_output4 = Mock()
        mock_output4.name = "confidence"
        mock_output5 = Mock()
        mock_output5.name = "feature_importances"
        mock_session.get_outputs.return_value = [
            mock_output1, mock_output2, mock_output3, mock_output4, mock_output5
        ]
        
        # Return values in wrong order: p90 < p10 < p50
        def mock_run(output_names, input_dict):
            return [
                np.array([[150.0]]),  # p10 (should be lowest)
                np.array([[170.0]]),  # p50 (should be middle)
                np.array([[145.0]]),  # p90 (should be highest)
                np.array([[0.92]]),
                np.random.rand(45)
            ]
        
        mock_session.run = mock_run
        mock_meta = Mock()
        mock_meta.custom_metadata_map = {'version': 'v1.0.0-test'}
        mock_session.get_modelmeta.return_value = mock_meta
        mock_session.get_providers.return_value = ['CPUExecutionProvider']
        
        with patch('onnxruntime.InferenceSession', return_value=mock_session):
            predictor = Predictor(model_path=temp_model_file)
            features = np.random.rand(45).tolist()
            result = predictor.predict(features)
            
            # After correction, invariant should hold
            assert result['p10'] <= result['p50'] <= result['p90']
    
    def test_predict_invalid_feature_length(self, temp_model_file, mock_onnx_session):
        """Test that predictor raises ValueError for invalid feature length"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            
            # Test with wrong number of features
            invalid_features = np.random.rand(10).tolist()
            
            with pytest.raises(ValueError, match="Expected 45 features"):
                predictor.predict(invalid_features)
    
    def test_reload_model_updates_version(self, temp_model_file, mock_onnx_session):
        """Test that reload_model() updates model version without raising"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            old_version = predictor.model_version
            
            # Update mock metadata to simulate new version
            mock_onnx_session.get_modelmeta.return_value.custom_metadata_map = {
                'version': 'v1.1.0-updated'
            }
            
            predictor.reload_model()
            
            # Version should be updated
            assert predictor.model_version == 'v1.1.0-updated'
            assert predictor.model_version != old_version
            assert predictor.session is not None
    
    def test_reload_model_no_exception(self, temp_model_file, mock_onnx_session):
        """Test that reload_model() does not raise exceptions on success"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            
            # Should not raise any exception
            try:
                predictor.reload_model()
            except Exception as e:
                pytest.fail(f"reload_model() raised unexpected exception: {e}")


class TestSellSignal:
    """Unit tests for sell signal computation"""
    
    @pytest.fixture
    def sample_prediction(self):
        """Create a sample prediction result"""
        return {
            'p10': 155.0,
            'p50': 162.0,
            'p90': 168.0,
            'confidence': 0.92,
            'model_version': 'v1.0.0',
            'staleness_flag': False,
            'predicted_at': datetime.now().isoformat()
        }
    
    @pytest.fixture
    def sample_batch(self):
        """Create a sample batch record"""
        today = datetime.now()
        return {
            'batch_id': 'batch-001',
            'bird_count': 10000,
            'grow_start': (today - timedelta(days=35)).isoformat(),
            'expected_harvest_range': [
                (today + timedelta(days=7)).isoformat(),
                (today + timedelta(days=14)).isoformat()
            ],
            'feed_cost_total': 50000.0
        }
    
    def test_sell_now_signal(self, sample_prediction):
        """Test SELL_NOW signal: high confidence, within 3 days of peak"""
        batch = {
            'batch_id': 'batch-001',
            'bird_count': 10000,
            'grow_start': (datetime.now() - timedelta(days=39)).isoformat(),
            'expected_harvest_range': [
                (datetime.now() + timedelta(days=2)).isoformat(),
                (datetime.now() + timedelta(days=5)).isoformat()
            ],
            'feed_cost_total': 50000.0
        }
        
        # Set confidence > 90%
        sample_prediction['confidence'] = 0.95
        
        result = compute_sell_signal(sample_prediction, batch)
        
        assert result['signal'] == 'SELL_NOW'
        assert 0.0 <= result['signal_strength'] <= 1.0
        assert 'optimal_window_start' in result
        assert 'optimal_window_end' in result
        assert 'profit_estimate' in result
    
    def test_sell_soon_signal(self, sample_prediction):
        """Test SELL_SOON signal: upward trend, harvest within 7 days"""
        batch = {
            'batch_id': 'batch-002',
            'bird_count': 15000,
            'grow_start': (datetime.now() - timedelta(days=35)).isoformat(),
            'expected_harvest_range': [
                (datetime.now() + timedelta(days=5)).isoformat(),
                (datetime.now() + timedelta(days=10)).isoformat()
            ],
            'feed_cost_total': 75000.0
        }
        
        # Set p50 above midpoint to indicate upward trend
        sample_prediction['p50'] = 165.0
        sample_prediction['p10'] = 158.0
        sample_prediction['p90'] = 170.0
        
        result = compute_sell_signal(sample_prediction, batch)
        
        assert result['signal'] in ['SELL_SOON', 'SELL_NOW']
        assert 0.0 <= result['signal_strength'] <= 1.0
    
    def test_hold_signal(self, sample_prediction):
        """Test HOLD signal: trending up, harvest >7 days, confidence >80%"""
        batch = {
            'batch_id': 'batch-003',
            'bird_count': 20000,
            'grow_start': (datetime.now() - timedelta(days=28)).isoformat(),
            'expected_harvest_range': [
                (datetime.now() + timedelta(days=14)).isoformat(),
                (datetime.now() + timedelta(days=21)).isoformat()
            ],
            'feed_cost_total': 100000.0
        }
        
        # Set confidence >80%
        sample_prediction['confidence'] = 0.85
        
        result = compute_sell_signal(sample_prediction, batch)
        
        assert result['signal'] == 'HOLD'
        assert 0.0 <= result['signal_strength'] <= 1.0
    
    def test_low_confidence_hold(self, sample_prediction):
        """Test that low confidence triggers HOLD with caution"""
        batch = {
            'batch_id': 'batch-004',
            'bird_count': 10000,
            'grow_start': (datetime.now() - timedelta(days=35)).isoformat(),
            'expected_harvest_range': [
                (datetime.now() + timedelta(days=7)).isoformat(),
                (datetime.now() + timedelta(days=14)).isoformat()
            ],
            'feed_cost_total': 50000.0
        }
        
        # Set low confidence
        sample_prediction['confidence'] = 0.75
        
        result = compute_sell_signal(sample_prediction, batch)
        
        assert result['signal'] == 'HOLD'
        assert result['signal_strength'] <= 0.8  # Lower strength for low confidence
    
    def test_profit_estimate_calculation(self, sample_prediction):
        """Test profit estimate calculation"""
        batch = {
            'batch_id': 'batch-005',
            'bird_count': 10000,
            'grow_start': (datetime.now() - timedelta(days=35)).isoformat(),
            'expected_harvest_range': [
                (datetime.now() + timedelta(days=7)).isoformat(),
                (datetime.now() + timedelta(days=14)).isoformat()
            ],
            'feed_cost_total': 50000.0
        }
        
        result = compute_sell_signal(sample_prediction, batch)
        
        # Profit = (bird_count * avg_weight * p50) - feed_cost
        # avg_weight = 2kg
        expected_profit = (10000 * 2.0 * sample_prediction['p50']) - 50000.0
        expected_profit = max(0, expected_profit)
        
        assert result['profit_estimate'] == pytest.approx(expected_profit, rel=1e-2)
    
    def test_validate_signal_invariant_valid(self):
        """Test that validate_signal_invariant returns True for valid signal"""
        valid_signal = {
            'signal': 'SELL_NOW',
            'signal_strength': 0.85,
            'optimal_window_start': datetime.now().isoformat(),
            'optimal_window_end': (datetime.now() + timedelta(days=2)).isoformat(),
            'profit_estimate': 25000.0
        }
        
        assert validate_signal_invariant(valid_signal) is True
    
    def test_validate_signal_invariant_invalid_strength(self):
        """Test that validate_signal_invariant returns False for invalid strength"""
        invalid_signal = {
            'signal': 'SELL_NOW',
            'signal_strength': 1.5,  # Invalid: > 1.0
            'optimal_window_start': datetime.now().isoformat(),
            'optimal_window_end': (datetime.now() + timedelta(days=2)).isoformat(),
            'profit_estimate': 25000.0
        }
        
        assert validate_signal_invariant(invalid_signal) is False
    
    def test_validate_signal_invariant_invalid_signal_type(self):
        """Test that validate_signal_invariant returns False for invalid signal type"""
        invalid_signal = {
            'signal': 'INVALID_SIGNAL',
            'signal_strength': 0.85,
            'optimal_window_start': datetime.now().isoformat(),
            'optimal_window_end': (datetime.now() + timedelta(days=2)).isoformat(),
            'profit_estimate': 25000.0
        }
        
        assert validate_signal_invariant(invalid_signal) is False


class TestIntegration:
    """Integration tests for end-to-end latency"""
    
    @pytest.fixture
    def temp_model_file(self):
        """Create a temporary file to simulate ONNX model"""
        with tempfile.NamedTemporaryFile(suffix='.onnx', delete=False) as f:
            f.write(b'dummy onnx data')
            temp_path = f.name
        
        yield temp_path
        
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    @pytest.fixture
    def mock_onnx_session(self):
        """Create a mock ONNX session for integration testing"""
        mock_session = Mock(spec=ort.InferenceSession)
        
        mock_input = Mock()
        mock_input.name = "features"
        mock_session.get_inputs.return_value = [mock_input]
        
        mock_output1 = Mock()
        mock_output1.name = "p10"
        mock_output2 = Mock()
        mock_output2.name = "p50"
        mock_output3 = Mock()
        mock_output3.name = "p90"
        mock_output4 = Mock()
        mock_output4.name = "confidence"
        mock_output5 = Mock()
        mock_output5.name = "feature_importances"
        mock_session.get_outputs.return_value = [
            mock_output1, mock_output2, mock_output3, mock_output4, mock_output5
        ]
        
        def mock_run(output_names, input_dict):
            return [
                np.array([[155.0]]),
                np.array([[162.0]]),
                np.array([[168.0]]),
                np.array([[0.92]]),
                np.random.rand(45)
            ]
        
        mock_session.run = mock_run
        
        mock_meta = Mock()
        mock_meta.custom_metadata_map = {'version': 'v1.0.0-test'}
        mock_session.get_modelmeta.return_value = mock_meta
        mock_session.get_providers.return_value = ['CPUExecutionProvider']
        
        return mock_session
    
    def test_end_to_end_latency_under_200ms(self, temp_model_file, mock_onnx_session):
        """Test that end-to-end latency is <200ms on test feature matrix"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            
            import time
            features = np.random.rand(45).tolist()
            
            # Measure latency
            start_time = time.time()
            result = predictor.predict(features)
            end_time = time.time()
            
            latency_ms = (end_time - start_time) * 1000
            
            # Assert latency is under 200ms
            assert latency_ms < 200, f"Latency {latency_ms}ms exceeds 200ms target"
            
            # Also validate result is correct
            assert result['p50'] == 162.0
            assert result['confidence'] == 0.92
    
    def test_end_to_end_with_sell_signal(self, temp_model_file, mock_onnx_session):
        """Test end-to-end flow: prediction + sell signal computation"""
        with patch('onnxruntime.InferenceSession', return_value=mock_onnx_session):
            predictor = Predictor(model_path=temp_model_file)
            
            import time
            features = np.random.rand(45).tolist()
            
            batch = {
                'batch_id': 'batch-integration-001',
                'bird_count': 10000,
                'grow_start': (datetime.now() - timedelta(days=35)).isoformat(),
                'expected_harvest_range': [
                    (datetime.now() + timedelta(days=7)).isoformat(),
                    (datetime.now() + timedelta(days=14)).isoformat()
                ],
                'feed_cost_total': 50000.0
            }
            
            start_time = time.time()
            prediction = predictor.predict(features)
            sell_signal = compute_sell_signal(prediction, batch)
            end_time = time.time()
            
            total_latency_ms = (end_time - start_time) * 1000
            
            # Total latency should still be under 200ms
            assert total_latency_ms < 200, f"Total latency {total_latency_ms}ms exceeds 200ms"
            
            # Validate both results
            assert 'p50' in prediction
            assert 'signal' in sell_signal
            assert 0.0 <= sell_signal['signal_strength'] <= 1.0
