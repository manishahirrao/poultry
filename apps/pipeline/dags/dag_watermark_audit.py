"""
PoultryPulse AI - Watermark Audit DAG
Schedule: Daily 22:00 IST
Purpose: Detect watermark removal, session/device binding violations, IP theft
Requirements: TRD §5.2, Architecture §4.3
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
import hashlib
import re

# Configuration
DEFAULT_ARGS = {
    'owner': 'poultrypulse',
    'depends_on_past': False,
    'start_date': datetime(2026, 5, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
logger = logging.getLogger(__name__)


def extract_watermark_from_image(image_path: str) -> str:
    """
    Extract LSB watermark from prediction image
    Uses stegano library
    """
    try:
        from stegano import lsb
        
        # Extract hidden message from image
        secret = lsb.reveal(image_path)
        
        if secret:
            return secret
        else:
            return None
            
    except Exception as e:
        logger.error(f"Watermark extraction failed: {str(e)}")
        return None


def verify_watermark_integrity(watermark: str, expected_pattern: str) -> bool:
    """
    Verify watermark matches expected pattern
    Pattern: PP-{user_id}-{timestamp}-{hash}
    """
    if not watermark:
        return False
    
    # Check pattern match
    pattern = r'^PP-\d+-\d{14}-[a-f0-9]{32}$'
    if not re.match(pattern, watermark):
        return False
    
    # Verify hash integrity
    parts = watermark.split('-')
    user_id = parts[1]
    timestamp = parts[2]
    hash_value = parts[3]
    
    # Recompute hash
    expected_hash = hashlib.sha256(f"{user_id}{timestamp}".encode()).hexdigest()
    
    return hash_value == expected_hash


def scan_prediction_images(**context) -> Dict:
    """
    Scan all prediction images from last 24 hours
    Check for watermark presence and integrity
    """
    logger.info("Scanning prediction images for watermark integrity")
    
    try:
        # In production, this would:
        # 1. Query Supabase for predictions from last 24 hours
        # 2. Download prediction images from S3
        # 3. Extract and verify watermarks
        
        scanned_count = 0
        violations = []
        
        # Placeholder: simulate scanning
        scanned_count = 100
        violations = [
            {
                'type': 'watermark_removed',
                'prediction_id': 'pred_123',
                'user_id': 'user_456',
                'timestamp': datetime.utcnow().isoformat()
            }
        ]
        
        logger.info(f"Scanned {scanned_count} images, found {len(violations)} violations")
        
        return {
            'status': 'success',
            'scanned_count': scanned_count,
            'violations': violations,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Image scan failed: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def detect_session_device_violations(**context) -> Dict:
    """
    Detect session/device binding violations
    Check for:
    - Multiple devices per user in 24h
    - Multiple users per device in 24h
    - IP address anomalies
    """
    logger.info("Detecting session/device binding violations")
    
    try:
        # In production, this would:
        # 1. Query Supabase for session logs from last 24 hours
        # 2. Group by user_id and device_id
        # 3. Flag violations
        
        violations = []
        
        # Placeholder: simulate violation detection
        violations = [
            {
                'type': 'multiple_devices',
                'user_id': 'user_789',
                'device_count': 3,
                'threshold': 2,
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'type': 'multiple_users',
                'device_id': 'device_abc',
                'user_count': 5,
                'threshold': 2,
                'timestamp': datetime.utcnow().isoformat()
            }
        ]
        
        logger.info(f"Found {len(violations)} session/device violations")
        
        return {
            'status': 'success',
            'violations': violations,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Session/device violation detection failed: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def detect_ip_theft_patterns(**context) -> Dict:
    """
    Detect IP theft patterns
    Check for:
    - Bulk prediction exports
    - Prediction API abuse
    - Suspicious request patterns
    """
    logger.info("Detecting IP theft patterns")
    
    try:
        # In production, this would:
        # 1. Query Supabase for API logs from last 24 hours
        # 2. Analyze request patterns
        # 3. Flag suspicious activity
        
        violations = []
        
        # Placeholder: simulate IP theft detection
        violations = [
            {
                'type': 'bulk_export',
                'user_id': 'user_def',
                'export_count': 500,
                'threshold': 100,
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'type': 'api_abuse',
                'user_id': 'user_ghi',
                'request_rate': 1000,
                'threshold': 100,
                'timestamp': datetime.utcnow().isoformat()
            }
        ]
        
        logger.info(f"Found {len(violations)} IP theft violations")
        
        return {
            'status': 'success',
            'violations': violations,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"IP theft detection failed: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def aggregate_violations(**context) -> Dict:
    """
    Aggregate all violations from watermark, session/device, and IP theft checks
    Store in Supabase watermark_audit table
    """
    logger.info("Aggregating violations")
    
    try:
        ti = context['task_instance']
        
        watermark_result = ti.xcom_pull(task_ids='scan_prediction_images')
        session_result = ti.xcom_pull(task_ids='detect_session_device_violations')
        ip_theft_result = ti.xcom_pull(task_ids='detect_ip_theft_patterns')
        
        all_violations = []
        
        if watermark_result.get('status') == 'success':
            all_violations.extend(watermark_result.get('violations', []))
        
        if session_result.get('status') == 'success':
            all_violations.extend(session_result.get('violations', []))
        
        if ip_theft_result.get('status') == 'success':
            all_violations.extend(ip_theft_result.get('violations', []))
        
        # Categorize violations by severity
        critical_violations = [v for v in all_violations if v['type'] in ['watermark_removed', 'bulk_export']]
        high_violations = [v for v in all_violations if v['type'] in ['multiple_devices', 'multiple_users']]
        medium_violations = [v for v in all_violations if v['type'] in ['api_abuse']]
        
        # Store in Supabase watermark_audit table
        # supabase.table('watermark_audit').insert({
        #     'audit_date': datetime.utcnow().date().isoformat(),
        #     'total_violations': len(all_violations),
        #     'critical_violations': len(critical_violations),
        #     'high_violations': len(high_violations),
        #     'medium_violations': len(medium_violations),
        #     'violations_detail': all_violations,
        #     'timestamp': datetime.utcnow().isoformat()
        # }).execute()
        
        logger.info(f"Aggregated {len(all_violations)} violations")
        logger.info(f"Critical: {len(critical_violations)}, High: {len(high_violations)}, Medium: {len(medium_violations)}")
        
        return {
            'status': 'success',
            'total_violations': len(all_violations),
            'critical_violations': len(critical_violations),
            'high_violations': len(high_violations),
            'medium_violations': len(medium_violations),
            'violations': all_violations,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Violation aggregation failed: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


def send_security_alert(violations: dict, context):
    """
    Send Slack alert on critical violations
    """
    dag_id = context['dag_run'].dag_id
    execution_date = context['dag_run'].execution_date
    
    if violations.get('critical_violations', 0) > 0:
        alert_message = (
            f"🚨 CRITICAL Security Alert - Watermark Violations Detected\n"
            f"DAG: {dag_id}\n"
            f"Execution Date: {execution_date}\n"
            f"Total Violations: {violations['total_violations']}\n"
            f"Critical Violations: {violations['critical_violations']}\n"
            f"High Violations: {violations['high_violations']}\n"
            f"Action: Immediate investigation required"
        )
        
        if SLACK_WEBHOOK_URL:
            SlackAPIPostOperator(
                task_id='security_alert',
                slack_webhook_conn_id='slack_default',
                text=alert_message,
            ).execute(context)


def trigger_account_suspension(violations: dict, **context) -> Dict:
    """
    Suspend accounts with critical violations
    """
    logger.info("Checking for account suspensions")
    
    try:
        critical_violations = violations.get('violations', [])
        
        suspended_accounts = []
        
        for violation in critical_violations:
            if violation['type'] in ['watermark_removed', 'bulk_export']:
                user_id = violation.get('user_id')
                if user_id:
                    # Suspend account in Supabase
                    # supabase.table('users').update({'status': 'suspended'}).eq('id', user_id).execute()
                    suspended_accounts.append(user_id)
                    logger.warning(f"Suspended account: {user_id}")
        
        return {
            'status': 'success',
            'suspended_accounts': suspended_accounts,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Account suspension failed: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


# DAG Definition
dag = DAG(
    'dag_watermark_audit',
    default_args=DEFAULT_ARGS,
    description='Watermark detection and IP audit',
    schedule_interval='0 22 * * *',  # 22:00 IST daily
    depends_on_past=False,
    catchup=False,
    tags=['security', 'watermark', 'ip-protection', 'phase-0'],
)

# Tasks
scan_images_task = PythonOperator(
    task_id='scan_prediction_images',
    python_callable=scan_prediction_images,
    dag=dag,
)

session_violations_task = PythonOperator(
    task_id='detect_session_device_violations',
    python_callable=detect_session_device_violations,
    dag=dag,
)

ip_theft_task = PythonOperator(
    task_id='detect_ip_theft_patterns',
    python_callable=detect_ip_theft_patterns,
    dag=dag,
)

aggregate_task = PythonOperator(
    task_id='aggregate_violations',
    python_callable=aggregate_violations,
    dag=dag,
)

suspend_task = PythonOperator(
    task_id='trigger_account_suspension',
    python_callable=trigger_account_suspension,
    dag=dag,
)

# Task dependencies
[scan_images_task, session_violations_task, ip_theft_task] >> aggregate_task >> suspend_task
