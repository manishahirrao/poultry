"""
PoultryPulse AI — Rate Limiter Middleware
File: apps/api/security/rate_limiter.py
Reference: TRD v1.0 §7.1, REQ-008 §8.1, §8.3
Upstash Redis-based rate limiting with per-endpoint tracking for API Console.
"""

import time
import logging
import os
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

# Upstash Redis configuration
UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL")
UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")

# Fallback to in-memory if Upstash not configured
USE_UPSTASH = bool(UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)

# Basic in-memory rate limiting for Phase 0 (fallback)
# Maps API key -> {endpoint: {date: count}}
in_memory_usage = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
in_memory_rate_limits = defaultdict(lambda: [60, time.time()])

MAX_TOKENS = 60
REFILL_RATE = 1  # 1 token per second

# Default quotas (can be overridden per customer)
DEFAULT_DAILY_QUOTA = 1000
DEFAULT_MONTHLY_QUOTA = 30000

def mask_api_key(api_key: str) -> str:
    """
    Mask API key for security (SEC-005).
    Format: sk-pp-****...{last4chars}
    """
    if not api_key or len(api_key) < 8:
        return "****"
    return f"sk-pp-****...{api_key[-4:]}"

async def increment_usage_count(api_key: str, endpoint: str, date: str) -> None:
    """
    Increment usage count for a specific API key, endpoint, and date.
    Stored in Upstash Redis with key: ratelimit:{api_key}:{endpoint}:{date}
    """
    if USE_UPSTASH:
        try:
            import httpx
            key = f"ratelimit:{api_key}:{endpoint}:{date}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{UPSTASH_REDIS_REST_URL}/incr/{key}",
                    headers={
                        "Authorization": f"Bearer {UPSTASH_REDIS_REST_TOKEN}"
                    },
                    timeout=5.0
                )
                
                # Set expiry to 30 days (2592000 seconds)
                await client.post(
                    f"{UPSTASH_REDIS_REST_URL}/expire/{key}",
                    params={"ex": 2592000},
                    headers={
                        "Authorization": f"Bearer {UPSTASH_REDIS_REST_TOKEN}"
                    },
                    timeout=5.0
                )
        except Exception as e:
            logger.error(f"Upstash Redis increment failed: {e}")
            # Fallback to in-memory
            in_memory_usage[api_key][endpoint][date] += 1
    else:
        # Fallback to in-memory
        in_memory_usage[api_key][endpoint][date] += 1

async def get_usage_count(api_key: str, endpoint: str, date: str) -> int:
    """
    Get usage count for a specific API key, endpoint, and date.
    """
    if USE_UPSTASH:
        try:
            import httpx
            key = f"ratelimit:{api_key}:{endpoint}:{date}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{UPSTASH_REDIS_REST_URL}/get/{key}",
                    headers={
                        "Authorization": f"Bearer {UPSTASH_REDIS_REST_TOKEN}"
                    },
                    timeout=5.0
                )
                
                if response.status_code == 200 and response.text:
                    return int(response.text)
        except Exception as e:
            logger.error(f"Upstash Redis get failed: {e}")
    
    # Fallback to in-memory
    return in_memory_usage[api_key][endpoint][date]

async def get_all_usage_by_endpoint(api_key: str, date: str) -> dict:
    """
    Get usage counts for all endpoints for a specific API key and date.
    """
    if USE_UPSTASH:
        try:
            import httpx
            # Scan for keys matching pattern
            pattern = f"ratelimit:{api_key}:*:{date}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{UPSTASH_REDIS_REST_URL}/keys",
                    params={"pattern": pattern},
                    headers={
                        "Authorization": f"Bearer {UPSTASH_REDIS_REST_TOKEN}"
                    },
                    timeout=5.0
                )
                
                if response.status_code == 200 and response.json():
                    keys = response.json()
                    result = {}
                    for key in keys:
                        # Extract endpoint from key format: ratelimit:{api_key}:{endpoint}:{date}
                        parts = key.split(":")
                        if len(parts) >= 4:
                            endpoint = parts[2]
                            count = await get_usage_count(api_key, endpoint, date)
                            result[endpoint] = count
                    return result
        except Exception as e:
            logger.error(f"Upstash Redis scan failed: {e}")
    
    # Fallback to in-memory
    return dict(in_memory_usage[api_key][date])

class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract API key for enterprise routes
        api_key = request.headers.get("X-API-Key")
        path = request.url.path
        
        # Don't limit healthchecks and public routes
        if path == "/health" or path.startswith("/docs") or path.startswith("/redoc"):
            return await call_next(request)
        
        # For enterprise routes with API keys, track usage
        if api_key and (path.startswith("/v2/") or path.startswith("/api/v2/")):
            # Get current date for tracking
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Increment usage count for this endpoint
            await increment_usage_count(api_key, path, today)
            
            # Check rate limits (simplified - in production would check against quota)
            # For now, just track usage without blocking
            response = await call_next(request)
            
            # Add rate limit headers (per TRD §7.1)
            # In production, these would be calculated from actual quota
            response.headers["X-RateLimit-Remaining"] = "999"
            response.headers["X-RateLimit-Limit"] = "1000"
            
            return response
        
        # For non-enterprise routes, use basic IP-based rate limiting
        client_ip = request.client.host if request.client else "unknown"
        
        now = time.time()
        tokens, last_refill = in_memory_rate_limits[client_ip]
        
        # Refill tokens
        time_passed = now - last_refill
        tokens = min(MAX_TOKENS, tokens + time_passed * REFILL_RATE)
        
        if tokens < 1.0:
            logger.warning(f"Rate limit exceeded for IP {client_ip}")
            return JSONResponse(
                {"error": "Too Many Requests. Please try again later."},
                status_code=429,
                headers={
                    "Retry-After": "1",
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Limit": str(MAX_TOKENS)
                }
            )
        
        # Consume token
        in_memory_rate_limits[client_ip] = [tokens - 1.0, now]
        
        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(int(tokens))
        response.headers["X-RateLimit-Limit"] = str(MAX_TOKENS)
        
        return response
