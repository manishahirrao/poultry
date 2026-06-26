"""
PoultryPulse AI — Layer Yield Forecaster
File: ml/layer_yield_forecaster.py
Version: v1.0 | May 2026
Task Reference: TASK-051 - Layer Farm Profile & Egg Production Dashboard
Requirements Reference: REQ-022 §22.4

Description:
Polynomial regression model for 30-day HDP (Hen-Day Production) forecasting
with confidence bands for layer farms. Uses breed-specific production curves
and historical production data to generate accurate yield forecasts.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
from scipy import stats
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger()


class LayerYieldForecaster:
    """
    Polynomial regression model for HDP forecasting with confidence bands.
    
    Uses breed-specific production curves and historical data to generate
    30-day HDP forecasts with 80% confidence intervals.
    """
    
    def __init__(self, breed: str = 'Lohmann Brown'):
        """
        Initialize the forecaster for a specific breed.
        
        Args:
            breed: Layer breed name (e.g., 'Lohmann Brown', 'HH-260', 'BV-300')
        """
        self.breed = breed
        self.model = None
        self.poly_features = None
        self.breed_standards = self._load_breed_standards()
        
        logger.info(
            'layer_yield_forecaster_initialized',
            breed=breed,
            peak_age_weeks=self.breed_standards.get('target_peak_age_weeks'),
            peak_hdp=self.breed_standards.get('target_peak_hdp_percentage')
        )
    
    def _load_breed_standards(self) -> Dict:
        """Load breed-specific production standards from JSON."""
        try:
            with open('apps/web/lib/data/layerBreedStandards.json', 'r') as f:
                data = json.load(f)
            
            for breed_data in data['breeds']:
                if breed_data['name'] == self.breed:
                    return breed_data
            
            # Default to Lohmann Brown if breed not found
            logger.warning(
                'breed_not_found_using_default',
                requested_breed=self.breed,
                default_breed='Lohmann Brown'
            )
            return data['breeds'][0]
            
        except Exception as e:
            logger.error('breed_standards_load_failed', error=str(e))
            # Return default standards
            return {
                'name': 'Lohmann Brown',
                'target_peak_age_weeks': 28,
                'target_peak_hdp_percentage': 96,
                'production_duration_weeks': 74,
                'target_egg_weight_g': 63,
                'hdp_curve': {
                    'week_20': 85, 'week_24': 92, 'week_28': 96, 'week_32': 94,
                    'week_40': 90, 'week_48': 86, 'week_56': 82, 'week_64': 78, 'week_72': 74
                }
            }
    
    def prepare_features(self, weeks: np.ndarray) -> np.ndarray:
        """
        Prepare polynomial features for regression.
        
        Args:
            weeks: Array of week numbers (e.g., [20, 21, 22, ...])
            
        Returns:
            Polynomial features array
        """
        # Use degree 3 polynomial to capture the production curve shape
        poly = PolynomialFeatures(degree=3, include_bias=False)
        return poly.fit_transform(weeks.reshape(-1, 1))
    
    def train(self, historical_data: pd.DataFrame):
        """
        Train the polynomial regression model on historical production data.
        
        Args:
            historical_data: DataFrame with columns ['week', 'hdp_percentage']
        """
        if len(historical_data) < 10:
            logger.warning(
                'insufficient_training_data',
                data_points=len(historical_data),
                minimum_required=10
            )
            # Fall back to breed standard curve
            self._use_breed_standard_as_model()
            return
        
        X = historical_data['week'].values.reshape(-1, 1)
        y = historical_data['hdp_percentage'].values
        
        # Create polynomial regression pipeline
        self.poly_features = PolynomialFeatures(degree=3, include_bias=False)
        self.model = Pipeline([
            ('poly', self.poly_features),
            ('linear', LinearRegression())
        ])
        
        # Train model
        self.model.fit(X, y)
        
        # Calculate cross-validation score
        cv_scores = cross_val_score(self.model, X, y, cv=5, scoring='neg_mean_squared_error')
        avg_mse = -cv_scores.mean()
        
        logger.info(
            'layer_yield_model_trained',
            breed=self.breed,
            training_samples=len(historical_data),
            avg_mse=avg_mse,
            cv_scores=cv_scores.tolist()
        )
    
    def _use_breed_standard_as_model(self):
        """Use breed standard curve as fallback when insufficient data."""
        logger.info('using_breed_standard_as_fallback', breed=self.breed)
        # Model will use breed standard curve directly in predict method
        self.model = None
    
    def predict(self, start_week: int, forecast_days: int = 30) -> Dict:
        """
        Generate 30-day HDP forecast with confidence bands.
        
        Args:
            start_week: Current flock age in weeks
            forecast_days: Number of days to forecast (default 30)
            
        Returns:
            Dictionary with forecast data including:
            - dates: List of forecast dates
            - weeks: List of week numbers
            - predicted_hdp: Predicted HDP percentages
            - lower_bound: 80% confidence interval lower bound
            - upper_bound: 80% confidence interval upper bound
            - breed_standard: Breed standard HDP for comparison
        """
        forecast_weeks = np.arange(start_week, start_week + forecast_days / 7, 1/7)
        
        if self.model is not None:
            # Use trained model for prediction
            X = forecast_weeks.reshape(-1, 1)
            predicted_hdp = self.model.predict(X)
            
            # Calculate confidence bands using residual standard error
            # For polynomial regression, we use a simplified approach
            residuals_std = 2.0  # Typical HDP standard deviation in percentage points
            z_score = 1.28  # 80% confidence interval
            margin = z_score * residuals_std
            
            lower_bound = predicted_hdp - margin
            upper_bound = predicted_hdp + margin
        else:
            # Use breed standard curve
            predicted_hdp = np.array([self._get_breed_standard_hdp(w) for w in forecast_weeks])
            margin = 3.0  # Wider margin for breed standard
            lower_bound = predicted_hdp - margin
            upper_bound = predicted_hdp + margin
        
        # Get breed standard for comparison
        breed_standard = np.array([self._get_breed_standard_hdp(w) for w in forecast_weeks])
        
        # Generate dates
        start_date = datetime.now()
        dates = [start_date + timedelta(days=i) for i in range(forecast_days)]
        
        forecast = {
            'breed': self.breed,
            'start_week': start_week,
            'forecast_days': forecast_days,
            'dates': [d.strftime('%Y-%m-%d') for d in dates],
            'weeks': forecast_weeks.tolist(),
            'predicted_hdp': predicted_hdp.tolist(),
            'lower_bound': np.clip(lower_bound, 0, 100).tolist(),
            'upper_bound': np.clip(upper_bound, 0, 100).tolist(),
            'breed_standard': breed_standard.tolist(),
            'confidence_level': 0.80,
            'generated_at': datetime.now().isoformat()
        }
        
        logger.info(
            'hdp_forecast_generated',
            breed=self.breed,
            start_week=start_week,
            forecast_days=forecast_days,
            avg_predicted_hdp=np.mean(predicted_hdp)
        )
        
        return forecast
    
    def _get_breed_standard_hdp(self, week: float) -> float:
        """
        Get breed standard HDP for a given week using interpolation.
        
        Args:
            week: Flock age in weeks (can be fractional)
            
        Returns:
            HDP percentage according to breed standard curve
        """
        hdp_curve = self.breed_standards.get('hdp_curve', {})
        
        # Extract week keys and values
        week_keys = sorted([int(k.replace('week_', '')) for k in hdp_curve.keys()])
        hdp_values = [hdp_curve[f'week_{w}'] for w in week_keys]
        
        # Interpolate for fractional weeks
        if week <= week_keys[0]:
            return hdp_values[0]
        elif week >= week_keys[-1]:
            return hdp_values[-1]
        else:
            # Linear interpolation
            for i in range(len(week_keys) - 1):
                if week_keys[i] <= week <= week_keys[i + 1]:
                    t = (week - week_keys[i]) / (week_keys[i + 1] - week_keys[i])
                    return hdp_values[i] + t * (hdp_values[i + 1] - hdp_values[i])
            
            return hdp_values[-1]
    
    def evaluate_forecast_accuracy(self, actual_data: pd.DataFrame, forecast: Dict) -> Dict:
        """
        Evaluate forecast accuracy against actual production data.
        
        Args:
            actual_data: DataFrame with columns ['date', 'hdp_percentage']
            forecast: Forecast dictionary from predict() method
            
        Returns:
            Dictionary with accuracy metrics (MAE, MAPE, RMSE)
        """
        # Align actual data with forecast dates
        forecast_dates = set(forecast['dates'])
        aligned_data = actual_data[actual_data['date'].isin(forecast_dates)]
        
        if len(aligned_data) == 0:
            logger.warning('no_matching_data_for_evaluation')
            return {'error': 'No matching data for evaluation'}
        
        # Calculate metrics
        actual_hdp = aligned_data['hdp_percentage'].values
        predicted_hdp = np.array([forecast['predicted_hdp'][forecast['dates'].index(d)] 
                                   for d in aligned_data['date']])
        
        mae = np.mean(np.abs(actual_hdp - predicted_hdp))
        mape = np.mean(np.abs((actual_hdp - predicted_hdp) / actual_hdp)) * 100
        rmse = np.sqrt(np.mean((actual_hdp - predicted_hdp) ** 2))
        
        metrics = {
            'mae': mae,
            'mape': mape,
            'rmse': rmse,
            'sample_size': len(aligned_data)
        }
        
        logger.info(
            'forecast_accuracy_evaluated',
            breed=self.breed,
            mae=mae,
            mape=mape,
            rmse=rmse,
            sample_size=len(aligned_data)
        )
        
        return metrics


def generate_sample_training_data(breed: str = 'Lohmann Brown', weeks: int = 30) -> pd.DataFrame:
    """
    Generate sample training data for testing the forecaster.
    
    Args:
        breed: Layer breed name
        weeks: Number of weeks of data to generate
        
    Returns:
        DataFrame with sample production data
    """
    forecaster = LayerYieldForecaster(breed)
    
    # Generate data based on breed standard with some noise
    data = []
    for week in range(18, 18 + weeks):
        standard_hdp = forecaster._get_breed_standard_hdp(week)
        # Add realistic noise (±3%)
        noise = np.random.normal(0, 1.5)
        actual_hdp = np.clip(standard_hdp + noise, 0, 100)
        data.append({'week': week, 'hdp_percentage': actual_hdp})
    
    return pd.DataFrame(data)


# Example usage and testing
if __name__ == '__main__':
    logger.info('layer_yield_forecaster_test_start')
    
    # Test with Lohmann Brown
    forecaster = LayerYieldForecaster('Lohmann Brown')
    
    # Generate sample training data
    training_data = generate_sample_training_data('Lohmann Brown', weeks=30)
    logger.info('sample_training_data_generated', rows=len(training_data))
    
    # Train model
    forecaster.train(training_data)
    
    # Generate 30-day forecast
    forecast = forecaster.predict(start_week=25, forecast_days=30)
    logger.info(
        'forecast_test_complete',
        forecast_weeks=len(forecast['weeks']),
        avg_hdp=np.mean(forecast['predicted_hdp'])
    )
    
    # Print sample forecast
    print(f"\n30-Day HDP Forecast for {forecaster.breed}:")
    print(f"Start Week: {forecast['start_week']}")
    print(f"Average Predicted HDP: {np.mean(forecast['predicted_hdp']):.1f}%")
    print(f"Confidence Level: {forecast['confidence_level']*100}%")
    print(f"\nFirst 7 days:")
    for i in range(7):
        print(f"  Day {i+1} (Week {forecast['weeks'][i]:.1f}): {forecast['predicted_hdp'][i]:.1f}% "
              f"[{forecast['lower_bound'][i]:.1f} - {forecast['upper_bound'][i]:.1f}]")
    
    logger.info('layer_yield_forecaster_test_complete')
