"""
PoultryPulse AI - Mortality Metrics API
File: apps/api/mortality_metrics.py
Version: v1.0 | June 2026
Task: TASK-METRICS-001
Requirements: REQ-016 §16.7, REQ-024 §24.1
Description: API endpoints for mortality dashboard metrics
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException, Request
from supabase import Client
import structlog
from datetime import datetime, date, timedelta
from decimal import Decimal

logger = structlog.get_logger()


async def get_mortality_trend(
    supabase: Client,
    integrator_id: str,
    period: str = "30d"
) -> List[Dict[str, Any]]:
    """
    GET /api/metrics/mortality-trend
    Returns cumulative mortality trend data for the integrator's farms
    
    Args:
        supabase: Supabase client instance
        integrator_id: Customer ID (integrator_id)
        period: Time period (30d, 60d, 90d)
        
    Returns:
        List of daily mortality trend data points
    """
    try:
        # Calculate date range
        if period == "30d":
            start_date = datetime.now() - timedelta(days=30)
        elif period == "60d":
            start_date = datetime.now() - timedelta(days=60)
        elif period == "90d":
            start_date = datetime.now() - timedelta(days=90)
        else:
            start_date = datetime.now() - timedelta(days=30)
        
        # Fetch farms for this integrator
        farms_result = supabase.table('farms').select('id, name').eq('integrator_id', integrator_id).execute()
        farms = farms_result.data if farms_result.data else []
        
        if not farms:
            return []
        
        # Fetch daily logs for all farms in the period
        logs_result = supabase.table('daily_logs') \
            .select('farm_id, log_date, cumulative_mortality_pct, deaths_today') \
            .in_('farm_id', [f['id'] for f in farms]) \
            .gte('log_date', start_date.date().isoformat()) \
            .is_('deleted_at', None) \
            .order('log_date') \
            .execute()
        
        logs = logs_result.data if logs_result.data else []
        
        # Group logs by date and farm
        trend_data: Dict[str, Dict[str, Any]] = {}
        
        for log in logs:
            date_str = log['log_date']
            farm_id = log['farm_id']
            
            # Find farm name
            farm_name = next((f['name'] for f in farms if f['id'] == farm_id), 'Unknown')
            
            if date_str not in trend_data:
                trend_data[date_str] = {'date': date_str}
            
            # Use farm name (truncated to 15 chars) as key
            farm_key = farm_name[:15]
            trend_data[date_str][farm_key] = log.get('cumulative_mortality_pct', 0)
        
        # Convert to sorted list
        return sorted(trend_data.values(), key=lambda x: x['date'])
        
    except Exception as e:
        logger.error("mortality_trend_fetch_failed", integrator_id=integrator_id, period=period, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch mortality trend: {str(e)}")


async def get_daily_deaths(
    supabase: Client,
    integrator_id: str,
    period: str = "30d"
) -> List[Dict[str, Any]]:
    """
    GET /api/metrics/daily-deaths
    Returns daily death events data for the integrator's farms
    
    Args:
        supabase: Supabase client instance
        integrator_id: Customer ID (integrator_id)
        period: Time period (30d, 60d, 90d)
        
    Returns:
        List of daily death events data points
    """
    try:
        # Calculate date range
        if period == "30d":
            start_date = datetime.now() - timedelta(days=30)
        elif period == "60d":
            start_date = datetime.now() - timedelta(days=60)
        elif period == "90d":
            start_date = datetime.now() - timedelta(days=90)
        else:
            start_date = datetime.now() - timedelta(days=30)
        
        # Fetch farms for this integrator
        farms_result = supabase.table('farms').select('id, name').eq('integrator_id', integrator_id).execute()
        farms = farms_result.data if farms_result.data else []
        
        if not farms:
            return []
        
        # Fetch daily logs for all farms in the period
        logs_result = supabase.table('daily_logs') \
            .select('farm_id, log_date, deaths_today') \
            .in_('farm_id', [f['id'] for f in farms]) \
            .gte('log_date', start_date.date().isoformat()) \
            .is_('deleted_at', None) \
            .order('log_date') \
            .execute()
        
        logs = logs_result.data if logs_result.data else []
        
        # Group logs by date and farm
        deaths_data: Dict[str, Dict[str, Any]] = {}
        
        for log in logs:
            date_str = log['log_date']
            farm_id = log['farm_id']
            
            # Find farm name
            farm_name = next((f['name'] for f in farms if f['id'] == farm_id), 'Unknown')
            
            if date_str not in deaths_data:
                deaths_data[date_str] = {'date': date_str}
            
            # Use farm name (truncated to 15 chars) as key
            farm_key = farm_name[:15]
            deaths_data[date_str][farm_key] = log.get('deaths_today', 0)
        
        # Convert to sorted list
        return sorted(deaths_data.values(), key=lambda x: x['date'])
        
    except Exception as e:
        logger.error("daily_deaths_fetch_failed", integrator_id=integrator_id, period=period, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch daily deaths: {str(e)}")


async def get_cause_of_death(
    supabase: Client,
    integrator_id: str,
    period: str = "30d"
) -> List[Dict[str, Any]]:
    """
    GET /api/metrics/cause-of-death
    Returns cause of death distribution for the integrator's farms
    
    Args:
        supabase: Supabase client instance
        integrator_id: Customer ID (integrator_id)
        period: Time period (30d, 60d, 90d)
        
    Returns:
        List of cause of death distribution data
    """
    try:
        # Calculate date range
        if period == "30d":
            start_date = datetime.now() - timedelta(days=30)
        elif period == "60d":
            start_date = datetime.now() - timedelta(days=60)
        elif period == "90d":
            start_date = datetime.now() - timedelta(days=90)
        else:
            start_date = datetime.now() - timedelta(days=30)
        
        # Fetch farms for this integrator
        farms_result = supabase.table('farms').select('id').eq('integrator_id', integrator_id).execute()
        farms = farms_result.data if farms_result.data else []
        
        if not farms:
            return []
        
        # Fetch daily logs with death cause for all farms in the period
        logs_result = supabase.table('daily_logs') \
            .select('death_cause, deaths_today') \
            .in_('farm_id', [f['id'] for f in farms]) \
            .gte('log_date', start_date.date().isoformat()) \
            .is_('deleted_at', None) \
            .execute()
        
        logs = logs_result.data if logs_result.data else []
        
        # Aggregate deaths by cause
        cause_counts: Dict[str, int] = {}
        
        for log in logs:
            cause = log.get('death_cause', 'unknown')
            deaths = log.get('deaths_today', 0)
            
            if cause not in cause_counts:
                cause_counts[cause] = 0
            cause_counts[cause] += deaths
        
        # Convert to list format for pie chart
        cause_data = []
        for cause, count in cause_counts.items():
            if count > 0:
                cause_data.append({
                    'name': cause.capitalize(),
                    'value': count
                })
        
        return cause_data
        
    except Exception as e:
        logger.error("cause_of_death_fetch_failed", integrator_id=integrator_id, period=period, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch cause of death: {str(e)}")


async def get_mortality_log(
    supabase: Client,
    integrator_id: str,
    period: str = "30d"
) -> List[Dict[str, Any]]:
    """
    GET /api/metrics/mortality-log
    Returns detailed mortality log for the integrator's farms
    
    Args:
        supabase: Supabase client instance
        integrator_id: Customer ID (integrator_id)
        period: Time period (30d, 60d, 90d)
        
    Returns:
        List of detailed mortality log entries
    """
    try:
        # Calculate date range
        if period == "30d":
            start_date = datetime.now() - timedelta(days=30)
        elif period == "60d":
            start_date = datetime.now() - timedelta(days=60)
        elif period == "90d":
            start_date = datetime.now() - timedelta(days=90)
        else:
            start_date = datetime.now() - timedelta(days=30)
        
        # Fetch farms for this integrator
        farms_result = supabase.table('farms').select('id, name').eq('integrator_id', integrator_id).execute()
        farms = farms_result.data if farms_result.data else []
        
        if not farms:
            return []
        
        # Fetch daily logs with batch information
        logs_result = supabase.table('daily_logs') \
            .select('farm_id, batch_id, log_date, batch_day, deaths_today, death_cause, cumulative_mortality_pct, health_notes') \
            .in_('farm_id', [f['id'] for f in farms]) \
            .gte('log_date', start_date.date().isoformat()) \
            .is_('deleted_at', None) \
            .order('log_date', desc=True) \
            .execute()
        
        logs = logs_result.data if logs_result.data else []
        
        # Enrich with farm names and calculate daily mortality rate
        log_data = []
        for log in logs:
            farm_id = log['farm_id']
            batch_id = log['batch_id']
            farm_name = next((f['name'] for f in farms if f['id'] == farm_id), 'Unknown')
            
            # Calculate daily mortality rate: (deaths_today / birds_alive_at_start_of_day) * 100
            # birds_alive_at_start_of_day = birds_alive - deaths_today
            deaths_today = log.get('deaths_today', 0)
            
            # Fetch batch information to get birds_alive
            daily_mortality_rate = 0.0
            try:
                batch_result = supabase.table('batches').select('birds_alive').eq('id', batch_id).single().execute()
                if batch_result.data:
                    birds_alive = batch_result.data.get('birds_alive', 0)
                    birds_alive_at_start = birds_alive - deaths_today
                    if birds_alive_at_start > 0:
                        daily_mortality_rate = (deaths_today / birds_alive_at_start) * 100
            except:
                pass
            
            log_data.append({
                'farmName': farm_name,
                'date': log['log_date'],
                'dayNumber': log.get('batch_day', 0),
                'deaths': deaths_today,
                'dailyMortalityRate': daily_mortality_rate,
                'cause': log.get('death_cause'),
                'cumulativePct': log.get('cumulative_mortality_pct', 0),
                'actionTaken': log.get('health_notes')
            })
        
        return log_data
        
    except Exception as e:
        logger.error("mortality_log_fetch_failed", integrator_id=integrator_id, period=period, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch mortality log: {str(e)}")


async def export_mortality_log_csv(
    supabase: Client,
    integrator_id: str,
    period: str = "30d"
) -> str:
    """
    GET /api/metrics/mortality-log/export
    Exports mortality log as CSV
    
    Args:
        supabase: Supabase client instance
        integrator_id: Customer ID (integrator_id)
        period: Time period (30d, 60d, 90d)
        
    Returns:
        CSV string
    """
    try:
        # Get mortality log data
        log_data = await get_mortality_log(supabase, integrator_id, period)
        
        # Generate CSV
        csv_lines = ['Farm,Date,Day#,Deaths,Cause,Cumulative %,Action Taken']
        
        for log in log_data:
            line = f"{log['farmName']},{log['date']},{log['dayNumber']},{log['deaths']},{log['cause'] or ''},{log['cumulativePct']:.1f},{log['actionTaken'] or ''}"
            csv_lines.append(line)
        
        return '\n'.join(csv_lines)
        
    except Exception as e:
        logger.error("mortality_log_export_failed", integrator_id=integrator_id, period=period, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to export mortality log: {str(e)}")
