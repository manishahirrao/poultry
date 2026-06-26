/**
 * FlockIQ - Webhook Registry Endpoint
 * TASK-054: Enterprise ERP Webhook & API Enhancement
 * Requirement Refs: REQ-019 §19.3–19.5
 * 
 * This endpoint creates webhook subscriptions for custom ERP integrations.
 * Allows customers to register webhooks for batch, forecast, and alert events.
 * 
 * Features:
 * - Webhook registry: POST creates a webhook subscription with URL, events list, and HMAC secret
 * - HMAC secret generation for secure webhook delivery verification
 * - Event filtering: batch.created, batch.harvested, forecast.updated, alert.fired
 * - Customer-scoped webhook subscriptions
 * - Validation of webhook URL format
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

interface WebhookSubscriptionRequest {
  webhook_url: string;
  events: string[]; // ['batch.created', 'batch.harvested', 'forecast.updated', 'alert.fired']
  description?: string;
  secret?: string; // Optional: if not provided, one will be generated
}

interface WebhookSubscriptionResponse {
  id: string;
  customer_id: string;
  webhook_url: string;
  events: string[];
  description: string;
  secret: string;
  is_active: boolean;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', user.phone)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const body: WebhookSubscriptionRequest = await request.json();

    // Validate webhook URL
    if (!body.webhook_url || !isValidUrl(body.webhook_url)) {
      return NextResponse.json(
        { error: 'Invalid webhook URL format' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = ['batch.created', 'batch.harvested', 'forecast.updated', 'alert.fired'];
    const invalidEvents = body.events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    if (body.events.length === 0) {
      return NextResponse.json(
        { error: 'At least one event must be specified' },
        { status: 400 }
      );
    }

    // Generate HMAC secret if not provided
    const secret = body.secret || generateHmacSecret();

    // Create webhook subscription
    const { data: webhook, error: webhookError } = await supabase
      .from('customer_integrations')
      .insert({
        customer_id: customer.id,
        integration_type: 'webhook',
        config: {
          webhook_url: body.webhook_url,
          events: body.events,
          description: body.description || '',
          secret: secret,
        },
        is_active: true,
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Error creating webhook subscription:', webhookError);
      return NextResponse.json(
        { error: 'Failed to create webhook subscription' },
        { status: 500 }
      );
    }

    const response: WebhookSubscriptionResponse = {
      id: webhook.id,
      customer_id: webhook.customer_id,
      webhook_url: webhook.config.webhook_url,
      events: webhook.config.events,
      description: webhook.config.description,
      secret: webhook.config.secret,
      is_active: webhook.is_active,
      created_at: webhook.created_at,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating webhook subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list webhooks for a customer
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', user.phone)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch webhook subscriptions
    const { data: webhooks, error: webhooksError } = await supabase
      .from('customer_integrations')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('integration_type', 'webhook')
      .order('created_at', { ascending: false });

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      return NextResponse.json(
        { error: 'Failed to fetch webhooks' },
        { status: 500 }
      );
    }

    const response = webhooks.map(webhook => ({
      id: webhook.id,
      webhook_url: webhook.config.webhook_url,
      events: webhook.config.events,
      description: webhook.config.description,
      is_active: webhook.is_active,
      created_at: webhook.created_at,
      updated_at: webhook.updated_at,
    }));

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateHmacSecret(): string {
  return randomBytes(32).toString('hex');
}
