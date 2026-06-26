"""
PoultryPulse AI - Webhook Delivery System
Handles outbound webhook delivery with HMAC-SHA256 signature and retry logic
Requirements: REQ-019 §19.4, TASK-054
"""

import os
import json
import hmac
import hashlib
import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from supabase import create_client, Client

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


class WebhookDeliveryError(Exception):
    """Custom exception for webhook delivery errors"""
    pass


class WebhookDeliverySystem:
    """Handles webhook delivery with HMAC signature and retry logic"""
    
    def __init__(self):
        self.max_retries = 3
        self.retry_delays = [60, 300, 900]  # 1min, 5min, 15min in seconds
    
    def generate_hmac_signature(self, payload: Dict[str, Any], secret: str) -> str:
        """
        Generate HMAC-SHA256 signature for webhook payload
        """
        payload_string = json.dumps(payload, separators=(',', ':'), sort_keys=True)
        signature = hmac.new(
            secret.encode(),
            payload_string.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"sha256={signature}"
    
    async def deliver_webhook(
        self,
        integration_id: str,
        event_type: str,
        event_payload: Dict[str, Any],
        attempt_number: int = 1
    ) -> Dict[str, Any]:
        """
        Deliver webhook to registered endpoint with HMAC signature
        """
        try:
            # Fetch webhook integration details
            integration_response = supabase.table('customer_integrations') \
                .select('*') \
                .eq('id', integration_id) \
                .eq('integration_type', 'webhook') \
                .eq('status', 'active') \
                .single() \
                .execute()
            
            if not integration_response.data:
                raise WebhookDeliveryError(f"Webhook integration {integration_id} not found or inactive")
            
            integration = integration_response.data
            webhook_url = integration.get('webhook_url')
            webhook_secret = integration.get('webhook_secret')
            
            if not webhook_url:
                raise WebhookDeliveryError("Webhook URL not configured")
            
            # Check if this event type is subscribed
            subscribed_events = integration.get('webhook_events', [])
            if event_type not in subscribed_events:
                return {
                    "success": True,
                    "skipped": True,
                    "reason": f"Event type {event_type} not subscribed"
                }
            
            # Generate HMAC signature
            signature = self.generate_hmac_signature(event_payload, webhook_secret)
            
            # Prepare delivery log entry
            delivery_log = {
                'customer_integration_id': integration_id,
                'event_type': event_type,
                'event_payload': event_payload,
                'webhook_url': webhook_url,
                'attempt_number': attempt_number,
                'max_retries': self.max_retries,
                'delivery_status': 'pending',
                'signature_header': signature,
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Create delivery log entry
            log_response = supabase.table('webhook_delivery_log') \
                .insert(delivery_log) \
                .execute()
            
            if not log_response.data:
                raise WebhookDeliveryError("Failed to create delivery log entry")
            
            delivery_id = log_response.data[0]['id']
            
            # Send webhook request
            start_time = datetime.utcnow()
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    'Content-Type': 'application/json',
                    'X-PoultryPulse-Signature': signature,
                    'X-PoultryPulse-Event': event_type,
                    'X-PoultryPulse-Delivery-ID': str(delivery_id)
                }
                
                response = await client.post(
                    webhook_url,
                    json=event_payload,
                    headers=headers
                )
                
                end_time = datetime.utcnow()
                response_time_ms = int((end_time - start_time).total_seconds() * 1000)
                
                # Update delivery log with response
                update_data = {
                    'http_status_code': response.status_code,
                    'response_body': response.text[:1000] if response.text else None,  # Limit to 1000 chars
                    'response_time_ms': response_time_ms,
                    'delivered_at': end_time.isoformat()
                }
                
                if response.status_code in [200, 201, 202, 204]:
                    update_data['delivery_status'] = 'delivered'
                else:
                    update_data['delivery_status'] = 'failed'
                    update_data['error_message'] = f"HTTP {response.status_code}: {response.text[:200]}"
                    
                    # Schedule retry if not max retries
                    if attempt_number < self.max_retries:
                        next_retry_delay = self.retry_delays[min(attempt_number - 1, len(self.retry_delays) - 1)]
                        next_retry_at = end_time + timedelta(seconds=next_retry_delay)
                        update_data['next_retry_at'] = next_retry_at.isoformat()
                        update_data['delivery_status'] = 'retrying'
                
                supabase.table('webhook_delivery_log') \
                    .update(update_data) \
                    .eq('id', delivery_id) \
                    .execute()
                
                return {
                    "success": response.status_code in [200, 201, 202, 204],
                    "status_code": response.status_code,
                    "response_time_ms": response_time_ms,
                    "delivery_id": str(delivery_id),
                    "will_retry": attempt_number < self.max_retries and response.status_code not in [200, 201, 202, 204]
                }
                
        except httpx.TimeoutException:
            # Handle timeout
            supabase.table('webhook_delivery_log') \
                .update({
                    'delivery_status': 'failed',
                    'error_message': 'Request timeout',
                    'delivered_at': datetime.utcnow().isoformat()
                }) \
                .eq('id', delivery_id) \
                .execute()
            
            raise WebhookDeliveryError("Webhook delivery timeout")
            
        except httpx.RequestError as e:
            # Handle network errors
            supabase.table('webhook_delivery_log') \
                .update({
                    'delivery_status': 'failed',
                    'error_message': f'Network error: {str(e)}',
                    'delivered_at': datetime.utcnow().isoformat()
                }) \
                .eq('id', delivery_id) \
                .execute()
            
            raise WebhookDeliveryError(f"Network error: {str(e)}")
            
        except Exception as e:
            raise WebhookDeliveryError(f"Webhook delivery failed: {str(e)}")
    
    async def trigger_webhooks_for_event(
        self,
        customer_id: str,
        event_type: str,
        event_payload: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Trigger all webhooks for a customer that are subscribed to a specific event type
        """
        try:
            # Fetch all active webhook integrations for the customer
            integrations_response = supabase.table('customer_integrations') \
                .select('*') \
                .eq('customer_id', customer_id) \
                .eq('integration_type', 'webhook') \
                .eq('status', 'active') \
                .execute()
            
            integrations = integrations_response.data
            
            if not integrations:
                return []
            
            results = []
            
            # Deliver to each subscribed webhook
            for integration in integrations:
                subscribed_events = integration.get('webhook_events', [])
                
                if event_type in subscribed_events:
                    try:
                        result = await self.deliver_webhook(
                            integration_id=integration['id'],
                            event_type=event_type,
                            event_payload=event_payload
                        )
                        results.append({
                            "integration_id": integration['id'],
                            "webhook_url": integration['webhook_url'],
                            "result": result
                        })
                    except WebhookDeliveryError as e:
                        results.append({
                            "integration_id": integration['id'],
                            "webhook_url": integration['webhook_url'],
                            "error": str(e)
                        })
            
            return results
            
        except Exception as e:
            raise WebhookDeliveryError(f"Failed to trigger webhooks: {str(e)}")
    
    async def process_pending_retries(self):
        """
        Process webhook deliveries that are due for retry
        This should be called by a background job/CRON
        """
        try:
            # Fetch deliveries that are due for retry
            now = datetime.utcnow().isoformat()
            
            pending_response = supabase.table('webhook_delivery_log') \
                .select('*') \
                .eq('delivery_status', 'retrying') \
                .lte('next_retry_at', now) \
                .order('created_at', desc=True) \
                .limit(50) \
                .execute()
            
            pending_deliveries = pending_response.data
            
            if not pending_deliveries:
                return {"processed": 0, "message": "No pending retries"}
            
            processed_count = 0
            
            for delivery in pending_deliveries:
                try:
                    integration_id = delivery['customer_integration_id']
                    event_type = delivery['event_type']
                    event_payload = delivery['event_payload']
                    attempt_number = delivery['attempt_number'] + 1
                    
                    # Delete old delivery log
                    supabase.table('webhook_delivery_log') \
                        .delete() \
                        .eq('id', delivery['id']) \
                        .execute()
                    
                    # Retry delivery
                    result = await self.deliver_webhook(
                        integration_id=integration_id,
                        event_type=event_type,
                        event_payload=event_payload,
                        attempt_number=attempt_number
                    )
                    
                    processed_count += 1
                    
                except WebhookDeliveryError as e:
                    # Mark as failed if max retries exceeded
                    if attempt_number >= self.max_retries:
                        supabase.table('webhook_delivery_log') \
                            .update({
                                'delivery_status': 'failed',
                                'error_message': f'Max retries exceeded: {str(e)}',
                                'delivered_at': datetime.utcnow().isoformat()
                            }) \
                            .eq('id', delivery['id']) \
                            .execute()
            
            return {
                "processed": processed_count,
                "message": f"Processed {processed_count} webhook retries"
            }
            
        except Exception as e:
            raise WebhookDeliveryError(f"Failed to process pending retries: {str(e)}")


# Convenience functions for triggering specific events

async def trigger_batch_created_webhook(customer_id: str, batch_data: Dict[str, Any]):
    """
    Trigger webhook for batch.created event
    """
    delivery_system = WebhookDeliverySystem()
    event_payload = {
        "event": "batch.created",
        "timestamp": datetime.utcnow().isoformat(),
        "data": batch_data
    }
    return await delivery_system.trigger_webhooks_for_event(
        customer_id=customer_id,
        event_type="batch.created",
        event_payload=event_payload
    )


async def trigger_batch_harvested_webhook(customer_id: str, batch_data: Dict[str, Any]):
    """
    Trigger webhook for batch.harvested event
    """
    delivery_system = WebhookDeliverySystem()
    event_payload = {
        "event": "batch.harvested",
        "timestamp": datetime.utcnow().isoformat(),
        "data": batch_data
    }
    return await delivery_system.trigger_webhooks_for_event(
        customer_id=customer_id,
        event_type="batch.harvested",
        event_payload=event_payload
    )


async def trigger_forecast_updated_webhook(customer_id: str, forecast_data: Dict[str, Any]):
    """
    Trigger webhook for forecast.updated event
    """
    delivery_system = WebhookDeliverySystem()
    event_payload = {
        "event": "forecast.updated",
        "timestamp": datetime.utcnow().isoformat(),
        "data": forecast_data
    }
    return await delivery_system.trigger_webhooks_for_event(
        customer_id=customer_id,
        event_type="forecast.updated",
        event_payload=event_payload
    )


async def trigger_alert_fired_webhook(customer_id: str, alert_data: Dict[str, Any]):
    """
    Trigger webhook for alert.fired event
    """
    delivery_system = WebhookDeliverySystem()
    event_payload = {
        "event": "alert.fired",
        "timestamp": datetime.utcnow().isoformat(),
        "data": alert_data
    }
    return await delivery_system.trigger_webhooks_for_event(
        customer_id=customer_id,
        event_type="alert.fired",
        event_payload=event_payload
    )


# Main handler for the edge function
async def handler(event: Dict[str, Any], context: Any):
    """
    Main handler for the webhook delivery edge function
    Can be called by CRON job to process pending retries
    """
    try:
        delivery_system = WebhookDeliverySystem()
        
        # Process pending retries
        result = await delivery_system.process_pending_retries()
        
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
    
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


# For local testing
if __name__ == "__main__":
    import asyncio
    asyncio.run(handler({}, None))
