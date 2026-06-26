"""
PoultryPulse AI — IoT Device Handler
File: apps/api/iot_handler.py
Version: v1.0 | June 2026
Description: Handles IoT device authentication and reading ingestion
Requirements: REQ-018 §18.1–18.4, Design Addendum §17.1
Task: TASK-049
"""

from typing import Dict, Any, Optional
from fastapi import HTTPException, Request
from supabase import Client
import structlog

logger = structlog.get_logger()


async def verify_device_api_key(request: Request, supabase: Client) -> Dict[str, Any]:
    """
    Verifies device API key from X-API-Key header.
    Returns device information if valid, raises HTTPException if invalid.
    
    Args:
        request: FastAPI request object
        supabase: Supabase client
        
    Returns:
        Dict containing device_id, customer_id, shed_id, device_type
        
    Raises:
        HTTPException: If API key is missing or invalid
    """
    api_key = request.headers.get("X-API-Key")
    
    if not api_key:
        logger.warning("iot_api_key_missing")
        raise HTTPException(status_code=401, detail="API key required")
    
    if not api_key.startswith("pp_iot_"):
        logger.warning("iot_api_key_invalid_format", api_key_prefix=api_key[:10])
        raise HTTPException(status_code=401, detail="Invalid API key format")
    
    try:
        # Query device by API key
        response = supabase.table("iot_devices").select(
            "id", "customer_id", "shed_id", "device_type", "device_name", "status"
        ).eq("api_key", api_key).single()
        
        if response.data is None:
            logger.warning("iot_api_key_not_found", api_key_prefix=api_key[:10])
            raise HTTPException(status_code=401, detail="Invalid API key")
        
        device = response.data
        
        # Check if device is active
        if device.get("status") == "error":
            logger.error("iot_device_error_state", device_id=device["id"])
            raise HTTPException(status_code=503, detail="Device is in error state")
        
        logger.info(
            "iot_device_authenticated",
            device_id=device["id"],
            device_name=device["device_name"],
            device_type=device["device_type"],
            customer_id=device["customer_id"]
        )
        
        return {
            "device_id": device["id"],
            "customer_id": device["customer_id"],
            "shed_id": device["shed_id"],
            "device_type": device["device_type"],
            "device_name": device["device_name"]
        }
        
    except Exception as e:
        if "401" in str(e) or "PGRST116" in str(e):
            logger.warning("iot_api_key_not_found", api_key_prefix=api_key[:10])
            raise HTTPException(status_code=401, detail="Invalid API key")
        logger.error("iot_authentication_error", error=str(e))
        raise HTTPException(status_code=500, detail="Authentication failed")


