'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WhatsappLogo, Envelope, Link as LinkIcon } from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import IntegrationCard from '@/components/dashboard/settings/IntegrationCard';
import { FlockIQTokens } from '@/lib/design-tokens';
import { Toast } from '@/components/ui/Toast';

export default function IntegrationsPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Integration states
  const [waConnected, setWaConnected] = useState(false);
  const [farmCount, setFarmCount] = useState(0);
  const [lastSent, setLastSent] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [userPlan, setUserPlan] = useState('');

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const supabase = await createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/auth/login');
        return;
      }

      // Fetch customer data
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', user.phone)
        .single();

      if (customerData) {
        setCustomer(customerData);
        setUserPlan(customerData.segment || 'S1');
        
        // Fetch WhatsApp integration status
        const { data: waData } = await supabase
          .from('whatsapp_integrations')
          .select('*')
          .eq('customer_id', customerData.id)
          .single();

        if (waData) {
          setWaConnected(waData.status === 'active');
          setLastSent(waData.last_message_sent_at ? new Date(waData.last_message_sent_at).toLocaleString() : 'Never');
        }

        // Fetch farm count for WhatsApp
        const { count: farmsCount } = await supabase
          .from('farms')
          .select('*', { count: 'exact', head: true })
          .eq('integrator_id', customerData.id)
          .eq('status', 'active');

        setFarmCount(farmsCount || 0);

        // Email verification status
        setEmailVerified(!!customerData.email_verified);
        setUserEmail(customerData.email || '');

        // Webhook configuration
        const { data: webhookData } = await supabase
          .from('customer_integrations')
          .select('*')
          .eq('customer_id', customerData.id)
          .eq('integration_type', 'webhook')
          .single();

        if (webhookData) {
          setWebhookConfigured(webhookData.status === 'active');
          setWebhookUrl(webhookData.config?.webhook_url || '');
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWA = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp Business? This will stop daily log reminders.')) {
      return;
    }

    try {
      const supabase = await createClient();
      if (!supabase) {
        setToast({ type: 'error', message: 'Failed to connect to database' });
        return;
      }
      await supabase
        .from('whatsapp_integrations')
        .update({ status: 'inactive' })
        .eq('customer_id', customer.id);

      setWaConnected(false);
      setToast({ type: 'success', message: 'WhatsApp Business disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      setToast({ type: 'error', message: 'Failed to disconnect WhatsApp Business' });
    }
  };

  const openEmailModal = () => {
    // Navigate to profile tab for email management
    router.push('/dashboard/settings?tab=profile');
  };

  const openWebhookModal = () => {
    // Open webhook configuration modal
    alert('Webhook configuration modal would open here');
  };

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/integrations/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.id }),
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Test webhook sent successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to send test webhook' });
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setToast({ type: 'error', message: 'Failed to send test webhook' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A5C34]">Integrations</h1>
        <p className="text-gray-600 mt-2">
          Manage your communication and notification integrations
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* WhatsApp Business Card */}
        <IntegrationCard
          icon={<WhatsappLogo size={24} color={FlockIQTokens.whatsappGreen} />}
          name="WhatsApp Business"
          description="Automated daily log collection and alerts via WhatsApp"
          status={waConnected ? 'connected' : 'disconnected'}
          statusDetails={waConnected ? `Sending to ${farmCount} farms · Last sent ${lastSent}` : undefined}
          actions={[
            { label: 'Manage', href: '/dashboard/settings/notifications#whatsapp' },
            { label: 'Disconnect', onClick: disconnectWA, variant: 'danger' },
          ]}
        />

        {/* Email Card */}
        <IntegrationCard
          icon={<Envelope size={24} color="#2563EB" />}
          name="Email"
          description="Daily summaries and alert notifications via email"
          status={emailVerified ? 'connected' : 'disconnected'}
          statusDetails={emailVerified ? userEmail : 'No email configured'}
          actions={[
            { label: emailVerified ? 'Change Email' : 'Add Email', onClick: openEmailModal },
            { label: 'Manage Frequency', href: '/dashboard/settings/notifications#email' },
          ]}
        />

        {/* Webhook Card (PULSE_INTEL only) */}
        <IntegrationCard
          icon={<LinkIcon size={24} color="#7C3AED" />}
          name="Webhook"
          description="Receive real-time price and alert events via HTTP webhook"
          status={webhookConfigured ? 'connected' : 'disabled'}
          statusDetails={webhookConfigured ? webhookUrl : undefined}
          locked={userPlan !== 'PULSE_INTEL'}
          lockedMessage="Upgrade to PULSE_INTEL to access webhook integration"
          actions={[
            { label: webhookConfigured ? 'Edit Endpoint' : 'Configure', onClick: openWebhookModal },
            { label: 'Test Webhook', onClick: testWebhook, disabled: !webhookConfigured },
          ]}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
