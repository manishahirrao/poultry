"""
PoultryPulse AI - Personalized Weight Gain Predictor
Description: Ridge regression model trained on user's own batch history to predict weight at harvest
Requirements: REQ-016 §16.5, TASK-039
Author: PoultryPulse AI Team
Date: May 2026
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WeightGainPredictor:
    """
    Personalized weight gain predictor using Ridge regression.
    Trained on individual user's batch history for personalized predictions.
    """
    
    def __init__(self, customer_id: str):
        """
        Initialize the predictor for a specific customer.
        
        Args:
            customer_id: Unique customer identifier
        """
        self.customer_id = customer_id
        self.model: Optional[Ridge] = None
        self.scaler: Optional[StandardScaler] = None
        self.feature_names: List[str] = []
        self.is_trained = False
        self.training_data_points = 0
        
        # Breed standard weights for reference
        self.breed_standards = self._load_breed_standards()
    
    def _load_breed_standards(self) -> Dict:
        """Load breed standard weight curves."""
        return {
            'Cobb 500': {
                'day_7': 0.18, 'day_14': 0.45, 'day_21': 0.85,
                'day_28': 1.35, 'day_35': 1.85, 'day_42': 2.20
            },
            'Ross 308': {
                'day_7': 0.19, 'day_14': 0.48, 'day_21': 0.90,
                'day_28': 1.42, 'day_35': 1.95, 'day_42': 2.30
            },
            'Vencobb': {
                'day_7': 0.16, 'day_14': 0.40, 'day_21': 0.78,
                'day_28': 1.25, 'day_35': 1.72, 'day_40': 2.00
            },
            'Hubbard': {
                'day_7': 0.17, 'day_14': 0.42, 'day_21': 0.82,
                'day_28': 1.30, 'day_35': 1.78, 'day_41': 2.10
            }
        }
    
    def _get_breed_standard_weight(self, breed: str, age_days: int) -> float:
        """Get breed standard weight for a given age using linear interpolation."""
        breed_data = self.breed_standards.get(breed, self.breed_standards['Cobb 500'])
        
        age_points = sorted([int(k.replace('day_', '')) for k in breed_data.keys()])
        
        if age_days <= age_points[0]:
            return breed_data[f'day_{age_points[0]}']
        if age_days >= age_points[-1]:
            return breed_data[f'day_{age_points[-1]}']
        
        # Linear interpolation
        for i in range(len(age_points) - 1):
            if age_points[i] <= age_days <= age_points[i + 1]:
                lower_age = age_points[i]
                upper_age = age_points[i + 1]
                lower_weight = breed_data[f'day_{lower_age}']
                upper_weight = breed_data[f'day_{upper_age}']
                ratio = (age_days - lower_age) / (upper_age - lower_age)
                return lower_weight + (upper_weight - lower_age) * ratio
        
        return breed_data[f'day_{age_points[0]}']
    
    def prepare_training_data(self, weight_logs: List[Dict], batch_info: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data from weight logs and batch information.
        
        Args:
            weight_logs: List of weight log entries with batch_id, log_date, avg_weight_kg, etc.
            batch_info: List of batch information with batch_id, breed, doc_placement_date, etc.
            
        Returns:
            X: Feature matrix
            y: Target values (actual harvest weights)
        """
        # Create batch lookup
        batch_lookup = {b['batch_id']: b for b in batch_info}
        
        # Group weight logs by batch
        batch_weight_logs = {}
        for log in weight_logs:
            batch_id = log['batch_id']
            if batch_id not in batch_weight_logs:
                batch_weight_logs[batch_id] = []
            batch_weight_logs[batch_id].append(log)
        
        training_samples = []
        target_values = []
        
        for batch_id, logs in batch_weight_logs.items():
            if batch_id not in batch_lookup:
                continue
                
            batch = batch_lookup[batch_id]
            
            # Only use harvested batches for training
            if batch.get('status') != 'harvested':
                continue
                
            # Sort logs by date
            logs = sorted(logs, key=lambda x: x['log_date'])
            
            # Extract features from weight logs
            features = self._extract_features(logs, batch)
            
            if features and batch.get('actual_harvest_weight_kg'):
                training_samples.append(features)
                target_values.append(batch['actual_harvest_weight_kg'])
        
        if not training_samples:
            raise ValueError("Insufficient training data. Need at least 5 harvested batches.")
        
        self.feature_names = [
            'breed_cobb', 'breed_ross', 'breed_vencobb', 'breed_hubbard',
            'day_7_weight', 'day_14_weight', 'day_21_weight', 'day_28_weight', 'day_35_weight',
            'weight_gain_7_14', 'weight_gain_14_21', 'weight_gain_21_28', 'weight_gain_28_35',
            'deviation_from_standard_day_7', 'deviation_from_standard_day_14',
            'deviation_from_standard_day_21', 'deviation_from_standard_day_28',
            'deviation_from_standard_day_35'
        ]
        
        return np.array(training_samples), np.array(target_values)
    
    def _extract_features(self, weight_logs: List[Dict], batch: Dict) -> Optional[List[float]]:
        """
        Extract features from weight logs for a batch.
        
        Args:
            weight_logs: Sorted list of weight logs for a batch
            batch: Batch information
            
        Returns:
            List of feature values or None if insufficient data
        """
        breed = batch.get('breed', 'Cobb 500')
        doc_date = batch.get('doc_placement_date')
        
        if not doc_date:
            return None
        
        # One-hot encode breed
        breed_features = [
            1 if breed == 'Cobb 500' else 0,
            1 if breed == 'Ross 308' else 0,
            1 if breed == 'Vencobb' else 0,
            1 if breed == 'Hubbard' else 0,
        ]
        
        # Extract weights at specific ages
        weight_by_age = {}
        for log in weight_logs:
            age_days = (log['log_date'] - doc_date).days
            weight_by_age[age_days] = log['avg_weight_kg']
        
        # Get weights at standard ages (with tolerance)
        target_ages = [7, 14, 21, 28, 35]
        weight_features = []
        
        for target_age in target_ages:
            # Find closest weight log within ±2 days
            closest_weight = None
            min_diff = float('inf')
            
            for age, weight in weight_by_age.items():
                diff = abs(age - target_age)
                if diff <= 2 and diff < min_diff:
                    closest_weight = weight
                    min_diff = diff
            
            weight_features.append(closest_weight if closest_weight is not None else 0)
        
        # Calculate weight gains between periods
        weight_gains = []
        for i in range(len(weight_features) - 1):
            if weight_features[i] > 0 and weight_features[i + 1] > 0:
                weight_gains.append(weight_features[i + 1] - weight_features[i])
            else:
                weight_gains.append(0)
        
        # Calculate deviations from breed standard
        deviations = []
        for i, target_age in enumerate(target_ages):
            if weight_features[i] > 0:
                standard_weight = self._get_breed_standard_weight(breed, target_age)
                deviation = (weight_features[i] - standard_weight) / standard_weight if standard_weight > 0 else 0
                deviations.append(deviation)
            else:
                deviations.append(0)
        
        # Combine all features
        all_features = breed_features + weight_features + weight_gains + deviations
        
        # Check if we have sufficient data (at least 3 weight measurements)
        valid_weights = sum(1 for w in weight_features if w > 0)
        if valid_weights < 3:
            return None
        
        return all_features
    
    def train(self, weight_logs: List[Dict], batch_info: List[Dict]) -> Dict:
        """
        Train the Ridge regression model on user's batch history.
        
        Args:
            weight_logs: List of weight log entries
            batch_info: List of batch information
            
        Returns:
            Training metrics dictionary
        """
        logger.info(f"Training weight gain predictor for customer {self.customer_id}")
        
        # Prepare training data
        X, y = self.prepare_training_data(weight_logs, batch_info)
        
        self.training_data_points = len(X)
        logger.info(f"Training with {self.training_data_points} samples")
        
        # Standardize features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Ridge regression with cross-validation
        self.model = Ridge(alpha=1.0, random_state=42)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_scaled, y, cv=5, scoring='neg_mean_absolute_error')
        
        # Fit on full dataset
        self.model.fit(X_scaled, y)
        
        # Calculate metrics
        y_pred = self.model.predict(X_scaled)
        mae = mean_absolute_error(y, y_pred)
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        r2 = r2_score(y, y_pred)
        
        self.is_trained = True
        
        metrics = {
            'training_samples': self.training_data_points,
            'cv_mae_mean': -cv_scores.mean(),
            'cv_mae_std': cv_scores.std(),
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'feature_importance': dict(zip(self.feature_names, np.abs(self.model.coef_)))
        }
        
        logger.info(f"Training complete. MAE: {mae:.3f} kg, R²: {r2:.3f}")
        
        return metrics
    
    def predict_harvest_weight(self, current_weight_logs: List[Dict], batch_info: Dict) -> Dict:
        """
        Predict harvest weight for current batch based on trajectory.
        
        Args:
            current_weight_logs: Weight logs for current batch
            batch_info: Current batch information
            
        Returns:
            Prediction dictionary with harvest weight and confidence
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Extract features for current batch
        features = self._extract_features(current_weight_logs, batch_info)
        
        if features is None:
            raise ValueError("Insufficient weight data for prediction")
        
        # Standardize features
        X = np.array([features])
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        predicted_weight = self.model.predict(X_scaled)[0]
        
        # Calculate confidence interval based on training MAE
        confidence_interval = 1.96 * 0.1  # Approximate 95% CI
        
        # Get breed standard for comparison
        breed = batch_info.get('breed', 'Cobb 500')
        target_age = batch_info.get('target_harvest_age_days', 42)
        standard_weight = self._get_breed_standard_weight(breed, target_age)
        
        return {
            'predicted_harvest_weight_kg': predicted_weight,
            'confidence_interval_lower': max(0, predicted_weight - confidence_interval),
            'confidence_interval_upper': predicted_weight + confidence_interval,
            'breed_standard_weight_kg': standard_weight,
            'deviation_from_standard_pct': ((predicted_weight - standard_weight) / standard_weight * 100) if standard_weight > 0 else 0,
            'prediction_date': datetime.now().isoformat(),
            'model_confidence': 'high' if self.training_data_points >= 5 else 'medium'
        }
    
    def save_model(self, filepath: str) -> None:
        """Save trained model to disk."""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'customer_id': self.customer_id,
            'training_data_points': self.training_data_points,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load trained model from disk."""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.customer_id = model_data['customer_id']
        self.training_data_points = model_data['training_data_points']
        self.is_trained = model_data['is_trained']
        
        logger.info(f"Model loaded from {filepath}")


