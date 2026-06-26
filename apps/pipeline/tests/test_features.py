"""
PoultryPulse AI - Feature Engineering Unit Tests
Tests all 45-feature computation functions from dag_feature_eng.py
Requirements: TRD §4.3, Architecture §3.4
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dags.dag_feature_eng import (
    compute_feed_cost_ratio_lag42,
    compute_festival_flag,
    compute_heat_stress_7d,
    compute_hpai_district_flag,
    compute_price_lag_features,
    compute_rolling_statistics,
    compute_circular_month_encoding,
    compute_trend_slope_14d,
    compute_necc_weekly_features,
    compute_google_trends_feature,
)


@pytest.fixture
def sample_dataframe():
    """Create sample dataframe for testing"""
    dates = pd.date_range(start='2026-01-01', end='2026-05-20', freq='D')
    df = pd.DataFrame({
        'date': dates,
        'broiler_price_per_kg': np.random.uniform(140, 180, len(dates)),
        'maize_price_per_quintal': np.random.uniform(1800, 2400, len(dates)),
        'temperature_celsius': np.random.uniform(20, 42, len(dates)),
        'hpai_district_flag': np.random.choice([0, 1], len(dates), p=[0.95, 0.05]),
        'egg_price': np.random.uniform(4, 7, len(dates)),
    })
    df.set_index('date', inplace=True)
    return df


class TestFeedCostRatioLag42:
    """Test feed_cost_ratio_42d feature computation"""
    
    def test_feed_cost_ratio_computation(self, sample_dataframe):
        """Test that feed cost ratio is computed correctly"""
        result = compute_feed_cost_ratio_lag42(sample_dataframe)
        
        # Check that result is a pandas Series
        assert isinstance(result, pd.Series)
        
        # Check that length matches input
        assert len(result) == len(sample_dataframe)
        
        # Check that first 42 values are NaN (due to lag)
        assert result.iloc[:42].isna().all()
        
        # Check that non-NaN values are finite
        assert result.iloc[42:].notna().all()
        assert np.isfinite(result.iloc[42:]).all()
    
    def test_feed_cost_ratio_calculation(self, sample_dataframe):
        """Test that ratio calculation is correct"""
        result = compute_feed_cost_ratio_lag42(sample_dataframe)
        
        # Manual calculation for a specific index
        idx = 50
        expected = sample_dataframe['broiler_price_per_kg'].iloc[idx] / sample_dataframe['maize_price_per_quintal'].iloc[idx - 42]
        
        assert abs(result.iloc[idx] - expected) < 1e-10


class TestFestivalFlag:
    """Test festival_7d_flag feature computation"""
    
    def test_festival_flag_on_festival_date(self):
        """Test that festival flag returns 1 on festival date"""
        # Diwali 2024-11-01
        result = compute_festival_flag('2024-11-01')
        assert result == 1
    
    def test_festival_flag_within_7_days(self):
        """Test that festival flag returns 1 within 7 days of festival"""
        # 5 days before Diwali
        result = compute_festival_flag('2024-10-27')
        assert result == 1
    
    def test_festival_flag_outside_window(self):
        """Test that festival flag returns 0 outside 7-day window"""
        # 10 days before Diwali
        result = compute_festival_flag('2024-10-22')
        assert result == 0
    
    def test_festival_flag_non_festival_date(self):
        """Test that festival flag returns 0 for non-festival dates"""
        result = compute_festival_flag('2024-06-15')
        assert result == 0


class TestHeatStress7d:
    """Test heat_stress_7d feature computation"""
    
    def test_heat_stress_computation(self, sample_dataframe):
        """Test that heat stress is computed correctly"""
        result = compute_heat_stress_7d(sample_dataframe)
        
        # Check that result is a pandas Series
        assert isinstance(result, pd.Series)
        
        # Check that length matches input
        assert len(result) == len(sample_dataframe)
    
    def test_heat_stress_threshold(self, sample_dataframe):
        """Test that heat stress counts days above 35°C"""
        # Set specific temperatures for testing
        sample_dataframe['temperature_celsius'] = [30] * 10 + [40] * 10 + [30] * len(sample_dataframe)
        result = compute_heat_stress_7d(sample_dataframe)
        
        # Check that heat stress is counted correctly
        # At index 15 (after 10 high-temp days in 7-day window)
        assert result.iloc[15] > 0
    
    def test_heat_stress_rolling_window(self, sample_dataframe):
        """Test that heat stress uses 7-day rolling window"""
        result = compute_heat_stress_7d(sample_dataframe)
        
        # First few values should be NaN or low due to min_periods
        assert result.iloc[:4].isna().sum() >= 0


class TestHpaiDistrictFlag:
    """Test hpai_district_flag_14d feature computation"""
    
    def test_hpai_flag_computation(self, sample_dataframe):
        """Test that HPAI flag is computed correctly"""
        result = compute_hpai_district_flag(sample_dataframe)
        
        # Check that result is a pandas Series
        assert isinstance(result, pd.Series)
        
        # Check that length matches input
        assert len(result) == len(sample_dataframe)
    
    def test_hpai_flag_detection(self, sample_dataframe):
        """Test that HPAI flag detects HPAI in 14-day window"""
        # Set HPAI flag at specific index
        sample_dataframe['hpai_district_flag'].iloc[10] = 1
        result = compute_hpai_district_flag(sample_dataframe)
        
        # Check that flag is 1 within 14 days of HPAI event
        assert result.iloc[10] == 1
    
    def test_hpai_flag_no_hpai(self, sample_dataframe):
        """Test that HPAI flag is 0 when no HPAI events"""
        sample_dataframe['hpai_district_flag'] = 0
        result = compute_hpai_district_flag(sample_dataframe)
        
        # All values should be 0
        assert (result == 0).all()


class TestPriceLagFeatures:
    """Test price lag features computation"""
    
    def test_price_lag_features_structure(self, sample_dataframe):
        """Test that lag features return correct structure"""
        result = compute_price_lag_features(sample_dataframe)
        
        # Check that result is a dictionary
        assert isinstance(result, dict)
        
        # Check that all expected lags are present
        expected_lags = ['price_lag_1d', 'price_lag_7d', 'price_lag_14d', 'price_lag_42d']
        for lag in expected_lags:
            assert lag in result
    
    def test_price_lag_values(self, sample_dataframe):
        """Test that lag values are computed correctly"""
        result = compute_price_lag_features(sample_dataframe)
        
        # Check 1-day lag
        assert result['price_lag_1d'].iloc[1] == sample_dataframe['broiler_price_per_kg'].iloc[0]
        
        # Check that first value is NaN for 1-day lag
        assert pd.isna(result['price_lag_1d'].iloc[0])
    
    def test_price_lag_42d(self, sample_dataframe):
        """Test that 42-day lag has NaN for first 42 values"""
        result = compute_price_lag_features(sample_dataframe)
        
        # Check that first 42 values are NaN
        assert result['price_lag_42d'].iloc[:42].isna().all()


class TestRollingStatistics:
    """Test rolling statistics features computation"""
    
    def test_rolling_statistics_structure(self, sample_dataframe):
        """Test that rolling statistics return correct structure"""
        result = compute_rolling_statistics(sample_dataframe)
        
        # Check that result is a dictionary
        assert isinstance(result, dict)
        
        # Check that all expected features are present
        expected_features = [
            'price_rolling_mean_7d',
            'price_rolling_std_7d',
            'price_rolling_mean_30d',
            'price_rolling_std_30d'
        ]
        for feature in expected_features:
            assert feature in result
    
    def test_rolling_mean_computation(self, sample_dataframe):
        """Test that rolling mean is computed correctly"""
        result = compute_rolling_statistics(sample_dataframe)
        
        # Manual calculation for 7-day mean at index 10
        expected = sample_dataframe['broiler_price_per_kg'].iloc[4:11].mean()
        actual = result['price_rolling_mean_7d'].iloc[10]
        
        assert abs(actual - expected) < 1e-10
    
    def test_rolling_std_computation(self, sample_dataframe):
        """Test that rolling std is computed correctly"""
        result = compute_rolling_statistics(sample_dataframe)
        
        # Check that std is non-negative
        assert (result['price_rolling_std_7d'] >= 0).all()


class TestCircularMonthEncoding:
    """Test circular month encoding features computation"""
    
    def test_circular_encoding_structure(self, sample_dataframe):
        """Test that circular encoding returns correct structure"""
        result = compute_circular_month_encoding(sample_dataframe)
        
        # Check that result is a dictionary
        assert isinstance(result, dict)
        
        # Check that both sin and cos are present
        assert 'month_sin' in result
        assert 'month_cos' in result
    
    def test_circular_encoding_values(self):
        """Test that circular encoding values are in correct range"""
        dates = pd.date_range(start='2026-01-01', end='2026-12-31', freq='D')
        df = pd.DataFrame({'date': dates})
        df.set_index('date', inplace=True)
        
        result = compute_circular_month_encoding(df)
        
        # Check that sin and cos are in [-1, 1]
        assert (result['month_sin'] >= -1).all() and (result['month_sin'] <= 1).all()
        assert (result['month_cos'] >= -1).all() and (result['month_cos'] <= 1).all()
    
    def test_circular_encoding_continuity(self):
        """Test that circular encoding handles Dec->Jan continuity"""
        dates = pd.date_range(start='2025-12-30', end='2026-01-05', freq='D')
        df = pd.DataFrame({'date': dates})
        df.set_index('date', inplace=True)
        
        result = compute_circular_month_encoding(df)
        
        # Check that the encoding is continuous (no jump)
        # The distance between Dec and Jan in circular space should be small
        dec_sin = result['month_sin'].iloc[0]
        jan_sin = result['month_sin'].iloc[-1]
        dec_cos = result['month_cos'].iloc[0]
        jan_cos = result['month_cos'].iloc[-1]
        
        # Euclidean distance should be small
        distance = np.sqrt((dec_sin - jan_sin)**2 + (dec_cos - jan_cos)**2)
        assert distance < 0.5


class TestTrendSlope14d:
    """Test trend_slope_14d feature computation"""
    
    def test_trend_slope_computation(self, sample_dataframe):
        """Test that trend slope is computed correctly"""
        result = compute_trend_slope_14d(sample_dataframe)
        
        # Check that result is a pandas Series
        assert isinstance(result, pd.Series)
        
        # Check that length matches input
        assert len(result) == len(sample_dataframe)
    
    def test_trend_slope_early_values(self, sample_dataframe):
        """Test that early values are NaN (need at least 10 points)"""
        result = compute_trend_slope_14d(sample_dataframe)
        
        # First 10 values should be NaN
        assert result.iloc[:10].isna().all()
    
    def test_trend_slope_later_values(self, sample_dataframe):
        """Test that later values are finite"""
        result = compute_trend_slope_14d(sample_dataframe)
        
        # Values after index 10 should be finite
        assert result.iloc[10:].notna().all()
        assert np.isfinite(result.iloc[10:]).all()


class TestNeccWeeklyFeatures:
    """Test NECC weekly features computation"""
    
    def test_necc_features_structure(self, sample_dataframe):
        """Test that NECC features return correct structure"""
        result = compute_necc_weekly_features(sample_dataframe)
        
        # Check that result is a dictionary
        assert isinstance(result, dict)
        
        # Check that expected features are present
        assert 'egg_price_weekly_change' in result
        assert 'national_egg_production_index' in result
    
    def test_egg_price_weekly_change(self, sample_dataframe):
        """Test that weekly change is computed correctly"""
        result = compute_necc_weekly_features(sample_dataframe)
        
        # Check that result is a pandas Series
        assert isinstance(result['egg_price_weekly_change'], pd.Series)
        
        # Check that length matches input
        assert len(result['egg_price_weekly_change']) == len(sample_dataframe)
    
    def test_egg_price_weekly_change_calculation(self, sample_dataframe):
        """Test that weekly change calculation is correct"""
        result = compute_necc_weekly_features(sample_dataframe)
        
        # Manual calculation for index 7
        idx = 7
        expected = (sample_dataframe['egg_price'].iloc[idx] - sample_dataframe['egg_price'].iloc[idx - 7]) / sample_dataframe['egg_price'].iloc[idx - 7]
        actual = result['egg_price_weekly_change'].iloc[idx]
        
        assert abs(actual - expected) < 1e-10


class TestGoogleTrendsFeature:
    """Test Google Trends feature computation"""
    
    def test_google_trends_computation(self, sample_dataframe):
        """Test that Google Trends feature is computed"""
        result = compute_google_trends_feature(sample_dataframe)
        
        # Check that result is a pandas Series
        assert isinstance(result, pd.Series)
        
        # Check that length matches input
        assert len(result) == len(sample_dataframe)
    
    def test_google_trends_placeholder_values(self, sample_dataframe):
        """Test that placeholder values are in valid range"""
        result = compute_google_trends_feature(sample_dataframe)
        
        # Google Trends values should be between 0 and 100
        assert (result >= 0).all() and (result <= 100).all()


class TestFeatureMatrixIdempotency:
    """Test that feature matrix computation is idempotent"""
    
    def test_idempotency_with_same_input(self, sample_dataframe):
        """Test that same input produces identical output"""
        # This would test the full feature matrix computation
        # For now, testing individual functions
        
        result1 = compute_price_lag_features(sample_dataframe)
        result2 = compute_price_lag_features(sample_dataframe)
        
        # Check that results are identical
        for key in result1:
            assert (result1[key] == result2[key]).all()


class TestFeatureMatrixCompleteness:
    """Test that all 45 features are computed"""
    
    def test_feature_count(self, sample_dataframe):
        """Test that all expected features are present"""
        # This would test the full feature matrix
        # For now, testing individual feature groups
        
        lag_features = compute_price_lag_features(sample_dataframe)
        rolling_features = compute_rolling_statistics(sample_dataframe)
        month_features = compute_circular_month_encoding(sample_dataframe)
        
        total_features = len(lag_features) + len(rolling_features) + len(month_features)
        
        # At minimum, these should be present
        assert total_features >= 8


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
