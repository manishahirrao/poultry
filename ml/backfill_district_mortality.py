"""
PoultryPulse AI - District Mortality Backfill Script
File: ml/backfill_district_mortality.py
Version: v1.0 | May 2026
Task Reference: TASK-041
Requirements Reference: REQ-024 §24.1–24.2

Backfill script for historical district mortality data to populate the ML feature matrix.
This script processes existing mortality_logs and generates district_supply_signals records
for historical dates to enable model retraining with the new feature.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import os
import sys
from typing import Dict, List, Optional
import psycopg2
from psycopg2.extras import execute_batch

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml.feature_engineering import FeatureEngineeringPipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DistrictMortalityBackfill:
    """
    Backfill utility for district mortality aggregation.
    
    Processes historical mortality_logs data to generate district_supply_signals
    records for dates prior to the DAG deployment.
    """
    
    def __init__(self, db_connection_string: Optional[str] = None):
        """
        Initialize the backfill utility.
        
        Args:
            db_connection_string: PostgreSQL connection string
                                If None, uses environment variable SUPABASE_DB_URL
        """
        self.db_connection_string = db_connection_string or os.getenv('SUPABASE_DB_URL')
        self.pipeline = FeatureEngineeringPipeline()
        self.conn = None
        
    def connect_to_database(self) -> None:
        """Establish database connection."""
        try:
            self.conn = psycopg2.connect(self.db_connection_string)
            logger.info("Successfully connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def close_connection(self) -> None:
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def get_historical_mortality_data(self, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Fetch historical mortality data from database.
        
        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            
        Returns:
            DataFrame with mortality data
        """
        logger.info(f"Fetching mortality data from {start_date} to {end_date}")
        
        query = """
        SELECT 
            ml.log_date,
            c.district,
            ml.batch_id,
            b.doc_count,
            ml.count as mortality_count,
            ml.cause,
            (ml.count::DECIMAL / b.doc_count::DECIMAL) * 100 as daily_mortality_rate
        FROM mortality_logs ml
        JOIN batches b ON ml.batch_id = b.id
        JOIN customers c ON b.customer_id = c.id
        WHERE ml.log_date >= %s 
          AND ml.log_date <= %s
          AND c.district IS NOT NULL
        ORDER BY ml.log_date, c.district
        """
        
        try:
            df = pd.read_sql_query(query, self.conn, params=(start_date, end_date))
            logger.info(f"Fetched {len(df)} mortality records")
            return df
        except Exception as e:
            logger.error(f"Error fetching mortality data: {e}")
            raise
    
    def aggregate_district_mortality_for_date(self, mortality_df: pd.DataFrame, target_date: str) -> List[Dict]:
        """
        Aggregate mortality data for a specific date by district.
        
        Args:
            mortality_df: DataFrame with mortality data
            target_date: Target date for aggregation (YYYY-MM-DD)
            
        Returns:
            List of district aggregation records
        """
        logger.info(f"Aggregating mortality data for {target_date}")
        
        # Filter data for the target date
        date_data = mortality_df[mortality_df['log_date'] == target_date]
        
        if date_data.empty:
            logger.warning(f"No mortality data found for {target_date}")
            return []
        
        # Aggregate by district
        district_records = []
        
        for district, district_data in date_data.groupby('district'):
            # Check minimum customer threshold (privacy requirement)
            customer_count = district_data['batch_id'].nunique()
            
            if customer_count < 3:
                logger.info(f"Skipping district {district}: only {customer_count} customers (minimum 3 required)")
                continue
            
            # Calculate 7-day rolling average mortality rate
            # Get data for 7-day window ending at target_date
            window_start = (pd.to_datetime(target_date) - timedelta(days=6)).strftime('%Y-%m-%d')
            window_data = mortality_df[
                (mortality_df['log_date'] >= window_start) & 
                (mortality_data['log_date'] <= target_date) &
                (mortality_data['district'] == district)
            ]
            
            if window_data.empty:
                logger.warning(f"No 7-day window data for district {district} on {target_date}")
                continue
            
            # Calculate average mortality rate
            avg_mortality_7d = window_data['daily_mortality_rate'].mean()
            stddev_mortality_7d = window_data['daily_mortality_rate'].std()
            
            # Calculate 30-day baseline for z-score
            baseline_start = (pd.to_datetime(target_date) - timedelta(days=36)).strftime('%Y-%m-%d')
            baseline_end = (pd.to_datetime(target_date) - timedelta(days=7)).strftime('%Y-%m-%d')
            
            baseline_data = mortality_df[
                (mortality_df['log_date'] >= baseline_start) & 
                (mortality_df['log_date'] <= baseline_end) &
                (mortality_df['district'] == district)
            ]
            
            if not baseline_data.empty:
                baseline_avg = baseline_data['daily_mortality_rate'].mean()
                baseline_std = baseline_data['daily_mortality_rate'].std()
                
                # Calculate z-score
                if baseline_std > 0:
                    z_score = (avg_mortality_7d - baseline_avg) / baseline_std
                else:
                    z_score = 0
            else:
                z_score = 0
            
            # Classify supply signal
            if z_score > 1.5:
                supply_signal = 'high'
            elif z_score < -1.5:
                supply_signal = 'low'
            else:
                supply_signal = 'normal'
            
            # Calculate total birds and mortality
            total_birds = district_data['doc_count'].sum()
            total_mortality = district_data['mortality_count'].sum()
            
            record = {
                'district': district,
                'date': target_date,
                'avg_mortality_rate_7d': float(avg_mortality_7d) if not pd.isna(avg_mortality_7d) else 0.0,
                'stddev_mortality_rate_7d': float(stddev_mortality_7d) if not pd.isna(stddev_mortality_7d) else 0.0,
                'z_score_vs_30d_baseline': float(z_score) if not pd.isna(z_score) else 0.0,
                'supply_signal': supply_signal,
                'sample_size': int(customer_count),
                'total_birds_monitored': int(total_birds),
                'total_mortality_count_7d': int(total_mortality)
            }
            
            district_records.append(record)
        
        logger.info(f"Generated {len(district_records)} district records for {target_date}")
        return district_records
    
    def insert_district_supply_signals(self, records: List[Dict]) -> int:
        """
        Insert district supply signals into database.
        
        Args:
            records: List of district aggregation records
            
        Returns:
            Number of records inserted
        """
        if not records:
            return 0
        
        logger.info(f"Inserting {len(records)} district supply signals")
        
        query = """
        INSERT INTO district_supply_signals (
            district, date, avg_mortality_rate_7d, stddev_mortality_rate_7d,
            z_score_vs_30d_baseline, supply_signal, sample_size,
            total_birds_monitored, total_mortality_count_7d, created_at, updated_at
        ) VALUES (
            %(district)s, %(date)s, %(avg_mortality_rate_7d)s, %(stddev_mortality_rate_7d)s,
            %(z_score_vs_30d_baseline)s, %(supply_signal)s, %(sample_size)s,
            %(total_birds_monitored)s, %(total_mortality_count_7d)s, NOW(), NOW()
        )
        ON CONFLICT (district, date)
        DO UPDATE SET
            avg_mortality_rate_7d = EXCLUDED.avg_mortality_rate_7d,
            stddev_mortality_rate_7d = EXCLUDED.stddev_mortality_rate_7d,
            z_score_vs_30d_baseline = EXCLUDED.z_score_vs_30d_baseline,
            supply_signal = EXCLUDED.supply_signal,
            sample_size = EXCLUDED.sample_size,
            total_birds_monitored = EXCLUDED.total_birds_monitored,
            total_mortality_count_7d = EXCLUDED.total_mortality_count_7d,
            updated_at = NOW()
        """
        
        try:
            cursor = self.conn.cursor()
            execute_batch(cursor, query, records)
            self.conn.commit()
            cursor.close()
            
            logger.info(f"Successfully inserted {len(records)} records")
            return len(records)
        except Exception as e:
            logger.error(f"Error inserting records: {e}")
            self.conn.rollback()
            raise
    
    def backfill_date_range(self, start_date: str, end_date: str) -> Dict:
        """
        Backfill district mortality data for a date range.
        
        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            
        Returns:
            Dictionary with backfill statistics
        """
        logger.info(f"Starting backfill from {start_date} to {end_date}")
        
        # Connect to database
        self.connect_to_database()
        
        # Fetch historical mortality data
        mortality_df = self.get_historical_mortality_data(start_date, end_date)
        
        if mortality_df.empty:
            logger.warning("No mortality data found for the specified date range")
            return {
                'status': 'no_data',
                'records_processed': 0,
                'districts_processed': 0
            }
        
        # Process each date in the range
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        total_records = 0
        total_districts = set()
        
        for target_date in date_range:
            target_date_str = target_date.strftime('%Y-%m-%d')
            
            # Aggregate mortality for this date
            records = self.aggregate_district_mortality_for_date(mortality_df, target_date_str)
            
            if records:
                # Insert records
                inserted = self.insert_district_supply_signals(records)
                total_records += inserted
                
                # Track districts
                for record in records:
                    total_districts.add(record['district'])
        
        # Close connection
        self.close_connection()
        
        stats = {
            'status': 'success',
            'date_range': f"{start_date} to {end_date}",
            'records_processed': total_records,
            'districts_processed': len(total_districts),
            'backfill_time': datetime.now().isoformat()
        }
        
        logger.info(f"Backfill complete: {stats}")
        return stats
    
    def validate_backfill_data(self, start_date: str, end_date: str) -> Dict:
        """
        Validate backfilled data for completeness and accuracy.
        
        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            
        Returns:
            Dictionary with validation results
        """
        logger.info(f"Validating backfill data from {start_date} to {end_date}")
        
        self.connect_to_database()
        
        query = """
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT district) as unique_districts,
            COUNT(DISTINCT date) as unique_dates,
            AVG(sample_size) as avg_sample_size,
            MIN(sample_size) as min_sample_size
        FROM district_supply_signals
        WHERE date >= %s AND date <= %s
        """
        
        try:
            df = pd.read_sql_query(query, self.conn, params=(start_date, end_date))
            
            validation_result = {
                'status': 'success',
                'total_records': int(df['total_records'].iloc[0]),
                'unique_districts': int(df['unique_districts'].iloc[0]),
                'unique_dates': int(df['unique_dates'].iloc[0]),
                'avg_sample_size': float(df['avg_sample_size'].iloc[0]),
                'min_sample_size': int(df['min_sample_size'].iloc[0]),
                'privacy_threshold_met': df['min_sample_size'].iloc[0] >= 3,
                'validation_time': datetime.now().isoformat()
            }
            
            logger.info(f"Validation result: {validation_result}")
            
            self.close_connection()
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating backfill data: {e}")
            self.close_connection()
            raise


