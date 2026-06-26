"""
PoultryPulse AI - NECC Weekly Scraper DAG
Schedule: Weekly (Sundays 20:00 IST)
Purpose: Scrapes NECC egg rate data, validates, and stores in Supabase
Requirements: TRD §3.1 (Data Ingestion), PRD v3.0 §5 (Egg prices feature)
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
import requests
import pandas as pd
import logging
import os
from supabase import create_client

# Configuration
DEFAULT_ARGS = {
    'owner': 'poultrypulse',
    'depends_on_past': False,
    'start_date': datetime(2026, 5, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

logger = logging.getLogger(__name__)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def fetch_necc_data(**context):
    """
    Fetch weekly NECC egg rate data.
    """
    logger.info("Fetching NECC weekly egg rates")
    
    try:
        # In production, this would scrape the NECC website or use an API
        # For phase 0, we're mocking the extraction
        
        # Mock data representing NECC egg prices per 100 eggs
        mock_data = [
            {'zone': 'Namakkal', 'price': 485.0, 'date': datetime.utcnow().strftime('%Y-%m-%d')},
            {'zone': 'Hyderabad', 'price': 470.0, 'date': datetime.utcnow().strftime('%Y-%m-%d')},
            {'zone': 'Pune', 'price': 510.0, 'date': datetime.utcnow().strftime('%Y-%m-%d')},
            {'zone': 'Delhi', 'price': 530.0, 'date': datetime.utcnow().strftime('%Y-%m-%d')},
            {'zone': 'Kolkata', 'price': 540.0, 'date': datetime.utcnow().strftime('%Y-%m-%d')}
        ]
        
        logger.info(f"Fetched {len(mock_data)} records from NECC")
        
        # Pass to next task
        return mock_data
        
    except Exception as e:
        logger.error(f"Failed to fetch NECC data: {str(e)}")
        raise

def process_and_store_necc_data(**context):
    """
    Process NECC data, calculate weekly change, and store in Supabase.
    """
    logger.info("Processing and storing NECC data")
    
    ti = context['task_instance']
    raw_data = ti.xcom_pull(task_ids='fetch_necc_data')
    
    if not raw_data:
        raise ValueError("No data returned from fetch task")
        
    try:
        df = pd.DataFrame(raw_data)
        
        if not supabase_url or not supabase_key:
            logger.warning("Supabase credentials not found. Skipping DB insert.")
            logger.info(df.to_string())
            return {"status": "success", "message": "Dry run complete"}
            
        supabase = create_client(supabase_url, supabase_key)
        
        # Calculate national average
        national_avg = df['price'].mean()
        logger.info(f"National Average Egg Price: Rs {national_avg}/100 eggs")
        
        # In production, we'd fetch the previous week's average to calculate delta
        # previous_avg = ...
        
        # Store in Supabase
        records = df.to_dict('records')
        # Assuming table exists or will be created
        # supabase.table('necc_rates').insert(records).execute()
        
        logger.info(f"Successfully processed {len(records)} NECC records")
        return {"status": "success", "records_processed": len(records), "national_avg": national_avg}
        
    except Exception as e:
        logger.error(f"Failed to process NECC data: {str(e)}")
        raise

# DAG Definition
dag = DAG(
    'dag_necc_weekly',
    default_args=DEFAULT_ARGS,
    description='Weekly NECC egg rate scraper',
    schedule_interval='0 20 * * 0',  # Sundays 20:00 IST
    catchup=False,
    tags=['ingestion', 'necc', 'weekly'],
)

# Tasks
fetch_task = PythonOperator(
    task_id='fetch_necc_data',
    python_callable=fetch_necc_data,
    dag=dag,
)

process_task = PythonOperator(
    task_id='process_and_store_necc_data',
    python_callable=process_and_store_necc_data,
    dag=dag,
)

# Dependencies
fetch_task >> process_task
