"""
PoultryPulse AI - Mortality Pattern Detection Model
Description: Rule-based + ML detection for mortality spike patterns
Requirements: REQ-016 §16.7, REQ-024 §24.1, TASK-040
Author: PoultryPulse AI Team
Date: May 2026
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MortalityPatternDetector:
    """
    Mortality pattern detector using rule-based heuristics and ML classification.
    Identifies likely cause patterns from mortality spike timing and characteristics.
    """
    
    # Pattern definitions with Hindi/English recommendations
    PATTERNS = {
        'doc_stress': {
            'hindi': 'DOC स्ट्रेस - परिवहन के दौरान तनाव',
            'english': 'DOC Stress - Transportation stress during placement',
            'recommendation_hindi': 'DOC सप्लायर की गुणवत्ता जांचें। अगली बैच के लिए बेहतर परिवहन व्यवस्था करें।',
            'recommendation_english': 'Check DOC supplier quality. Arrange better transportation for next batch.'
        },
        'ibd_pattern': {
            'hindi': 'IBD/गुम्बोरो - वायरल संक्रमण',
            'english': 'IBD/Gumboro - Viral infection',
            'recommendation_hindi': 'टीकाकरण समय सीमा जांचें। बायोसिक्योरिटी बढ़ाएं। डॉक्टर से सलाह लें।',
            'recommendation_english': 'Check vaccination schedule. Enhance biosecurity. Consult veterinarian.'
        },
        'heat_stress': {
            'hindi': 'गर्मी का तनाव - शेड का तापमान अधिक',
            'english': 'Heat Stress - High shed temperature',
            'recommendation_hindi': 'वेंटिलेशन बढ़ाएं। पानी की आपूर्ति सुनिश्चित करें। शेड को ठंडा रखें।',
            'recommendation_english': 'Increase ventilation. Ensure water supply. Keep shed cool.'
        },
        'disease_outbreak': {
            'hindi': 'रोग प्रकोप - तत्काल डॉक्टर को बुलाएं',
            'english': 'Disease Outbreak - Call veterinarian immediately',
            'recommendation_hindi': 'तुरंत पशु चिकित्सक से संपर्क करें। अलग-थलग करें। सैनिटाइज़ेशन करें।',
            'recommendation_english': 'Contact veterinarian immediately. Isolate affected birds. Sanitize facility.'
        },
        'normal': {
            'hindi': 'सामान्य - मानक के भीतर',
            'english': 'Normal - Within standard range',
            'recommendation_hindi': 'वर्तमान प्रथाएं जारी रखें। नियमित निगरानी करें।',
            'recommendation_english': 'Continue current practices. Maintain regular monitoring.'
        },
        'unknown': {
            'hindi': 'अज्ञात - अधिक डेटा की आवश्यकता',
            'english': 'Unknown - More data needed',
            'recommendation_hindi': 'अधिक मृत्यु डेटा एकत्र करें। कारण का विश्लेषण करें।',
            'recommendation_english': 'Collect more mortality data. Analyze cause patterns.'
        }
    }
    
    def __init__(self):
        """Initialize the mortality pattern detector."""
        self.model: Optional[LogisticRegression] = None
        self.scaler: Optional[StandardScaler] = None
        self.feature_names: List[str] = []
        self.is_trained = False
        
    def apply_rule_based_detection(self, mortality_data: Dict) -> Dict:
        """
        Apply rule-based pattern detection based on mortality spike timing.
        
        Args:
            mortality_data: Dictionary containing mortality information
                - spike_day: Day of mortality spike (age in days)
                - cause_distribution: Dict of cause percentages
                - season: Current season (month number)
                - mortality_rate_today: Today's mortality rate
                - mortality_rate_7d_avg: 7-day average mortality rate
                
        Returns:
            Dictionary with detected pattern and confidence
        """
        spike_day = mortality_data.get('spike_day', 0)
        cause_distribution = mortality_data.get('cause_distribution', {})
        season = mortality_data.get('season', datetime.now().month)
        mortality_rate_today = mortality_data.get('mortality_rate_today', 0)
        mortality_rate_7d_avg = mortality_data.get('mortality_rate_7d_avg', 0)
        
        detected_pattern = 'unknown'
        confidence = 0.5
        reason = ''
        
        # Rule 1: DOC stress pattern (days 5-10)
        if 5 <= spike_day <= 10:
            detected_pattern = 'doc_stress'
            confidence = 0.85
            reason = f'Spike on day {spike_day} indicates DOC transportation stress'
            
        # Rule 2: IBD pattern (days 15-25)
        elif 15 <= spike_day <= 25:
            # Check if respiratory or digestive causes are dominant
            respiratory_pct = cause_distribution.get('respiratory', 0)
            digestive_pct = cause_distribution.get('digestive', 0)
            
            if respiratory_pct > 30 or digestive_pct > 30:
                detected_pattern = 'ibd_pattern'
                confidence = 0.80
                reason = f'Spike on day {spike_day} with respiratory/digestive causes indicates IBD'
            else:
                detected_pattern = 'ibd_pattern'
                confidence = 0.65
                reason = f'Spike on day {spike_day} indicates possible IBD'
                
        # Rule 3: Heat stress pattern (April-June, summer months)
        elif season in [4, 5, 6]:  # April, May, June
            detected_pattern = 'heat_stress'
            confidence = 0.75
            reason = f'Spike during summer season (month {season}) indicates heat stress'
            
        # Rule 4: Disease outbreak (sudden spike across all causes)
        elif mortality_rate_today > (mortality_rate_7d_avg * 3):
            detected_pattern = 'disease_outbreak'
            confidence = 0.90
            reason = f'Sudden spike ({mortality_rate_today:.2f}% vs 7d avg {mortality_rate_7d_avg:.2f}%) indicates disease outbreak'
            
        # Rule 5: Normal mortality
        elif mortality_rate_today < 0.3:
            detected_pattern = 'normal'
            confidence = 0.95
            reason = 'Mortality rate within normal range'
            
        return {
            'detected_pattern': detected_pattern,
            'confidence': confidence,
            'reason': reason,
            'detection_method': 'rule_based'
        }
    
    def prepare_ml_features(self, mortality_data: Dict) -> np.ndarray:
        """
        Prepare features for ML-based pattern detection.
        
        Args:
            mortality_data: Dictionary containing mortality information
                
        Returns:
            Feature array for ML model
        """
        spike_day = mortality_data.get('spike_day', 0)
        cause_distribution = mortality_data.get('cause_distribution', {})
        season = mortality_data.get('season', datetime.now().month)
        fcr_trend = mortality_data.get('fcr_trend', 0)
        mortality_rate_today = mortality_data.get('mortality_rate_today', 0)
        mortality_rate_7d_avg = mortality_data.get('mortality_rate_7d_avg', 0)
        
        # Extract cause distribution features
        respiratory_pct = cause_distribution.get('respiratory', 0)
        digestive_pct = cause_distribution.get('digestive', 0)
        heat_stress_pct = cause_distribution.get('heat_stress', 0)
        unknown_pct = cause_distribution.get('unknown', 0)
        
        # Season encoding (cyclical)
        season_sin = np.sin(2 * np.pi * season / 12)
        season_cos = np.cos(2 * np.pi * season / 12)
        
        # Feature vector
        features = [
            spike_day / 42.0,  # Normalized day (0-1)
            respiratory_pct / 100.0,  # Normalized cause percentages
            digestive_pct / 100.0,
            heat_stress_pct / 100.0,
            unknown_pct / 100.0,
            season_sin,
            season_cos,
            fcr_trend if fcr_trend else 0,
            mortality_rate_today / 5.0,  # Normalized mortality rate
            mortality_rate_7d_avg / 5.0,
            (mortality_rate_today / (mortality_rate_7d_avg + 0.001))  # Spike ratio
        ]
        
        return np.array(features).reshape(1, -1)
    
    def train_ml_model(self, training_data: List[Dict]) -> Dict:
        """
        Train logistic regression model on historical mortality data.
        
        Args:
            training_data: List of historical mortality records with known patterns
                
        Returns:
            Training metrics dictionary
        """
        logger.info("Training mortality pattern detection ML model")
        
        # Prepare training data
        X = []
        y = []
        
        for record in training_data:
            features = self.prepare_ml_features(record)
            X.append(features[0])
            y.append(record.get('pattern_label', 'unknown'))
        
        X = np.array(X)
        
        # Map pattern labels to numeric
        pattern_mapping = {
            'doc_stress': 0,
            'ibd_pattern': 1,
            'heat_stress': 2,
            'disease_outbreak': 3,
            'normal': 4,
            'unknown': 5
        }
        
        y_numeric = np.array([pattern_mapping.get(label, 5) for label in y])
        
        # Standardize features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train logistic regression
        self.model = LogisticRegression(
            multi_class='multinomial',
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_scaled, y_numeric, cv=5, scoring='accuracy')
        
        # Fit on full dataset
        self.model.fit(X_scaled, y_numeric)
        
        self.feature_names = [
            'spike_day_norm',
            'respiratory_pct_norm',
            'digestive_pct_norm',
            'heat_stress_pct_norm',
            'unknown_pct_norm',
            'season_sin',
            'season_cos',
            'fcr_trend',
            'mortality_rate_today_norm',
            'mortality_rate_7d_avg_norm',
            'spike_ratio'
        ]
        
        self.is_trained = True
        
        metrics = {
            'training_samples': len(training_data),
            'cv_accuracy_mean': cv_scores.mean(),
            'cv_accuracy_std': cv_scores.std(),
            'feature_importance': dict(zip(self.feature_names, np.abs(self.model.coef_[0])))
        }
        
        logger.info(f"ML model trained. CV Accuracy: {cv_scores.mean():.3f}")
        
        return metrics
    
    def predict_pattern(self, mortality_data: Dict, use_ml: bool = False) -> Dict:
        """
        Predict mortality pattern using rule-based or ML approach.
        
        Args:
            mortality_data: Dictionary containing mortality information
            use_ml: Whether to use ML model (if trained) or rule-based
                
        Returns:
            Dictionary with detected pattern, confidence, and recommendations
        """
        # Try ML first if available and requested
        if use_ml and self.is_trained:
            try:
                features = self.prepare_ml_features(mortality_data)
                X_scaled = self.scaler.transform(features)
                
                # Get prediction probabilities
                probabilities = self.model.predict_proba(X_scaled)[0]
                predicted_class = np.argmax(probabilities)
                
                # Map back to pattern names
                pattern_mapping = {
                    0: 'doc_stress',
                    1: 'ibd_pattern',
                    2: 'heat_stress',
                    3: 'disease_outbreak',
                    4: 'normal',
                    5: 'unknown'
                }
                
                detected_pattern = pattern_mapping.get(predicted_class, 'unknown')
                confidence = float(probabilities[predicted_class])
                
                result = {
                    'detected_pattern': detected_pattern,
                    'confidence': confidence,
                    'reason': f'ML model prediction with {confidence:.2%} confidence',
                    'detection_method': 'ml'
                }
                
                logger.info(f"ML prediction: {detected_pattern} (confidence: {confidence:.2%})")
                return result
                
            except Exception as e:
                logger.warning(f"ML prediction failed: {e}. Falling back to rule-based.")
        
        # Fallback to rule-based detection
        result = self.apply_rule_based_detection(mortality_data)
        logger.info(f"Rule-based prediction: {result['detected_pattern']} (confidence: {result['confidence']:.2%})")
        return result
    
    def get_recommendations(self, detected_pattern: str) -> Dict:
        """
        Get Hindi and English recommendations for detected pattern.
        
        Args:
            detected_pattern: The detected mortality pattern
                
        Returns:
            Dictionary with recommendations in both languages
        """
        pattern_info = self.PATTERNS.get(detected_pattern, self.PATTERNS['unknown'])
        
        return {
            'pattern_hindi': pattern_info['hindi'],
            'pattern_english': pattern_info['english'],
            'recommendation_hindi': pattern_info['recommendation_hindi'],
            'recommendation_english': pattern_info['recommendation_english']
        }
    
    def analyze_batch(self, batch_id: str, mortality_logs: List[Dict], 
                      batch_info: Dict) -> Dict:
        """
        Analyze a complete batch for mortality patterns.
        
        Args:
            batch_id: Batch identifier
            mortality_logs: List of mortality log entries
            batch_info: Batch information (doc_placement_date, breed, etc.)
                
        Returns:
            Complete analysis with pattern detection and recommendations
        """
        logger.info(f"Analyzing mortality patterns for batch {batch_id}")
        
        if not mortality_logs:
            return {
                'batch_id': batch_id,
                'detected_pattern': 'unknown',
                'confidence': 0.0,
                'reason': 'No mortality data available',
                'detection_method': 'rule_based',
                'recommendations': self.get_recommendations('unknown')
            }
        
        # Sort logs by date
        mortality_logs = sorted(mortality_logs, key=lambda x: x['log_date'])
        
        # Calculate statistics
        doc_date = batch_info.get('doc_placement_date')
        total_deaths = sum(log['count'] for log in mortality_logs)
        doc_count = batch_info.get('doc_count', 1)
        
        # Find spike day (day with highest mortality)
        spike_day = 0
        max_daily_deaths = 0
        cause_distribution = {}
        
        for log in mortality_logs:
            day = (log['log_date'] - doc_date).days if doc_date else 0
            if log['count'] > max_daily_deaths:
                max_daily_deaths = log['count']
                spike_day = day
            
            # Aggregate cause distribution
            cause = log.get('cause', 'unknown')
            cause_distribution[cause] = cause_distribution.get(cause, 0) + log['count']
        
        # Normalize cause distribution to percentages
        total_causes = sum(cause_distribution.values())
        if total_causes > 0:
            cause_distribution = {
                k: (v / total_causes) * 100 
                for k, v in cause_distribution.items()
            }
        
        # Calculate mortality rates
        latest_log = mortality_logs[-1]
        current_day = (latest_log['log_date'] - doc_date).days if doc_date else 0
        
        # Today's mortality rate (deaths per day per 1000 birds)
        mortality_rate_today = (latest_log['count'] / doc_count) * 100 if doc_count > 0 else 0
        
        # 7-day average mortality rate
        recent_logs = [log for log in mortality_logs 
                      if (latest_log['log_date'] - log['log_date']).days <= 7]
        if recent_logs:
            total_recent_deaths = sum(log['count'] for log in recent_logs)
            mortality_rate_7d_avg = (total_recent_deaths / len(recent_logs) / doc_count) * 100
        else:
            mortality_rate_7d_avg = mortality_rate_today
        
        # Get season from doc_date
        season = doc_date.month if doc_date else datetime.now().month
        
        # Get FCR trend if available
        fcr_trend = batch_info.get('current_fcr', 0)
        
        # Prepare mortality data for detection
        mortality_data = {
            'spike_day': spike_day,
            'cause_distribution': cause_distribution,
            'season': season,
            'fcr_trend': fcr_trend,
            'mortality_rate_today': mortality_rate_today,
            'mortality_rate_7d_avg': mortality_rate_7d_avg
        }
        
        # Detect pattern
        detection_result = self.predict_pattern(mortality_data, use_ml=self.is_trained)
        
        # Get recommendations
        recommendations = self.get_recommendations(detection_result['detected_pattern'])
        
        # Complete analysis result
        result = {
            'batch_id': batch_id,
            'detected_pattern': detection_result['detected_pattern'],
            'confidence': detection_result['confidence'],
            'reason': detection_result['reason'],
            'detection_method': detection_result['detection_method'],
            'spike_day': spike_day,
            'cause_distribution': cause_distribution,
            'mortality_rate_today': mortality_rate_today,
            'mortality_rate_7d_avg': mortality_rate_7d_avg,
            'total_deaths': total_deaths,
            'recommendations': recommendations
        }
        
        logger.info(f"Analysis complete for batch {batch_id}: {detection_result['detected_pattern']}")
        
        return result


def test_rule_based_patterns():
    """
    Test function for rule-based pattern detection.
    Validates all 4 rule-based patterns with representative data.
    """
    detector = MortalityPatternDetector()
    
    test_cases = [
        {
            'name': 'DOC Stress Pattern (Day 7)',
            'data': {
                'spike_day': 7,
                'cause_distribution': {'unknown': 100},
                'season': 3,
                'mortality_rate_today': 0.8,
                'mortality_rate_7d_avg': 0.2
            },
            'expected_pattern': 'doc_stress'
        },
        {
            'name': 'IBD Pattern (Day 18, respiratory)',
            'data': {
                'spike_day': 18,
                'cause_distribution': {'respiratory': 60, 'digestive': 20, 'unknown': 20},
                'season': 8,
                'mortality_rate_today': 1.2,
                'mortality_rate_7d_avg': 0.4
            },
            'expected_pattern': 'ibd_pattern'
        },
        {
            'name': 'Heat Stress Pattern (May)',
            'data': {
                'spike_day': 30,
                'cause_distribution': {'heat_stress': 70, 'unknown': 30},
                'season': 5,
                'mortality_rate_today': 0.9,
                'mortality_rate_7d_avg': 0.3
            },
            'expected_pattern': 'heat_stress'
        },
        {
            'name': 'Disease Outbreak (Sudden spike)',
            'data': {
                'spike_day': 12,
                'cause_distribution': {'respiratory': 40, 'digestive': 30, 'unknown': 30},
                'season': 9,
                'mortality_rate_today': 1.5,
                'mortality_rate_7d_avg': 0.3
            },
            'expected_pattern': 'disease_outbreak'
        },
        {
            'name': 'Normal Mortality',
            'data': {
                'spike_day': 25,
                'cause_distribution': {'unknown': 100},
                'season': 10,
                'mortality_rate_today': 0.2,
                'mortality_rate_7d_avg': 0.25
            },
            'expected_pattern': 'normal'
        }
    ]
    
    print("\n" + "="*60)
    print("Testing Rule-Based Pattern Detection")
    print("="*60 + "\n")
    
    all_passed = True
    for test_case in test_cases:
        result = detector.apply_rule_based_detection(test_case['data'])
        passed = result['detected_pattern'] == test_case['expected_pattern']
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_case['name']}")
        print(f"  Expected: {test_case['expected_pattern']}")
        print(f"  Detected: {result['detected_pattern']}")
        print(f"  Confidence: {result['confidence']:.2%}")
        print(f"  Reason: {result['reason']}")
        print()
        
        if not passed:
            all_passed = False
    
    print("="*60)
    if all_passed:
        print("All tests passed! ✅")
    else:
        print("Some tests failed! ❌")
    print("="*60 + "\n")
    
    return all_passed


if __name__ == '__main__':
    # Run tests
    test_rule_based_patterns()
    
    # Example usage
    print("Mortality Pattern Detector Module")
    print("This module provides rule-based and ML-based mortality pattern detection")
    print("Use analyze_batch() to detect patterns in batch mortality data")
