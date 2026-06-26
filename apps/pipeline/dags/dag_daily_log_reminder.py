"""
PoultryPulse AI - Daily Log Reminder DAG
File: dag_daily_log_reminder.py
Description: Send WhatsApp reminder to S2 integrators who have not logged today's data.
Schedule: 08:00 IST daily (02:30 UTC)
Requirements: 15_integrator_farms_tasks_master.md FD-03
"""

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from datetime import datetime, timezone, timedelta
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

# IST timezone
IST = timezone(timedelta(hours=5, minutes=30))

# Default arguments for the DAG
default_args = {
    'owner': 'poultrypulse',
    'depends_on_past': False,
    'start_date': datetime(2026, 6, 1, tzinfo=timezone.utc),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

# Create the DAG
dag = DAG(
    'daily_log_reminder',
    default_args=default_args,
    description='Send WhatsApp reminders to integrators who have not logged daily data',
    schedule_interval='30 2 * * *',  # 08:00 IST = 02:30 UTC
    catchup=False,
    max_active_runs=1,
    tags=['notifications', 'farms', 'daily-log'],
)


def get_farms_missing_logs(**context):
    """
    Query Supabase to find all active farms where today's log is missing.
    Groups results by integrator to send one WhatsApp per integrator (not one per farm).
    """
    postgres_hook = PostgresHook(postgres_conn_id='supabase_default')
    
    query = """
    SELECT 
        c.id as integrator_id,
        c.phone,
        c.notification_whatsapp,
        ARRAY_AGG(DISTINCT f.name) as farm_names,
        ARRAY_AGG(DISTINCT f.id) as farm_ids,
        COUNT(DISTINCT f.id) as farms_count
    FROM farms f
    JOIN customers c ON f.integrator_id = c.id
    WHERE f.status = 'active'
    AND f.id NOT IN (
        SELECT farm_id FROM daily_logs 
        WHERE log_date = CURRENT_DATE AT TIME ZONE 'Asia/Kolkata'
    )
    AND c.notification_whatsapp = true
    GROUP BY c.id, c.phone, c.notification_whatsapp
    """
    
    results = postgres_hook.get_records(query)
    logger.info(f"Found {len(results)} integrators with missing daily logs")
    
    # Store results in XCom for the next task
    context['task_instance'].xcom_push(key='missing_logs_data', value=results)
    
    return results


def send_whatsapp_reminders(**context):
    """
    Send WhatsApp reminders to integrators.
    One message per integrator (grouping all their farms together).
    """
    from twilio.rest import Client
    
    # Get data from previous task
    results = context['task_instance'].xcom_pull(task_ids='get_farms_missing_logs', key='missing_logs_data')
    
    if not results:
        logger.info("No integrators with missing logs - skipping WhatsApp sends")
        return
    
    # Twilio configuration
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    whatsapp_from = os.getenv('TWILIO_WHATSAPP_FROM')
    
    if not all([account_sid, auth_token, whatsapp_from]):
        logger.error("Missing Twilio configuration - skipping WhatsApp sends")
        return
    
    client = Client(account_sid, auth_token)
    
    # Dashboard URL
    dashboard_url = os.getenv('DASHBOARD_URL', 'https://poultrypulse.ai')
    
    sent_count = 0
    failed_count = 0
    
    for row in results:
        integrator_id, phone, notification_whatsapp, farm_names, farm_ids, farms_count = row
        
        # Skip if notification_whatsapp is false
        if not notification_whatsapp:
            logger.info(f"Integrator {integrator_id} has WhatsApp notifications disabled - skipping")
            continue
        
        # Create message (Hindi + English)
        farms_list = ', '.join(farm_names)
        message = (
            f"🐔 {farms_list} का आज का daily log pending है।\n\n"
            f"Data अभी log करें: {dashboard_url}/dashboard/farms\n\n"
            f"Today's daily log is pending for: {farms_list}\n"
            f"Log data now: {dashboard_url}/dashboard/farms"
        )
        
        try:
            # Send WhatsApp message
            message_obj = client.messages.create(
                body=message,
                from_=f'whatsapp:{whatsapp_from}',
                to=f'whatsapp:{phone}'
            )
            
            logger.info(f"WhatsApp reminder sent to {phone} for {farms_count} farms: {message_obj.sid}")
            sent_count += 1
            
        except Exception as e:
            logger.error(f"Failed to send WhatsApp to {phone}: {str(e)}")
            failed_count += 1
    
    logger.info(f"WhatsApp reminders: {sent_count} sent, {failed_count} failed")
    
    # Store counts in XCom
    context['task_instance'].xcom_push(key='whatsapp_sent_count', value=sent_count)
    context['task_instance'].xcom_push(key='whatsapp_failed_count', value=failed_count)
    
    return {'sent': sent_count, 'failed': failed_count}


def log_notification_summary(**context):
    """
    Log the notification summary to the notification_log table.
    """
    postgres_hook = PostgresHook(postgres_conn_id='supabase_default')
    
    sent_count = context['task_instance'].xcom_pull(task_ids='send_whatsapp_reminders', key='whatsapp_sent_count')
    failed_count = context['task_instance'].xcom_pull(task_ids='send_whatsapp_reminders', key='whatsapp_failed_count')
    results = context['task_instance'].xcom_pull(task_ids='get_farms_missing_logs', key='missing_logs_data')
    
    total_farms = sum(row[5] for row in results) if results else 0
    
    # Insert notification log
    query = """
    INSERT INTO notification_log (integrator_id, type, sent_at, farms_count, status, details)
    VALUES (
        NULL,
        'daily_log_reminder',
        NOW(),
        %s,
        %s,
        %s
    )
    """
    
    status = 'success' if failed_count == 0 else 'partial_failure'
    details = {
        'whatsapp_sent': sent_count,
        'whatsapp_failed': failed_count,
        'total_farms_notified': total_farms
    }
    
    postgres_hook.run(query, parameters=(total_farms, status, str(details)))
    
    logger.info(f"Notification summary logged: {sent_count} sent, {failed_count} failed, {total_farms} farms")


# Define tasks
get_missing_logs_task = PythonOperator(
    task_id='get_farms_missing_logs',
    python_callable=get_farms_missing_logs,
    dag=dag,
)

send_whatsapp_task = PythonOperator(
    task_id='send_whatsapp_reminders',
    python_callable=send_whatsapp_reminders,
    dag=dag,
)

log_summary_task = PythonOperator(
    task_id='log_notification_summary',
    python_callable=log_notification_summary,
    dag=dag,
)

# Set task dependencies
get_missing_logs_task >> send_whatsapp_task >> log_summary_task