def main():
    """
    Main function to run the backfill process.
    """
    logger.info("="*60)
    logger.info("District Mortality Backfill - TASK-041")
    logger.info("="*60)
    
    # Configuration
    BACKFILL_START_DATE = '2026-01-01'  # Adjust based on actual data availability
    BACKFILL_END_DATE = '2026-05-31'    # Backfill up to DAG deployment date
    
    # Initialize backfill utility
    backfill = DistrictMortalityBackfill()
    
    try:
        # Run backfill
        stats = backfill.backfill_date_range(BACKFILL_START_DATE, BACKFILL_END_DATE)
        
        logger.info("\n" + "="*60)
        logger.info("Backfill Statistics:")
        logger.info(f"  Status: {stats['status']}")
        logger.info(f"  Records Processed: {stats['records_processed']}")
        logger.info(f"  Districts Processed: {stats['districts_processed']}")
        logger.info(f"  Backfill Time: {stats['backfill_time']}")
        logger.info("="*60)
        
        # Validate backfilled data
        validation = backfill.validate_backfill_data(BACKFILL_START_DATE, BACKFILL_END_DATE)
        
        logger.info("\n" + "="*60)
        logger.info("Validation Results:")
        logger.info(f"  Total Records: {validation['total_records']}")
        logger.info(f"  Unique Districts: {validation['unique_districts']}")
        logger.info(f"  Unique Dates: {validation['unique_dates']}")
        logger.info(f"  Avg Sample Size: {validation['avg_sample_size']:.2f}")
        logger.info(f"  Min Sample Size: {validation['min_sample_size']}")
        logger.info(f"  Privacy Threshold Met: {validation['privacy_threshold_met']}")
        logger.info("="*60)
        
        logger.info("\n✅ Backfill completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Backfill failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
