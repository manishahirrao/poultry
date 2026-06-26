"""
PoultryPulse AI — Flock Benchmarking API
File: apps/api/benchmark.py
Version: v1.0 | June 2026
Task: TASK-GAP5-API-001
Requirements: REQ-GAP5-BENCH-001 through REQ-GAP5-BENCH-007
Description: API endpoints for flock benchmarking with breed/region/size filters
"""

from typing import Dict, Any, Optional, List
from fastapi import HTTPException, Request
from supabase import Client
import structlog
from datetime import datetime, date, timedelta
from decimal import Decimal
import httpx
import os

logger = structlog.get_logger()

# Anthropic API configuration
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"


async def get_benchmark_data(
    supabase: Client,
    customer_id: str,
    breed: str = "All",
    region: str = "All India",
    flock_size_cat: str = "All",
    period: str = "last_3_batches",
    farm_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get benchmark data for the authenticated user's farms compared to peer groups.
    
    Args:
        supabase: Supabase client instance
        customer_id: Customer ID from JWT token (integrator_id)
        breed: Filter by breed (default: "All")
        region: Filter by region (default: "All India")
        flock_size_cat: Filter by flock size category (default: "All")
        period: Time period for comparison (default: "last_3_batches")
        farm_id: Optional specific farm ID to filter user's data
        
    Returns:
        Dictionary containing:
        - user_metrics: User's own farm performance for selected period
        - benchmark: Benchmark data from aggregated_benchmarks table
        - sample_count: Number of farms in the comparison group
        - privacy_minimum_met: Boolean (false if sample_count < 10)
    """
    try:
        # Determine limit based on period
        if period == "last_batch":
            batch_limit = 1
        elif period == "last_3_batches":
            batch_limit = 3
        elif period == "last_6_batches":
            batch_limit = 6
        elif period == "last_12_months":
            batch_limit = 100  # Will be filtered by date
        else:
            batch_limit = 3
        
        # Build query for user's own metrics
        user_query = supabase.table('batches').select('*') \
            .eq('integrator_id', customer_id) \
            .eq('status', 'harvested') \
            .is_('deleted_at', None)
        
        if farm_id:
            user_query = user_query.eq('farm_id', farm_id)
        
        if breed != "All":
            user_query = user_query.ilike('breed', f'%{breed}%')
        
        if period == "last_12_months":
            # Filter by batch_closed_at within last 12 months
            cutoff_date = datetime.now() - timedelta(days=365)
            user_query = user_query.gte('batch_closed_at', cutoff_date.isoformat())
        
        # Apply limit and order
        user_query = user_query.order('batch_closed_at', desc=True).limit(batch_limit)
        
        user_result = user_query.execute()
        
        if not user_result.data:
            # No completed batches for this user
            return {
                "user_metrics": None,
                "benchmark": [],
                "sample_count": 0,
                "privacy_minimum_met": False,
                "message": "No completed batches found. Complete your first batch to see benchmarks."
            }
        
        user_batches = user_result.data
        
        # Calculate user metrics
        user_metrics = {
            "fcr": round(float(sum(b.get('fcr', 0) or 0 for b in user_batches)) / len(user_batches), 2),
            "mortality_pct": round(float(sum(b.get('mortality_pct', 0) or 0 for b in user_batches)) / len(user_batches), 2),
            "adg_g": round(float(sum(b.get('adg_g', 0) or 0 for b in user_batches)) / len(user_batches), 2),
            "harvest_weight_kg": round(float(sum(b.get('harvest_weight_kg', 0) or 0 for b in user_batches)) / len(user_batches), 2),
            "batch_duration_days": round(float(sum(b.get('batch_duration_days', 0) or 0 for b in user_batches)) / len(user_batches), 2),
            "gross_margin_pct": round(float(sum(b.get('gross_margin_pct', 0) or 0 for b in user_batches)) / len(user_batches), 2),
            "batch_count": len(user_batches)
        }
        
        # Fetch benchmark data from aggregated_benchmarks table
        benchmark_query = supabase.table('aggregated_benchmarks').select('*') \
            .eq('breed', breed) \
            .eq('region', region) \
            .eq('flock_size_cat', flock_size_cat) \
            .eq('period', period)
        
        benchmark_result = benchmark_query.execute()
        
        benchmark_data = benchmark_result.data if benchmark_result.data else []
        
        # Calculate sample_count (minimum across all metrics)
        sample_count = 0
        if benchmark_data:
            sample_count = min(b.get('sample_count', 0) for b in benchmark_data)
        
        privacy_minimum_met = sample_count >= 10
        
        logger.info(
            "benchmark_data_retrieved",
            customer_id=customer_id,
            breed=breed,
            region=region,
            flock_size_cat=flock_size_cat,
            period=period,
            sample_count=sample_count,
            privacy_minimum_met=privacy_minimum_met
        )
        
        return {
            "user_metrics": user_metrics,
            "benchmark": benchmark_data,
            "sample_count": sample_count,
            "privacy_minimum_met": privacy_minimum_met
        }
        
    except Exception as e:
        logger.error(
            "benchmark_data_fetch_failed",
            customer_id=customer_id,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail=f"Failed to fetch benchmark data: {str(e)}")


async def generate_benchmark_insights(
    user_metrics: Dict[str, Any],
    benchmark_data: List[Dict[str, Any]],
    filters: Dict[str, Any]
) -> Dict[str, str]:
    """
    Generate AI-powered benchmark insights using Claude Sonnet API.
    
    Args:
        user_metrics: User's own farm performance metrics
        benchmark_data: Benchmark comparison data
        filters: Applied filters (breed, region, flock_size_cat, period)
        
    Returns:
        Dictionary with 4 insight keys:
        - strength: What the user is doing well
        - improvement: Areas for improvement
        - context: Benchmark context/interpretation
        - action: Specific actionable recommendation
    """
    try:
        if not ANTHROPIC_API_KEY:
            # Fallback to template-based insights if no API key
            return generate_template_insights(user_metrics, benchmark_data)
        
        # Prepare prompt for Claude
        system_prompt = """You are a poultry farm performance analyst. Generate 4 concise benchmark insights (max 60 words each). Return ONLY valid JSON: {"strength":"...","improvement":"...","context":"...","action":"..."}. Focus on commercial broiler farming metrics like FCR, mortality, ADG, weight, duration, and margin."""
        
        user_prompt = f"""User metrics: {user_metrics}
Group benchmark: {benchmark_data}
Filters: {filters}
Generate 4 specific, actionable insights for a commercial broiler farm."""
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 400,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(ANTHROPIC_API_URL, headers=headers, json=payload)
            
            if response.status_code != 200:
                logger.error(
                    "anthropic_api_failed",
                    status_code=response.status_code,
                    response_text=response.text
                )
                return generate_template_insights(user_metrics, benchmark_data)
            
            result = response.json()
            
            # Extract content from response
            content = result.get("content", [])
            if not content:
                return generate_template_insights(user_metrics, benchmark_data)
            
            text_content = content[0].get("text", "")
            
            # Parse JSON from the response
            try:
                import json
                insights = json.loads(text_content)
                
                # Validate structure
                required_keys = ["strength", "improvement", "context", "action"]
                if all(key in insights for key in required_keys):
                    return insights
                else:
                    return generate_template_insights(user_metrics, benchmark_data)
                    
            except json.JSONDecodeError:
                logger.error("anthropic_json_parse_failed", content=text_content)
                return generate_template_insights(user_metrics, benchmark_data)
                
    except Exception as e:
        logger.error(
            "benchmark_insights_generation_failed",
            error=str(e)
        )
        return generate_template_insights(user_metrics, benchmark_data)


def generate_template_insights(
    user_metrics: Dict[str, Any],
    benchmark_data: List[Dict[str, Any]]
) -> Dict[str, str]:
    """
    Generate template-based insights as fallback when AI API fails.
    
    Args:
        user_metrics: User's own farm performance metrics
        benchmark_data: Benchmark comparison data
        
    Returns:
        Dictionary with 4 insight keys based on metric comparisons
    """
    # Find benchmark averages for comparison
    benchmark_avg = {}
    for metric in ["fcr", "mortality_pct", "adg_g", "harvest_weight_kg", "batch_duration_days", "gross_margin_pct"]:
        metric_data = [b for b in benchmark_data if b.get("metric_name") == metric]
        if metric_data:
            benchmark_avg[metric] = metric_data[0].get("p50_value", 0)
        else:
            benchmark_avg[metric] = 0
    
    # Generate insights based on comparisons
    insights = {
        "strength": "",
        "improvement": "",
        "context": "",
        "action": ""
    }
    
    # Strength: Find best performing metric
    if user_metrics:
        if user_metrics.get("mortality_pct", 0) < benchmark_avg.get("mortality_pct", 5):
            insights["strength"] = f"Your mortality rate of {user_metrics['mortality_pct']:.1f}% is excellent compared to the group average of {benchmark_avg['mortality_pct']:.1f}%."
        elif user_metrics.get("fcr", 0) < benchmark_avg.get("fcr", 2):
            insights["strength"] = f"Your FCR of {user_metrics['fcr']:.2f} is better than the group average of {benchmark_avg['fcr']:.2f}, indicating efficient feed conversion."
        elif user_metrics.get("gross_margin_pct", 0) > benchmark_avg.get("gross_margin_pct", 15):
            insights["strength"] = f"Your gross margin of {user_metrics['gross_margin_pct']:.1f}% exceeds the group average of {benchmark_avg['gross_margin_pct']:.1f}%."
        else:
            insights["strength"] = "Your farm shows consistent performance across key metrics. Continue monitoring for optimization opportunities."
    
    # Improvement: Find worst performing metric
    if user_metrics:
        if user_metrics.get("fcr", 0) > benchmark_avg.get("fcr", 2) * 1.1:
            insights["improvement"] = f"Your FCR of {user_metrics['fcr']:.2f} is above the group average. Focus on feed quality and bird health to improve feed efficiency."
        elif user_metrics.get("mortality_pct", 0) > benchmark_avg.get("mortality_pct", 3):
            insights["improvement"] = f"Your mortality rate of {user_metrics['mortality_pct']:.1f}% is higher than average. Review biosecurity and vaccination protocols."
        elif user_metrics.get("adg_g", 0) < benchmark_avg.get("adg_g", 45):
            insights["improvement"] = f"Your ADG of {user_metrics['adg_g']:.1f}g/day is below average. Consider nutrition and environment optimization."
        else:
            insights["improvement"] = "Monitor feed conversion ratio and mortality rates closely for potential efficiency gains."
    
    # Context: Provide benchmark context
    if benchmark_data:
        sample_count = benchmark_data[0].get("sample_count", 0) if benchmark_data else 0
        if sample_count >= 10:
            insights["context"] = f"This benchmark compares your performance against {sample_count} similar farms with matching breed, region, and flock size criteria."
        else:
            insights["context"] = "Benchmark data is limited. More farms in your category will improve comparison accuracy over time."
    else:
        insights["context"] = "Benchmark data is being populated. Your performance will be compared against similar farms as more data becomes available."
    
    # Action: Specific recommendation
    if user_metrics:
        if user_metrics.get("fcr", 0) > 2.0:
            insights["action"] = "Review feed formulation and ensure proper feed storage. Consider consulting with a nutritionist for FCR optimization."
        elif user_metrics.get("mortality_pct", 0) > 3.0:
            insights["action"] = "Strengthen biosecurity measures and ensure vaccination schedule compliance. Monitor bird health daily."
        else:
            insights["action"] = "Continue tracking daily metrics and compare against benchmarks weekly to identify trends early."
    else:
        insights["action"] = "Complete your first batch to unlock personalized benchmark insights and recommendations."
    
    return insights