async def ingest_iot_reading(
    device_info: Dict[str, Any],
    reading_data: Dict[str, Any],
    supabase: Client
) -> Dict[str, Any]:
    """
    Ingests IoT reading data into the database.
    Validates reading data based on device type and inserts into iot_readings table.
    
    Args:
        device_info: Device information from verify_device_api_key
        reading_data: Reading data from request body
        supabase: Supabase client
        
    Returns:
        Dict with success status and reading_id
        
    Raises:
        HTTPException: If validation fails or insertion fails
    """
    device_type = device_info["device_type"]
    device_id = device_info["device_id"]
    customer_id = device_info["customer_id"]
    shed_id = device_info["shed_id"]
    
    # Build reading record based on device type
    reading_record = {
        "device_id": device_id,
        "customer_id": customer_id,
        "shed_id": shed_id,
        "reading_at": reading_data.get("reading_at")  # Optional, defaults to NOW()
    }
    
    # Validate and add fields based on device type
    if device_type == "environment_sensor":
        # Environment sensor: temperature, humidity, ammonia
        if "temperature_c" in reading_data:
            temp = reading_data["temperature_c"]
            if not isinstance(temp, (int, float)) or temp < -50 or temp > 100:
                raise HTTPException(status_code=400, detail="Invalid temperature value")
            reading_record["temperature_c"] = temp
        
        if "humidity_pct" in reading_data:
            humidity = reading_data["humidity_pct"]
            if not isinstance(humidity, (int, float)) or humidity < 0 or humidity > 100:
                raise HTTPException(status_code=400, detail="Invalid humidity value")
            reading_record["humidity_pct"] = humidity
        
        if "ammonia_ppm" in reading_data:
            ammonia = reading_data["ammonia_ppm"]
            if not isinstance(ammonia, (int, float)) or ammonia < 0 or ammonia > 500:
                raise HTTPException(status_code=400, detail="Invalid ammonia value")
            reading_record["ammonia_ppm"] = ammonia
    
    elif device_type == "water_meter":
        # Water meter: flow rate, total volume
        if "water_flow_litres_per_min" in reading_data:
            flow = reading_data["water_flow_litres_per_min"]
            if not isinstance(flow, (int, float)) or flow < 0 or flow > 1000:
                raise HTTPException(status_code=400, detail="Invalid flow rate value")
            reading_record["water_flow_litres_per_min"] = flow
        
        if "water_total_litres" in reading_data:
            total = reading_data["water_total_litres"]
            if not isinstance(total, (int, float)) or total < 0:
                raise HTTPException(status_code=400, detail="Invalid total volume value")
            reading_record["water_total_litres"] = total
    
    elif device_type == "auto_weighing_scale":
        # Auto-weighing scale: weight, bird count
        if "weight_kg" in reading_data:
            weight = reading_data["weight_kg"]
            if not isinstance(weight, (int, float)) or weight < 0 or weight > 100:
                raise HTTPException(status_code=400, detail="Invalid weight value")
            reading_record["weight_kg"] = weight
        
        if "bird_count" in reading_data:
            count = reading_data["bird_count"]
            if not isinstance(count, int) or count < 0 or count > 100000:
                raise HTTPException(status_code=400, detail="Invalid bird count value")
            reading_record["bird_count"] = count
    
    elif device_type == "feed_silo_sensor":
        # Feed silo sensor: level percentage, weight
        if "feed_level_percent" in reading_data:
            level = reading_data["feed_level_percent"]
            if not isinstance(level, (int, float)) or level < 0 or level > 100:
                raise HTTPException(status_code=400, detail="Invalid feed level value")
            reading_record["feed_level_percent"] = level
        
        if "feed_weight_kg" in reading_data:
            weight = reading_data["feed_weight_kg"]
            if not isinstance(weight, (int, float)) or weight < 0:
                raise HTTPException(status_code=400, detail="Invalid feed weight value")
            reading_record["feed_weight_kg"] = weight
    
    # Add optional metadata fields
    if "battery_level_pct" in reading_data:
        reading_record["battery_level_pct"] = reading_data["battery_level_pct"]
    
    if "signal_strength" in reading_data:
        reading_record["signal_strength"] = reading_data["signal_strength"]
    
    if "device_status" in reading_data:
        reading_record["device_status"] = reading_data["device_status"]
    
    if "additional_data" in reading_data:
        reading_record["additional_data"] = reading_data["additional_data"]
    
    try:
        # Insert reading into database
        response = supabase.table("iot_readings").insert(reading_record).execute()
        
        if response.data is None or len(response.data) == 0:
            logger.error("iot_reading_insert_failed", device_id=device_id)
            raise HTTPException(status_code=500, detail="Failed to insert reading")
        
        reading_id = response.data[0]["id"]
        
        logger.info(
            "iot_reading_ingested",
            reading_id=reading_id,
            device_id=device_id,
            device_type=device_type,
            shed_id=shed_id
        )
        
        return {
            "success": True,
            "reading_id": str(reading_id),
            "device_id": str(device_id),
            "message": "Reading ingested successfully"
        }
        
    except Exception as e:
        logger.error("iot_reading_insert_error", device_id=device_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to insert reading: {str(e)}")


async def get_device_readings(
    device_id: str,
    customer_id: str,
    supabase: Client,
    hours: int = 24
) -> Dict[str, Any]:
    """
    Retrieves IoT device readings for the specified time period.
    
    Args:
        device_id: Device UUID
        customer_id: Customer UUID for authorization
        hours: Number of hours of historical data to retrieve (default: 24)
        supabase: Supabase client
        
    Returns:
        Dict with readings data
        
    Raises:
        HTTPException: If authorization fails or query fails
    """
    try:
        # Query readings for the device
        response = supabase.table("iot_readings").select("*").eq("device_id", device_id).eq("customer_id", customer_id).gte("reading_at", f"now() - '{hours} hours'::interval").order("reading_at", desc=True).limit(1000).execute()
        
        if response.data is None:
            return {"readings": [], "count": 0}
        
        logger.info(
            "iot_device_readings_retrieved",
            device_id=device_id,
            customer_id=customer_id,
            hours=hours,
            count=len(response.data)
        )
        
        return {
            "readings": response.data,
            "count": len(response.data)
        }
        
    except Exception as e:
        logger.error("iot_readings_query_error", device_id=device_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to retrieve readings: {str(e)}")


async def get_shed_environment_summary(
    customer_id: str,
    shed_id: str,
    supabase: Client
) -> Dict[str, Any]:
    """
    Retrieves current environment summary for a shed (latest readings from all devices).
    
    Args:
        customer_id: Customer UUID
        shed_id: Shed ID
        supabase: Supabase client
        
    Returns:
        Dict with current environment metrics
        
    Raises:
        HTTPException: If query fails
    """
    try:
        # Get latest readings for the shed
        response = supabase.table("iot_readings").select("*").eq("customer_id", customer_id).eq("shed_id", shed_id).gte("reading_at", f"now() - '1 hour'::interval").order("reading_at", desc=True).limit(100).execute()
        
        if response.data is None:
            return {
                "shed_id": shed_id,
                "temperature_c": None,
                "humidity_pct": None,
                "ammonia_ppm": None,
                "last_updated": None,
                "devices_online": 0
            }
        
        # Get latest reading for each metric
        latest_temp = None
        latest_humidity = None
        latest_ammonia = None
        last_updated = None
        devices_online = set()
        
        for reading in response.data:
            devices_online.add(reading["device_id"])
            if reading.get("temperature_c") is not None:
                latest_temp = reading["temperature_c"]
            if reading.get("humidity_pct") is not None:
                latest_humidity = reading["humidity_pct"]
            if reading.get("ammonia_ppm") is not None:
                latest_ammonia = reading["ammonia_ppm"]
            if last_updated is None or reading["reading_at"] > last_updated:
                last_updated = reading["reading_at"]
        
        logger.info(
            "iot_shed_environment_summary",
            shed_id=shed_id,
            customer_id=customer_id,
            devices_online=len(devices_online)
        )
        
        return {
            "shed_id": shed_id,
            "temperature_c": latest_temp,
            "humidity_pct": latest_humidity,
            "ammonia_ppm": latest_ammonia,
            "last_updated": last_updated,
            "devices_online": len(devices_online)
        }
        
    except Exception as e:
        logger.error("iot_shed_summary_error", shed_id=shed_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to retrieve shed summary: {str(e)}")
