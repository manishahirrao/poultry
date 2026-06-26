"""
PoultryPulse AI - Accuracy Monitoring DAG
Schedule: 08:00 IST daily
Purpose: Track MAPE, directional accuracy, conformal interval coverage
Requirements: TRD §3.4, Architecture §3.2
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.slack.operators.slack import SlackAPIPostOperator
import pandas as pd
import numpy as np
from typing import Dict, List
import logging
import os

# Configuration
DEFAULT_ARGS = {
    'owner': 'poultrypulse',
    'depends_on_past': True,
    'start_date': datetime(2026, 5, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

# Accuracy thresholds from PRD §5.2
MAPE_THRESHOLD = 6.0  # Must be <6%
DIRECTIONAL_ACCURACY_THRESHOLD = 95.0  # Must be >95%
CONFORMAL_COVERAGE_MIN = 78.0  # Must be 78-82%
CONFORMAL_COVERAGE_MAX = 82.0

SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
logger = logging.getLogger(__name__)


def calculate_mape(actual: pd.Series, predicted: pd.Series) -> float:
    """
    Calculate Mean Absolute Percentage Error
    MAPE = (1/n) * Σ(|(actual - predicted)| / actual) * 100
    """
    mape = np.mean(np.abs((actual - predicted) / actual)) * 100
    return mape


def calculate_directional_accuracy(actual: pd.Series, predicted: pd.Series) -> float:
    """
    Calculate directional accuracy
    Percentage of predictions that correctly predict price direction (up/down)
    """
    actual_direction = np.sign(actual.diff())
    predicted_direction = np.sign(predicted.diff())
    
    # Remove NaN values from first element
    mask = ~np.isnan(actual_direction) & ~np.isnan(predicted_direction)
    
    correct = (actual_direction[mask] == predicted_direction[mask]).sum()
    total = mask.sum()
    
    directional_acc = (correct / total) * 100 if total > 0 else 0
    return directional_acc


def calculate_conformal_coverage(actual: pd.Series, p10: pd.Series, p90: pd.Series) -> float:
    """
    Calculate conformal interval coverage
    Percentage of actual values that fall within [p10, p90] prediction interval
    """
    within_interval = (actual >= p10) & (actual <= p90)
    coverage = (within_interval.sum() / len(actual)) * 100
    return coverage


def fetch_actual_prices(**context) -> Dict:
    """
    Fetch actual prices from AGMARKNET for T-1
    Compare against predictions made yesterday
    """
    logger.info("Fetching actual prices for accuracy calculation")
    
    try:
        # In production, fetch from Supabase raw_prices table
        # Get prices for T-1 (yesterday)
        
        # Placeholder: return sample data
        return {
            'status': 'success',
            'actual_prices': [150.0, 152.0, 148.0, 155.0, 151.0],
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch actual prices: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def fetch_predictions(**context) -> Dict:
    """
    Fetch predictions made yesterday for T-1
    """
    logger.info("Fetching predictions for accuracy calculation")
    
    try:
        # In production, fetch from Supabase predictions table
        # Get predictions made yesterday for today's date
        
        # Placeholder: return sample data
        return {
            'status': 'success',
            'predictions': {
                'p10': [145.0, 147.0, 143.0, 150.0, 146.0],
                'p50': [150.0, 152.0, 148.0, 155.0, 151.0],
                'p90': [155.0, 157.0, 153.0, 160.0, 156.0],
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch predictions: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def compute_accuracy_metrics(**context) -> Dict:
    """
    Compute MAPE, directional accuracy, conformal coverage
    Store in Supabase accuracy_metrics table
    """
    logger.info("Computing accuracy metrics")
    
    try:
        ti = context['task_instance']
        
        # Get actual prices and predictions
        actual_result = ti.xcom_pull(task_ids='fetch_actual_prices')
        prediction_result = ti.xcom_pull(task_ids='fetch_predictions')
        
        if actual_result.get('status') != 'success' or prediction_result.get('status') != 'success':
            raise ValueError("Failed to fetch data for accuracy calculation")
        
        actual = pd.Series(actual_result['actual_prices'])
        predictions = prediction_result['predictions']
        
        p10 = pd.Series(predictions['p10'])
        p50 = pd.Series(predictions['p50'])
        p90 = pd.Series(predictions['p90'])
        
        # Calculate metrics
        mape = calculate_mape(actual, p50)
        directional_acc = calculate_directional_accuracy(actual, p50)
        conformal_coverage = calculate_conformal_coverage(actual, p10, p90)
        
        metrics = {
            'mape': mape,
            'directional_accuracy': directional_acc,
            'conformal_coverage': conformal_coverage,
            'date': datetime.utcnow().date().isoformat(),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Check against thresholds
        mape_pass = mape < MAPE_THRESHOLD
        directional_pass = directional_acc > DIRECTIONAL_ACCURACY_THRESHOLD
        conformal_pass = CONFORMAL_COVERAGE_MIN <= conformal_coverage <= CONFORMAL_COVERAGE_MAX
        
        overall_pass = mape_pass and directional_pass and conformal_pass
        
        logger.info(f"MAPE: {mape:.2f}% (threshold: {MAPE_THRESHOLD}%)")
        logger.info(f"Directional Accuracy: {directional_acc:.2f}% (threshold: {DIRECTIONAL_ACCURACY_THRESHOLD}%)")
        logger.info(f"Conformal Coverage: {conformal_coverage:.2f}% (range: {CONFORMAL_COVERAGE_MIN}%-{CONFORMAL_COVERAGE_MAX}%)")
        
        if not overall_pass:
            logger.error("Accuracy thresholds not met")
        
        # In production, store in Supabase accuracy_metrics table
        # supabase.table('accuracy_metrics').insert(metrics).execute()
        
        return {
            'status': 'success',
            'metrics': metrics,
            'overall_pass': overall_pass,
            'mape_pass': mape_pass,
            'directional_pass': directional_pass,
            'conformal_pass': conformal_pass,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to compute accuracy metrics: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def check_30_day_rolling_accuracy(**context) -> Dict:
    """
    Check 30-day rolling average of MAPE and directional accuracy
    Trigger alert if below threshold for 7 consecutive days
    """
    logger.info("Checking 30-day rolling accuracy")
    
    try:
        ti = context['task_instance']
        metrics_result = ti.xcom_pull(task_ids='compute_accuracy_metrics')
        
        if metrics_result.get('status') != 'success':
            raise ValueError("Failed to compute metrics")
        
        # In production, query last 30 days of accuracy metrics from Supabase
        # Calculate rolling averages
        
        # Placeholder: return sample rolling data
        rolling_mape_30d = 5.2  # Example
        rolling_directional_30d = 96.5  # Example
        
        logger.info(f"30-day rolling MAPE: {rolling_mape_30d:.2f}%")
        logger.info(f"30-day rolling directional accuracy: {rolling_directional_30d:.2f}%")
        
        return {
            'status': 'success',
            'rolling_mape_30d': rolling_mape_30d,
            'rolling_directional_30d': rolling_directional_30d,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to check rolling accuracy: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def send_accuracy_alert(metrics: dict, context):
    """
    Send Slack alert if accuracy thresholds not met
    """
    dag_id = context['dag_run'].dag_id
    execution_date = context['dag_run'].execution_date
    
    alert_message = (
        f"⚠️ Accuracy Threshold Alert\n"
        f"DAG: {dag_id}\n"
        f"Execution Date: {execution_date}\n"
        f"MAPE: {metrics['mape']:.2f}% (threshold: {MAPE_THRESHOLD}%)\n"
        f"Directional Accuracy: {metrics['directional_accuracy']:.2f}% (threshold: {DIRECTIONAL_ACCURACY_THRESHOLD}%)\n"
        f"Conformal Coverage: {metrics['conformal_coverage']:.2f}% (range: {CONFORMAL_COVERAGE_MIN}%-{CONFORMAL_COVERAGE_MAX}%)\n"
        f"Action: Model retraining may be required"
    )
    
    if SLACK_WEBHOOK_URL:
        SlackAPIPostOperator(
            task_id='accuracy_alert',
            slack_webhook_conn_id='slack_default',
            text=alert_message,
        ).execute(context)


# DAG Definition
dag = DAG(
    'dag_accuracy_monitor',
    default_args=DEFAULT_ARGS,
    description='Track MAPE, directional accuracy, conformal interval coverage',
    schedule_interval='0 08 * * *',  # 08:00 IST daily
    depends_on_past=True,  # Wait for dag_model_infer to complete
    catchup=False,
    tags=['monitoring', 'accuracy', 'phase-0'],
)

# Tasks
fetch_actual_task = PythonOperator(
    task_id='fetch_actual_prices',
    python_callable=fetch_actual_prices,
    dag=dag,
)

fetch_predictions_task = PythonOperator(
    task_id='fetch_predictions',
    python_callable=fetch_predictions,
    dag=dag,
)

compute_metrics_task = PythonOperator(
    task_id='compute_accuracy_metrics',
    python_callable=compute_accuracy_metrics,
    dag=dag,
)

check_rolling_task = PythonOperator(
    task_id='check_30_day_rolling_accuracy',
    python_callable=check_30_day_rolling_accuracy,
    dag=dag,
)

# Task dependencies
[fetch_actual_task, fetch_predictions_task] >> compute_metrics_task >> check_rolling_task
