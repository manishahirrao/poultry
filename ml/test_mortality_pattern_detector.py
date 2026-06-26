"""
PoultryPulse AI - Mortality Pattern Detector Unit Tests
Description: Unit tests for rule-based pattern detection
Requirements: TASK-040
Author: PoultryPulse AI Team
Date: May 2026
"""

import unittest
import sys
import os
from datetime import datetime

# Add the ml directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from mortality_pattern_detector import MortalityPatternDetector


class TestMortalityPatternDetector(unittest.TestCase):
    """Unit tests for mortality pattern detection."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.detector = MortalityPatternDetector()
    
    def test_doc_stress_pattern_day_7(self):
        """Test DOC stress pattern detection on day 7."""
        mortality_data = {
            'spike_day': 7,
            'cause_distribution': {'unknown': 100},
            'season': 3,
            'mortality_rate_today': 0.8,
            'mortality_rate_7d_avg': 0.2
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'doc_stress')
        self.assertGreater(result['confidence'], 0.8)
        self.assertEqual(result['detection_method'], 'rule_based')
        self.assertIn('day 7', result['reason'].lower())
    
    def test_doc_stress_pattern_day_5(self):
        """Test DOC stress pattern detection on day 5."""
        mortality_data = {
            'spike_day': 5,
            'cause_distribution': {'unknown': 100},
            'season': 3,
            'mortality_rate_today': 0.6,
            'mortality_rate_7d_avg': 0.15
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'doc_stress')
        self.assertGreater(result['confidence'], 0.8)
    
    def test_doc_stress_pattern_day_10(self):
        """Test DOC stress pattern detection on day 10."""
        mortality_data = {
            'spike_day': 10,
            'cause_distribution': {'unknown': 100},
            'season': 3,
            'mortality_rate_today': 0.7,
            'mortality_rate_7d_avg': 0.2
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'doc_stress')
        self.assertGreater(result['confidence'], 0.8)
    
    def test_ibd_pattern_day_18_respiratory(self):
        """Test IBD pattern detection on day 18 with respiratory causes."""
        mortality_data = {
            'spike_day': 18,
            'cause_distribution': {'respiratory': 60, 'digestive': 20, 'unknown': 20},
            'season': 8,
            'mortality_rate_today': 1.2,
            'mortality_rate_7d_avg': 0.4
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'ibd_pattern')
        self.assertGreater(result['confidence'], 0.7)
        self.assertIn('day 18', result['reason'].lower())
    
    def test_ibd_pattern_day_15_digestive(self):
        """Test IBD pattern detection on day 15 with digestive causes."""
        mortality_data = {
            'spike_day': 15,
            'cause_distribution': {'digestive': 50, 'respiratory': 30, 'unknown': 20},
            'season': 8,
            'mortality_rate_today': 1.0,
            'mortality_rate_7d_avg': 0.35
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'ibd_pattern')
        self.assertGreater(result['confidence'], 0.7)
    
    def test_ibd_pattern_day_25(self):
        """Test IBD pattern detection on day 25."""
        mortality_data = {
            'spike_day': 25,
            'cause_distribution': {'respiratory': 35, 'digestive': 25, 'unknown': 40},
            'season': 9,
            'mortality_rate_today': 0.9,
            'mortality_rate_7d_avg': 0.3
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'ibd_pattern')
        self.assertGreater(result['confidence'], 0.6)
    
    def test_heat_stress_pattern_april(self):
        """Test heat stress pattern detection in April."""
        mortality_data = {
            'spike_day': 30,
            'cause_distribution': {'heat_stress': 70, 'unknown': 30},
            'season': 4,  # April
            'mortality_rate_today': 0.9,
            'mortality_rate_7d_avg': 0.3
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'heat_stress')
        self.assertGreater(result['confidence'], 0.7)
        self.assertIn('summer', result['reason'].lower())
    
    def test_heat_stress_pattern_may(self):
        """Test heat stress pattern detection in May."""
        mortality_data = {
            'spike_day': 35,
            'cause_distribution': {'heat_stress': 80, 'unknown': 20},
            'season': 5,  # May
            'mortality_rate_today': 1.1,
            'mortality_rate_7d_avg': 0.35
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'heat_stress')
        self.assertGreater(result['confidence'], 0.7)
    
    def test_heat_stress_pattern_june(self):
        """Test heat stress pattern detection in June."""
        mortality_data = {
            'spike_day': 28,
            'cause_distribution': {'heat_stress': 65, 'unknown': 35},
            'season': 6,  # June
            'mortality_rate_today': 0.85,
            'mortality_rate_7d_avg': 0.28
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'heat_stress')
        self.assertGreater(result['confidence'], 0.7)
    
    def test_disease_outbreak_pattern(self):
        """Test disease outbreak pattern detection with sudden spike."""
        mortality_data = {
            'spike_day': 12,
            'cause_distribution': {'respiratory': 40, 'digestive': 30, 'unknown': 30},
            'season': 9,
            'mortality_rate_today': 1.5,
            'mortality_rate_7d_avg': 0.3
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'disease_outbreak')
        self.assertGreater(result['confidence'], 0.85)
        self.assertIn('spike', result['reason'].lower())
    
    def test_disease_outbreak_pattern_extreme(self):
        """Test disease outbreak pattern with extreme spike."""
        mortality_data = {
            'spike_day': 20,
            'cause_distribution': {'respiratory': 50, 'digestive': 30, 'unknown': 20},
            'season': 10,
            'mortality_rate_today': 2.0,
            'mortality_rate_7d_avg': 0.4
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'disease_outbreak')
        self.assertGreater(result['confidence'], 0.85)
    
    def test_normal_mortality_pattern(self):
        """Test normal mortality pattern detection."""
        mortality_data = {
            'spike_day': 25,
            'cause_distribution': {'unknown': 100},
            'season': 10,
            'mortality_rate_today': 0.2,
            'mortality_rate_7d_avg': 0.25
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'normal')
        self.assertGreater(result['confidence'], 0.9)
        self.assertIn('normal', result['reason'].lower())
    
    def test_unknown_pattern_no_match(self):
        """Test unknown pattern when no rules match."""
        mortality_data = {
            'spike_day': 35,
            'cause_distribution': {'unknown': 100},
            'season': 2,  # February (not summer)
            'mortality_rate_today': 0.4,
            'mortality_rate_7d_avg': 0.35
        }
        
        result = self.detector.apply_rule_based_detection(mortality_data)
        
        self.assertEqual(result['detected_pattern'], 'unknown')
        self.assertEqual(result['confidence'], 0.5)
    
    def test_get_recommendations_doc_stress(self):
        """Test getting recommendations for DOC stress pattern."""
        recommendations = self.detector.get_recommendations('doc_stress')
        
        self.assertIn('pattern_hindi', recommendations)
        self.assertIn('pattern_english', recommendations)
        self.assertIn('recommendation_hindi', recommendations)
        self.assertIn('recommendation_english', recommendations)
        self.assertIn('DOC', recommendations['pattern_hindi'])
        self.assertIn('supplier', recommendations['recommendation_english'].lower())
    
    def test_get_recommendations_ibd_pattern(self):
        """Test getting recommendations for IBD pattern."""
        recommendations = self.detector.get_recommendations('ibd_pattern')
        
        self.assertIn('vaccination', recommendations['recommendation_english'].lower())
        self.assertIn('biosecurity', recommendations['recommendation_english'].lower())
        self.assertIn('टीकाकरण', recommendations['recommendation_hindi'])
    
    def test_get_recommendations_heat_stress(self):
        """Test getting recommendations for heat stress pattern."""
        recommendations = self.detector.get_recommendations('heat_stress')
        
        self.assertIn('ventilation', recommendations['recommendation_english'].lower())
        self.assertIn('water', recommendations['recommendation_english'].lower())
        self.assertIn('वेंटिलेशन', recommendations['recommendation_hindi'])
    
    def test_get_recommendations_disease_outbreak(self):
        """Test getting recommendations for disease outbreak pattern."""
        recommendations = self.detector.get_recommendations('disease_outbreak')
        
        self.assertIn('veterinarian', recommendations['recommendation_english'].lower())
        self.assertIn('isolate', recommendations['recommendation_english'].lower())
        self.assertIn('डॉक्टर', recommendations['recommendation_hindi'])
    
    def test_get_recommendations_unknown(self):
        """Test getting recommendations for unknown pattern."""
        recommendations = self.detector.get_recommendations('unknown')
        
        self.assertIn('data', recommendations['recommendation_english'].lower())
        self.assertIn('डेटा', recommendations['recommendation_hindi'])
    
    def test_prepare_ml_features(self):
        """Test ML feature preparation."""
        mortality_data = {
            'spike_day': 18,
            'cause_distribution': {'respiratory': 60, 'digestive': 20, 'unknown': 20},
            'season': 8,
            'fcr_trend': 1.8,
            'mortality_rate_today': 1.2,
            'mortality_rate_7d_avg': 0.4
        }
        
        features = self.detector.prepare_ml_features(mortality_data)
        
        self.assertEqual(features.shape, (1, 11))  # 11 features
        self.assertGreaterEqual(features[0][0], 0)  # Normalized day
        self.assertLessEqual(features[0][0], 1)   # Normalized day
        self.assertGreaterEqual(features[0][1], 0)  # Respiratory pct
        self.assertLessEqual(features[0][1], 1)   # Respiratory pct
    
    def test_predict_pattern_rule_based(self):
        """Test pattern prediction using rule-based method."""
        mortality_data = {
            'spike_day': 7,
            'cause_distribution': {'unknown': 100},
            'season': 3,
            'fcr_trend': 1.7,
            'mortality_rate_today': 0.8,
            'mortality_rate_7d_avg': 0.2
        }
        
        result = self.detector.predict_pattern(mortality_data, use_ml=False)
        
        self.assertEqual(result['detected_pattern'], 'doc_stress')
        self.assertEqual(result['detection_method'], 'rule_based')
        self.assertIn('confidence', result)
        self.assertIn('reason', result)
    
    def test_predict_pattern_ml_fallback(self):
        """Test pattern prediction falls back to rule-based when ML not trained."""
        mortality_data = {
            'spike_day': 18,
            'cause_distribution': {'respiratory': 60, 'digestive': 20, 'unknown': 20},
            'season': 8,
            'fcr_trend': 1.8,
            'mortality_rate_today': 1.2,
            'mortality_rate_7d_avg': 0.4
        }
        
        # ML model is not trained, should fall back to rule-based
        result = self.detector.predict_pattern(mortality_data, use_ml=True)
        
        self.assertEqual(result['detected_pattern'], 'ibd_pattern')
        self.assertEqual(result['detection_method'], 'rule_based')
    
    def test_analyze_batch_no_mortality_data(self):
        """Test batch analysis with no mortality data."""
        batch_id = 'test-batch-123'
        mortality_logs = []
        batch_info = {
            'doc_placement_date': datetime.now().date(),
            'doc_count': 25000,
            'breed': 'Cobb 500'
        }
        
        result = self.detector.analyze_batch(batch_id, mortality_logs, batch_info)
        
        self.assertEqual(result['batch_id'], batch_id)
        self.assertEqual(result['detected_pattern'], 'unknown')
        self.assertEqual(result['confidence'], 0.0)
        self.assertIn('No mortality data', result['reason'])


if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)
