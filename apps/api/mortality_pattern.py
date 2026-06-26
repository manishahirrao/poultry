"""
PoultryPulse AI - Mortality Pattern Detection API
File: apps/api/mortality_pattern.py
Version: v1.0 | May 2026
Task Reference: TASK-040
Requirements Reference: REQ-016 §16.7, REQ-024 §24.1
"""

from typing import Dict, Any, Optional
from fastapi import HTTPException
from datetime import datetime, timedelta
import sys
import os

# Add the ml directory to the path to import the detector
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml')))
# from mortality_pattern_detector import MortalityPatternDetector

# Initialize detector
# detector = MortalityPatternDetector()


def analyze_mortality_pattern(batch_id: str, supabase_client) -> Dict[str, Any]:
    """
    Analyze mortality patterns for a batch and store results in database.
    
    Args:
        batch_id: UUID of the batch to analyze
        supabase_client: Supabase client instance
        
    Returns:
        Dictionary with pattern detection results
    """
    try:
        # Fetch batch information
        batch_response = supabase_client.table('batches').select('*').eq('id', batch_id).execute()
        
        if not batch_response.data:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        batch = batch_response.data[0]
        
        # Fetch mortality logs for the batch
        mortality_response = supabase_client.table('mortality_logs').select('*').eq('batch_id', batch_id).execute()
        mortality_logs = mortality_response.data
        
        if not mortality_logs:
            return {
                'batch_id': batch_id,
                'detected_pattern': 'unknown',
                'confidence': 0.0,
                'reason': 'No mortality data available',
                'recommendations': {
                    'pattern_hindi': 'अज्ञात - अधिक डेटा की आवश्यकता',
                    'pattern_english': 'Unknown - More data needed',
                    'recommendation_hindi': 'अधिक मृत्यु डेटा एकत्र करें। कारण का विश्लेषण करें।',
                    'recommendation_english': 'Collect more mortality data. Analyze cause patterns.'
                }
            }
        
        # Convert date strings to datetime objects
        for log in mortality_logs:
            if isinstance(log['log_date'], str):
                log['log_date'] = datetime.strptime(log['log_date'], '%Y-%m-%d').date()
        
        if isinstance(batch['doc_placement_date'], str):
            batch['doc_placement_date'] = datetime.strptime(batch['doc_placement_date'], '%Y-%m-%d').date()
        
        # Run pattern detection
        # analysis_result = detector.analyze_batch(batch_id, mortality_logs, batch)
        
        # Phase 1: Mock analysis result
        analysis_result = {
            'detected_pattern': 'unknown',
            'confidence': 0.0,
            'reason': 'Pattern detection is currently disabled (Phase 1).',
            'detection_method': 'mock',
            'recommendations': {
                'pattern_hindi': 'विश्लेषण प्रगति पर है',
                'pattern_english': 'Analysis in progress',
                'recommendation_hindi': 'कृत्रिम बुद्धिमत्ता (AI) जल्द ही उपलब्ध होगी।',
                'recommendation_english': 'AI pattern detection coming soon.'
            },
            'spike_day': None,
            'cause_distribution': {},
            'mortality_rate_7d_avg': 0.0,
            'mortality_rate_today': 0.0
        }
        
        # Store results in database
        pattern_record = {
            'batch_id': batch_id,
            'detected_pattern': analysis_result['detected_pattern'],
            'confidence': analysis_result['confidence'],
            'recommendation_hindi': analysis_result['recommendations']['recommendation_hindi'],
            'recommendation_english': analysis_result['recommendations']['recommendation_english'],
            'detection_method': analysis_result['detection_method'],
            'detection_trigger': 'manual',  # Can be 'abnormal_alert' or 'harvest' in other contexts
            'spike_day': analysis_result.get('spike_day'),
            'cause_distribution': analysis_result.get('cause_distribution'),
            'season': datetime.now().month,
            'fcr_trend': batch.get('current_fcr'),
            'mortality_rate_7d_avg': analysis_result.get('mortality_rate_7d_avg'),
            'mortality_rate_today': analysis_result.get('mortality_rate_today')
        }
        
        # Insert into mortality_patterns table
        supabase_client.table('mortality_patterns').insert(pattern_record).execute()
        
        return {
            'batch_id': batch_id,
            'detected_pattern': analysis_result['detected_pattern'],
            'confidence': analysis_result['confidence'],
            'reason': analysis_result['reason'],
            'detection_method': analysis_result['detection_method'],
            'spike_day': analysis_result.get('spike_day'),
            'cause_distribution': analysis_result.get('cause_distribution'),
            'recommendations': analysis_result['recommendations'],
            'created_at': datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern detection failed: {str(e)}")


def get_latest_pattern(batch_id: str, supabase_client) -> Optional[Dict[str, Any]]:
    """
    Get the latest mortality pattern analysis for a batch.
    
    Args:
        batch_id: UUID of the batch
        supabase_client: Supabase client instance
        
    Returns:
        Dictionary with pattern data or None if not found
    """
    try:
        response = supabase_client.table('mortality_patterns')\
            .select('*')\
            .eq('batch_id', batch_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if response.data:
            return response.data[0]
        return None
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch pattern data: {str(e)}")


def trigger_pattern_detection_on_abnormal_alert(batch_id: str, supabase_client) -> Dict[str, Any]:
    """
    Trigger pattern detection when abnormal mortality alert fires.
    This is called by the database trigger or alert system.
    
    Args:
        batch_id: UUID of the batch with abnormal mortality
        supabase_client: Supabase client instance
        
    Returns:
        Dictionary with pattern detection results
    """
    try:
        # Run pattern detection
        result = analyze_mortality_pattern(batch_id, supabase_client)
        
        # Update the detection trigger to 'abnormal_alert'
        supabase_client.table('mortality_patterns')\
            .update({'detection_trigger': 'abnormal_alert'})\
            .eq('batch_id', batch_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Abnormal alert pattern detection failed: {str(e)}")


def trigger_pattern_detection_on_harvest(batch_id: str, supabase_client) -> Dict[str, Any]:
    """
    Trigger pattern detection when batch is marked as harvested (post-mortem analysis).
    
    Args:
        batch_id: UUID of the harvested batch
        supabase_client: Supabase client instance
        
    Returns:
        Dictionary with pattern detection results
    """
    try:
        # Run pattern detection
        result = analyze_mortality_pattern(batch_id, supabase_client)
        
        # Update the detection trigger to 'harvest'
        supabase_client.table('mortality_patterns')\
            .update({'detection_trigger': 'harvest'})\
            .eq('batch_id', batch_id)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Harvest pattern detection failed: {str(e)}")
