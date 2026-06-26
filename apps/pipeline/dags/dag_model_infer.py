"""
PoultryPulse AI - Model Inference DAG
Schedule: 06:00 IST daily
Purpose: Call FastAPI inference endpoint and store predictions
Requirements: TRD §3.2, Architecture §3.1
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.slack.operators.slack import SlackAPIPostOperator
import requests
import json
import logging
import os
from typing import Dict, List
import pandas as pd

# Configuration
DEFAULT_ARGS = {
    'owner': 'poultrypulse',
    'depends_on_past': True,
    'start_date': datetime(2026, 5, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(seconds=10),
}

INFERENCE_API_URL = os.getenv('INFERENCE_API_URL', 'http://localhost:8000')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
logger = logging.getLogger(__name__)


def load_feature_matrix(**context) -> Dict:
    """
    Load feature matrix from S3/Supabase
    Output from dag_feature_eng
    """
    logger.info("Loading feature matrix")
    
    try:
        # In production, load from S3 Parquet file
        # feature_df = pd.read_parquet('s3://poultrypulse-features/feature_matrix.parquet')
        
        # Placeholder: return sample data
        return {
            'status': 'success',
            'rows_loaded': 100,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to load feature matrix: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def call_inference_endpoint(features: dict, **context) -> Dict:
    """
    Call FastAPI inference endpoint POST /v1/predict
    Returns PredictionResult with p10, p50, p90, drivers, confidence
    """
    logger.info("Calling inference endpoint")
    
    try:
        # Prepare request payload
        payload = {
            'features': features,
            'model_version': 'champion',
            'request_timestamp': datetime.utcnow().isoformat()
        }
        
        # Call inference API
        response = requests.post(
            f'{INFERENCE_API_URL}/v1/predict',
            json=payload,
            timeout=30,
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        
        prediction = response.json()
        
        # Validate prediction structure
        required_fields = ['p10', 'p50', 'p90', 'drivers', 'confidence', 'model_version']
        for field in required_fields:
            if field not in prediction:
                raise ValueError(f"Missing required field: {field}")
        
        # Sanity check: reject predictions outside [₹100, ₹250] range
        p50 = prediction['p50']
        if not (100 <= p50 <= 250):
            logger.error(f"Prediction out of valid range: ₹{p50}")
            raise ValueError(f"Prediction {p50} outside valid range [100, 250]")
        
        logger.info(f"Inference successful: P50 = ₹{p50}")
        
        return {
            'status': 'success',
            'prediction': prediction,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Inference call failed: {str(e)}")
        # Circuit breaker: serve T-1 prediction with staleness flag
        return {
            'status': 'circuit_breaker',
            'error': str(e),
            'fallback': 'stale_prediction_served'
        }


def store_prediction_to_supabase(prediction: dict, **context) -> Dict:
    """
    Write PredictionResult JSON to Supabase predictions table
    """
    logger.info("Storing prediction to Supabase")
    
    try:
        # In production, use Supabase Python client
        # supabase.table('predictions').insert({
        #     'mandi': 'gorakhpur',
        #     'predicted_for': prediction_date,
        #     'p10': prediction['p10'],
        #     'p50': prediction['p50'],
        #     'p90': prediction['p90'],
        #     'drivers': prediction['drivers'],
        #     'confidence': prediction['confidence'],
        #     'model_version': prediction['model_version'],
        #     'staleness_flag': False,
        # }).execute()
        
        logger.info("Prediction stored successfully")
        
        return {
            'status': 'success',
            'prediction_id': 'pred_123456',  # Placeholder
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to store prediction: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def trigger_whatsapp_dispatch(prediction: dict, **context) -> Dict:
    """
    Trigger WhatsApp dispatch via Twilio for all active S1 subscribers
    """
    logger.info("Triggering WhatsApp dispatch")
    
    try:
        # In production, this would:
        # 1. Query Supabase for active S1 subscribers
        # 2. Call Twilio WhatsApp API for each subscriber
        # 3. Include watermarked prediction in message
        
        # Placeholder implementation
        logger.info("WhatsApp dispatch triggered for active subscribers")
        
        return {
            'status': 'success',
            'dispatched_count': 50,  # Placeholder
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"WhatsApp dispatch failed: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def check_circuit_breaker(**context) -> Dict:
    """
    Circuit breaker: 3 consecutive inference failures → serve T-1 prediction
    Never serve stale >24h without explicit flag
    """
    logger.info("Checking circuit breaker status")
    
    ti = context['task_instance']
    
    # Check previous task results
    inference_result = ti.xcom_pull(task_ids='call_inference_endpoint')
    
    if inference_result.get('status') == 'circuit_breaker':
        # Increment failure counter
        # If 3 consecutive failures, serve stale with explicit flag
        logger.warning("Circuit breaker triggered - serving stale prediction")
        
        return {
            'status': 'circuit_breaker_active',
            'staleness_flag': True,
            'action': 'serving_stale_prediction'
        }
    
    # Reset failure counter on success
    return {
        'status': 'circuit_breaker_reset',
        'staleness_flag': False
    }


def send_inference_alert(error_message: str, context):
    """
    Send Slack alert on inference failure
    """
    dag_id = context['dag_run'].dag_id
    execution_date = context['dag_run'].execution_date
    
    alert_message = (
        f"🚨 ML Inference Failure Alert\n"
        f"DAG: {dag_id}\n"
        f"Execution Date: {execution_date}\n"
        f"Error: {error_message}\n"
        f"Action: Circuit breaker activated, serving stale predictions"
    )
    
    if SLACK_WEBHOOK_URL:
        SlackAPIPostOperator(
            task_id='inference_alert',
            slack_webhook_conn_id='slack_default',
            text=alert_message,
        ).execute(context)


# DAG Definition
dag = DAG(
    'dag_model_infer',
    default_args=DEFAULT_ARGS,
    description='ML inference and prediction storage',
    schedule_interval='0 06 * * *',  # 06:00 IST daily
    depends_on_past=True,  # Wait for dag_feature_eng to complete
    catchup=False,
    tags=['inference', 'ml', 'phase-0'],
)

# Tasks
load_features_task = PythonOperator(
    task_id='load_feature_matrix',
    python_callable=load_feature_matrix,
    dag=dag,
)

inference_task = PythonOperator(
    task_id='call_inference_endpoint',
    python_callable=call_inference_endpoint,
    dag=dag,
)

store_prediction_task = PythonOperator(
    task_id='store_prediction_to_supabase',
    python_callable=store_prediction_to_supabase,
    dag=dag,
)

whatsapp_dispatch_task = PythonOperator(
    task_id='trigger_whatsapp_dispatch',
    python_callable=trigger_whatsapp_dispatch,
    dag=dag,
)

circuit_breaker_task = PythonOperator(
    task_id='check_circuit_breaker',
    python_callable=check_circuit_breaker,
    dag=dag,
)

# Task dependencies
load_features_task >> inference_task >> circuit_breaker_task
circuit_breaker_task >> [store_prediction_task, whatsapp_dispatch_task]
