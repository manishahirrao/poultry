'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ProfileTab } from '@/components/dashboard/settings/ProfileTab';
import { NotificationsTab } from '@/components/dashboard/settings/NotificationsTab';
import { TeamTab } from '@/components/dashboard/settings/TeamTab';
import { BillingTab } from '@/components/dashboard/settings/BillingTab';
import { DataPrivacyTab } from '@/components/dashboard/settings/DataPrivacyTab';
import IntegrationsTab from '@/components/dashboard/settings/IntegrationsTab';
import { CostConfigTab } from '@/components/dashboard/settings/CostConfigTab';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

type Tab = 'profile' | 'notifications' | 'team' | 'billing' | 'data-privacy' | 'integrations' | 'cost-config';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { entitlements } = useEntitlements();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get('tab') as Tab) || 'profile'
  );
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ── Feature access check for team management ───────────────────────────────────
  const teamAccess = canAccess(entitlements, FEATURES.TEAM_MEMBERS);
  
  // Redirect to profile tab if user tries to access team tab without access
  useEffect(() => {
    if (activeTab === 'team' && !teamAccess.hasAccess) {
      setActiveTab('profile');
    }
  }, [activeTab, teamAccess.hasAccess]);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    router.replace(`/dashboard/settings?${params.toString()}`);
  }, [activeTab, searchParams, router]);

  // Fetch customer data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const supabase = await createClient();
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user?.phone) {
          setLoading(false);
          return;
        }
        
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', user.phone)
          .single();
        
        setCustomer(customerData);
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', labelHi: 'Profile' },
    { id: 'notifications' as Tab, label: 'Notifications', labelHi: 'Notifications' },
    { id: 'team' as Tab, label: 'Team', labelHi: 'Team' },
    { id: 'billing' as Tab, label: 'Billing', labelHi: 'Billing' },
    { id: 'data-privacy' as Tab, label: 'Data & Privacy', labelHi: 'Data & Privacy' },
    { id: 'integrations' as Tab, label: 'Integrations', labelHi: 'Integrations' },
    { id: 'cost-config' as Tab, label: 'Cost Config', labelHi: 'Cost Config' },
  ];

  if (loading) {
    return (
      <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
        <div className="h-8 bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem] w-64 animate-pulse">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] h-full" />
        </div>
        <div className="h-96 bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem] animate-pulse">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Configuration
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Settings</h1>
        <p className="text-base text-neutral-600 mt-2">
          Manage your account preferences, team, and billing
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
        <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-1">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              // Hide Team tab for users without team access
              if (tab.id === 'team' && !teamAccess.hasAccess) {
                return null;
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative whitespace-nowrap rounded-xl min-h-[48px] ${
                    activeTab === tab.id
                      ? 'text-neutral-900 bg-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
                  }`}
                >
                  {tab.labelHi}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileTab customer={customer} />}
      {activeTab === 'notifications' && <NotificationsTab customer={customer} />}
      {activeTab === 'team' && <TeamTab customer={customer} />}
      {activeTab === 'billing' && <BillingTab customer={customer} />}
      {activeTab === 'data-privacy' && <DataPrivacyTab customer={customer} />}
      {activeTab === 'integrations' && <IntegrationsTab />}
      {activeTab === 'cost-config' && <CostConfigTab customer={customer} />}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