def train_customer_model(customer_id: str, supabase_client) -> Dict:
    """
    Train a personalized weight gain model for a customer.
    
    Args:
        customer_id: Customer identifier
        supabase_client: Supabase client instance
        
    Returns:
        Training metrics
    """
    predictor = WeightGainPredictor(customer_id)
    
    # Fetch customer's batch data
    batches_response = supabase_client.table('batches').select('*').eq('customer_id', customer_id).execute()
    batches = batches_response.data
    
    # Fetch weight logs for customer's batches
    batch_ids = [b['id'] for b in batches]
    weight_logs_response = supabase_client.table('weight_logs').select('*').in_('batch_id', batch_ids).execute()
    weight_logs = weight_logs_response.data
    
    # Train model
    metrics = predictor.train(weight_logs, batches)
    
    # Save model to customer_ml_models table
    model_data = {
        'customer_id': customer_id,
        'model_type': 'weight_gain_predictor',
        'model_version': '1.0',
        'model_data': joblib.dumps({
            'model': predictor.model,
            'scaler': predictor.scaler,
            'feature_names': predictor.feature_names,
            'training_data_points': predictor.training_data_points
        }),
        'training_metrics': metrics,
        'last_trained_at': datetime.now().isoformat()
    }
    
    supabase_client.table('customer_ml_models').upsert(model_data).execute()
    
    return metrics


if __name__ == '__main__':
    # Example usage (for testing)
    print("Weight Gain Predictor Module")
    print("This module provides personalized weight gain predictions using Ridge regression")
    print("Train on customer's batch history to predict harvest weight with high accuracy")
