// FlockIQ — Notification Service
// File: apps/web/lib/notifications.ts
// Version: v1.0 | May 2026
// Task Reference: Notification service for WhatsApp and email
// Design Reference: FlockIQ_TRD_v1.md §6 (WhatsApp Channel)

interface NotificationConfig {
  enabled: boolean;
  provider?: 'resend' | 'twilio' | 'supabase-edge' | 'console';
}

interface EmailNotificationParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface WhatsAppNotificationParams {
  to: string;
  message: string;
}

// Helper function to get env vars safely (server-side only)
// @ts-ignore - process is available in Node.js environment
const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof window === 'undefined' && typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// Notification configuration
const EMAIL_CONFIG: NotificationConfig = {
  enabled: getEnv('EMAIL_NOTIFICATIONS_ENABLED') === 'true',
  provider: (getEnv('EMAIL_PROVIDER') as any) || 'console',
};

const WHATSAPP_CONFIG: NotificationConfig = {
  enabled: getEnv('WHATSAPP_NOTIFICATIONS_ENABLED') === 'true',
  provider: (getEnv('WHATSAPP_PROVIDER') as any) || 'console',
};

/**
 * Send email notification
 */
export async function sendEmailNotification(params: EmailNotificationParams): Promise<void> {
  if (!EMAIL_CONFIG.enabled) {
    console.log('[Email Notification] Disabled - skipping:', params.subject);
    return;
  }

  const from = params.from || 'notifications@flockiq.com';

  switch (EMAIL_CONFIG.provider) {
    case 'resend':
      try {
        // Dynamic import to avoid runtime errors if package not installed
        // @ts-ignore - Optional package
        const resendModule = await import('resend').catch(() => null);
        if (resendModule) {
          const Resend = (resendModule as any).Resend || (resendModule as any).default?.Resend || (resendModule as any).default || resendModule;
          const resend = new (Resend as any)(getEnv('RESEND_API_KEY'));
          
          await resend.emails.send({
            from,
            to: params.to,
            subject: params.subject,
            html: params.html,
          });
          
          console.log('[Email Notification] Sent via Resend:', params.subject);
        } else {
          throw new Error('Resend package not installed');
        }
      } catch (error) {
        console.error('[Email Notification] Resend error:', error);
        console.log('[Email Notification] Fallback to console:', params.subject);
      }
      break;
      
    case 'supabase-edge':
      try {
        const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.warn('[Email Notification] Supabase not configured, skipping');
          break;
        }
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.functions.invoke('send-email', { body: params });
        console.log('[Email Notification] Sent via Supabase Edge:', params.subject);
      } catch (error) {
        console.error('[Email Notification] Supabase Edge error:', error);
        console.log('[Email Notification] Fallback to console:', params.subject);
      }
      break;
      
    case 'console':
    default:
      console.log('[Email Notification]', {
        to: params.to,
        from,
        subject: params.subject,
        html: params.html.substring(0, 100) + '...',
      });
      break;
  }
}

/**
 * Send WhatsApp notification
 */
export async function sendWhatsAppNotification(params: WhatsAppNotificationParams): Promise<void> {
  if (!WHATSAPP_CONFIG.enabled) {
    console.log('[WhatsApp Notification] Disabled - skipping');
    return;
  }

  switch (WHATSAPP_CONFIG.provider) {
    case 'twilio':
      try {
        // Dynamic import to avoid runtime errors if package not installed
        // @ts-ignore - Optional package
        const twilioModule = await import('twilio').catch(() => null);
        if (twilioModule) {
          const twilio = (twilioModule as any).default || (twilioModule as any).twilio || twilioModule;
          const client = (twilio as any)(
            getEnv('TWILIO_ACCOUNT_SID'),
            getEnv('TWILIO_AUTH_TOKEN')
          );
          
          await client.messages.create({
            from: getEnv('TWILIO_WHATSAPP_NUMBER'),
            to: `whatsapp:${params.to}`,
            body: params.message,
          });
          
          console.log('[WhatsApp Notification] Sent via Twilio');
        } else {
          throw new Error('Twilio package not installed');
        }
      } catch (error) {
        console.error('[WhatsApp Notification] Twilio error:', error);
        console.log('[WhatsApp Notification] Fallback to console');
      }
      break;
      
    case 'supabase-edge':
      try {
        const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.warn('[WhatsApp Notification] Supabase not configured, skipping');
          break;
        }
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.functions.invoke('send-whatsapp', { body: params });
        console.log('[WhatsApp Notification] Sent via Supabase Edge');
      } catch (error) {
        console.error('[WhatsApp Notification] Supabase Edge error:', error);
        console.log('[WhatsApp Notification] Fallback to console');
      }
      break;
      
    case 'console':
    default:
      console.log('[WhatsApp Notification]', {
        to: params.to,
        message: params.message.substring(0, 100) + '...',
      });
      break;
  }
}

/**
 * Send referral notification to referrer
 */
export async function sendReferralNotification(referrerId: string, creditId: string): Promise<void> {
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Referral Notification] Supabase not configured, skipping');
    return;
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: referrer } = await supabase
      .from('customers')
      .select('phone, email')
      .eq('id', referrerId)
      .single();
    
    if (referrer?.phone) {
      await sendWhatsAppNotification({
        to: referrer.phone,
        message: `🎉 New referral credit earned! ₹500 credit has been added to your account. Check your dashboard. —FlockIQ`,
      });
    }
    
    console.log(`[Referral Notification] Credit ${creditId} notified to referrer ${referrerId}`);
  } catch (error) {
    console.error('[Referral Notification] Error:', error);
    console.log(`[Referral Notification] Credit ${creditId} created for referrer ${referrerId} (notification failed)`);
  }
}
