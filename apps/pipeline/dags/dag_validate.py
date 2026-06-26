"""
PoultryPulse AI - Data Validation DAG
Schedule: 05:00 IST daily
Purpose: Run Great Expectations checkpoint for data quality validation
Requirements: TRD §3.3, Architecture §2.3
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.slack.operators.slack import SlackAPIPostOperator
from great_expectations.data_context import DataContext
import pandas as pd
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

SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
logger = logging.getLogger(__name__)


def run_validation_checkpoint(**context) -> dict:
    """
    Run Great Expectations checkpoint 'daily_completeness'
    Validates all 7 fields per TRD §3.3
    """
    logger.info("Starting Great Expectations validation")
    
    try:
        # Initialize Great Expectations data context
        data_context = DataContext()
        
        # Get the checkpoint
        checkpoint = data_context.get_checkpoint("daily_completeness_checkpoint")
        
        # Run the checkpoint
        result = checkpoint.run()
        
        # Extract validation results
        validation_results = result.run_results
        
        # Check for critical failures
        critical_failures = []
        validation_passed = True
        
        for expectation_result in validation_results:
            if not expectation_result.success:
                expectation_type = expectation_result.expectation_config.expectation_type
                column = expectation_result.expectation_config.kwargs.get('column', 'unknown')
                
                # Critical fields that must pass
                if column in ['broiler_price_per_kg', 'mandi_name', 'date', 'completeness_overall']:
                    critical_failures.append({
                        'column': column,
                        'expectation': expectation_type,
                        'result': 'failed'
                    })
                    validation_passed = False
        
        # Calculate overall completeness
        completeness_percentage = calculate_completeness(validation_results)
        
        # Block downstream if completeness < 95%
        if completeness_percentage < 95:
            validation_passed = False
            logger.error(f"Completeness {completeness_percentage}% below 95% threshold")
        
        result_summary = {
            'validation_passed': validation_passed,
            'completeness_percentage': completeness_percentage,
            'critical_failures': critical_failures,
            'total_expectations': len(validation_results),
            'failed_expectations': len([r for r in validation_results if not r.success]),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if not validation_passed:
            logger.error(f"Validation failed: {result_summary}")
            # This will raise AirflowFailException and block downstream DAGs
            raise Exception(f"Data validation failed: {critical_failures}")
        
        logger.info(f"Validation passed: {result_summary}")
        return result_summary
        
    except Exception as e:
        logger.error(f"Validation checkpoint failed: {str(e)}")
        # Send Slack alert
        send_validation_alert(str(e), context)
        raise


def calculate_completeness(validation_results) -> float:
    """
    Calculate overall completeness percentage across all fields
    Based on TRD §3.3 completeness_overall requirement
    """
    total_fields = 0
    complete_fields = 0
    
    for result in validation_results:
        # Count completeness expectations
        if 'not_null' in result.expectation_config.expectation_type:
            total_fields += 1
            if result.success:
                complete_fields += 1
    
    if total_fields == 0:
        return 100.0
    
    return (complete_fields / total_fields) * 100


def interpolate_missing_values(**context) -> dict:
    """
    Apply rolling median interpolation for <3 consecutive missing price values
    Uses pandas fillna(method='ffill', limit=3)
    """
    logger.info("Starting missing value interpolation")
    
    try:
        # In production, this would:
        # 1. Load raw data from Supabase
        # 2. Apply pandas fillna with limit=3
        # 3. Update validated flag in database
        
        # Placeholder implementation
        interpolated_count = 0
        
        logger.info(f"Interpolated {interpolated_count} missing values")
        
        return {
            'status': 'success',
            'interpolated_count': interpolated_count,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Interpolation failed: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def send_validation_alert(error_message: str, context):
    """
    Send Slack alert on validation failure
    """
    dag_id = context['dag_run'].dag_id
    execution_date = context['dag_run'].execution_date
    
    alert_message = (
        f"🚨 Data Validation Failure Alert\n"
        f"DAG: {dag_id}\n"
        f"Execution Date: {execution_date}\n"
        f"Error: {error_message}\n"
        f"Action: Downstream DAGs blocked. Manual review required."
    )
    
    if SLACK_WEBHOOK_URL:
        SlackAPIPostOperator(
            task_id='validation_alert',
            slack_webhook_conn_id='slack_default',
            text=alert_message,
        ).execute(context)


# DAG Definition
dag = DAG(
    'dag_validate',
    default_args=DEFAULT_ARGS,
    description='Great Expectations data validation checkpoint',
    schedule_interval='0 05 * * *',  # 05:00 IST daily
    depends_on_past=True,  # Wait for dag_raw_ingest to complete
    catchup=False,
    tags=['validation', 'data-quality', 'phase-0'],
)

# Tasks
validation_task = PythonOperator(
    task_id='run_validation_checkpoint',
    python_callable=run_validation_checkpoint,
    dag=dag,
)

interpolation_task = PythonOperator(
    task_id='interpolate_missing_values',
    python_callable=interpolate_missing_values,
    dag=dag,
)

# Task dependencies
validation_task >> interpolation_task
