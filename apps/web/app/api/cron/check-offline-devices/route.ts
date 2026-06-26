/**
 * FlockIQ Device Offline Monitor (Cron Job)
 * Route: /api/cron/check-offline-devices
 * Schedule: Every 30 minutes
 * 
 * Description:
 * - Finds devices that haven't reported in 30+ minutes
 * - Sends WhatsApp alert to integrator
 * - Marks device status as 'error'
 * 
 * Design Reference: specs/iot device.md PART 6
 * 
 * Security: Requires CRON_SECRET header for authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AnomalyFlag } from '@poultrypulse/types';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Security check: Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Initialize Supabase client with service role key (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Find active devices with no reading in the last 30 minutes
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: offlineDevices, error: fetchError } = await supabase
      .from('iot_devices')
      .select('device_uuid, farm_id, label, integrator_id')
      .eq('status', 'active')
      .lt('last_seen_at', cutoff);

    if (fetchError) {
      console.error('[OFFLINE CHECK] Database error:', fetchError);
      return NextResponse.json(
        { error: 'Database error', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!offlineDevices?.length) {
      return NextResponse.json({ checked: true, offline: 0 });
    }

    console.log(`[OFFLINE CHECK] Found ${offlineDevices.length} offline devices`);

    // Process each offline device
    const results = await Promise.allSettled(
      offlineDevices.map(async (device: { device_uuid: string; farm_id: string; label: string | null; integrator_id: string }) => {
        // Mark device as error status
        const { error: updateError } = await supabase
          .from('iot_devices')
          .update({ status: 'error' })
          .eq('device_uuid', device.device_uuid);

        if (updateError) {
          console.error(`[OFFLINE CHECK] Failed to update device ${device.device_uuid}:`, updateError);
          throw updateError;
        }

        // Send WhatsApp alert
        await sendOfflineAlert(device, supabase);

        return device.device_uuid;
      })
    );

    // Count successes and failures
    const successful = results.filter((r: PromiseSettledResult<string>) => r.status === 'fulfilled').length;
    const failed = results.filter((r: PromiseSettledResult<string>) => r.status === 'rejected').length;

    return NextResponse.json({
      checked: true,
      offline: offlineDevices.length,
      processed: successful,
      failed,
      devices: offlineDevices.map((d: { device_uuid: string }) => d.device_uuid),
    });

  } catch (err) {
    console.error('[OFFLINE CHECK] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send WhatsApp alert for offline device
 */
async function sendOfflineAlert(
  device: {
    device_uuid: string;
    farm_id: string;
    label: string | null;
    integrator_id: string;
  },
  supabase: any
): Promise<void> {
  try {
    // Get farm + integrator contact details
    const { data: farm } = await supabase
      .from('farms')
      .select(`
        id, name,
        customers (
          id,
          profiles (full_name, whatsapp_phone, whatsapp_lang)
        )
      `)
      .eq('id', device.farm_id)
      .single();

    if (!farm) {
      console.warn(`[OFFLINE CHECK] Farm not found: ${device.farm_id}`);
      return;
    }

    const integrator = (farm as Record<string, unknown>).customers as {
      profiles: { full_name: string; whatsapp_phone: string; whatsapp_lang: string };
    } | null;

    if (!integrator?.profiles?.whatsapp_phone) {
      console.warn(`[OFFLINE CHECK] No WhatsApp contact for farm ${device.farm_id}`);
      return;
    }

    const recipientPhone = integrator.profiles.whatsapp_phone;
    const farmName = (farm as Record<string, unknown>).name as string;
    const deviceLabel = device.label || device.device_uuid;

    // Check cooldown - don't spam alerts for the same device
    const cooldownStart = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour cooldown

    const { data: recentAlert } = await supabase
      .from('iot_alert_log')
      .select('id')
      .eq('device_uuid', device.device_uuid)
      .eq('alert_type', 'DEVICE_OFFLINE')
      .gte('sent_at', cooldownStart)
      .limit(1)
      .maybeSingle();

    if (recentAlert) {
      console.log(`[OFFLINE CHECK] Cooldown active for DEVICE_OFFLINE on ${device.device_uuid}`);
      return;
    }

    // Build alert message
    const message = [
      `⚠️ *FlockIQ Device Alert — ${farmName}*`,
      ``,
      `📡 *Sensor Node Offline*`,
      `Device: ${deviceLabel}`,
      `No data received in the last 30 minutes.`,
      ``,
      `Action required: Check power supply, Wi-Fi/SIM connection, and device status.`,
    ].join('\n');

    // Send WhatsApp alert
    await sendWhatsAppAlert(recipientPhone, message);

    // Log the alert
    await supabase.from('iot_alert_log').insert({
      device_uuid: device.device_uuid,
      farm_id: device.farm_id,
      alert_type: 'DEVICE_OFFLINE' as AnomalyFlag,
      threshold_value: 30, // minutes
      actual_value: 30, // minutes
      channel: 'whatsapp',
      recipient_phone: recipientPhone,
      message_body: message,
      delivery_status: 'sent',
    });

    console.log(`[OFFLINE CHECK] Sent DEVICE_OFFLINE alert for ${device.device_uuid}`);

  } catch (err) {
    console.error(`[OFFLINE CHECK] Failed to send alert for ${device.device_uuid}:`, err);
    // Log failed attempt
    try {
      await supabase.from('iot_alert_log').insert({
        device_uuid: device.device_uuid,
        farm_id: device.farm_id,
        alert_type: 'DEVICE_OFFLINE' as AnomalyFlag,
        threshold_value: 30,
        actual_value: 30,
        channel: 'whatsapp',
        recipient_phone: null,
        message_body: 'Failed to send alert',
        delivery_status: 'failed',
      });
    } catch {
      // Ignore logging errors
    }
  }
}

/**
 * Send WhatsApp message using Facebook Graph API
 */
async function sendWhatsAppAlert(phone: string, message: string): Promise<void> {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace(/\D/g, ''), // strip non-digits
        type: 'text',
        text: { body: message, preview_url: false },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`WhatsApp API error: ${JSON.stringify(err)}`);
  }
}
