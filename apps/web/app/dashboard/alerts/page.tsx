'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ActiveAlertsTab } from '@/components/dashboard/alerts/ActiveAlertsTab';
import { AlertHistoryTab } from '@/components/dashboard/alerts/AlertHistoryTab';
import { AlertSettingsTab } from '@/components/dashboard/alerts/AlertSettingsTab';
import { FarmRiskAssessmentSection } from '@/components/dashboard/alerts/FarmRiskAssessmentSection';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { canAccess, FEATURES } from '@/lib/plans/featureGates';
import { FeatureGate } from '@/components/plans/FeatureGate';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

type Tab = 'active' | 'history' | 'settings';

function AlertsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { entitlements } = useEntitlements();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get('tab') as Tab) || 'active'
  );
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('gorakhpur');

  // Feature access checks
  const signalAlertsAccess = canAccess(entitlements, FEATURES.PRICE_ALERTS_SIGNAL);
  const customAlertsAccess = canAccess(entitlements, FEATURES.CUSTOM_ALERT_RULES);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    router.replace(`/dashboard/alerts?${params.toString()}`);
  }, [activeTab, searchParams, router]);

  // Fetch alerts
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const supabase = await createClient();
        if (!supabase) {
          setAlerts([]);
          setLoading(false);
          return;
        }
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setAlerts([]);
          setLoading(false);
          return;
        }
        if (!user.phone) {
          setAlerts([]);
          setLoading(false);
          return;
        }

        // Fetch customer district
        const { data: customer } = await supabase
          .from('customers')
          .select('district')
          .eq('phone', user.phone)
          .single();

        const customerDistrict = customer?.district || district;

        const { data: alertsData, error: alertsError } = await supabase
          .from('alerts')
          .select('*')
          .or(`district.eq.${customerDistrict},district.eq.all`)
          .gt('expires_at', new Date().toISOString())
          .order('severity', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(20);

        if (alertsError) {
          console.error('Error fetching alerts:', alertsError);
          setAlerts([]);
        } else {
          setAlerts(alertsData || []);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [district]);

  const tabs = [
    { id: 'active' as Tab, label: 'Active Alerts', labelHi: 'Active Alerts' },
    { id: 'history' as Tab, label: 'Alert History', labelHi: 'Alert History' },
    { id: 'settings' as Tab, label: 'Settings', labelHi: 'Settings' },
  ];

  // Count alerts by type
  const alertCounts = {
    disease: alerts.filter(a => a.type === 'HPAI').length,
    weather: alerts.filter(a => a.type === 'WEATHER').length,
    price: alerts.filter(a => a.type === 'PRICE_WARNING').length,
    policy: alerts.filter(a => a.type === 'POLICY').length,
  };

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Notifications
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Alerts</h1>
        <p className="text-base text-neutral-600 mt-2">
          Stay informed about disease outbreaks, weather events, and price movements
        </p>
      </div>

      {/* Alert Type Count Badges */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] flex items-center gap-2 px-4 py-2">
            <span className="text-lg">🦠</span>
            <span className="text-sm font-semibold text-neutral-700">Disease: {alertCounts.disease}</span>
          </div>
        </div>
        <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] flex items-center gap-2 px-4 py-2">
            <span className="text-lg">🌡️</span>
            <span className="text-sm font-semibold text-neutral-700">Weather: {alertCounts.weather}</span>
          </div>
        </div>
        <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] flex items-center gap-2 px-4 py-2">
            <span className="text-lg">📉</span>
            <span className="text-sm font-semibold text-neutral-700">Price: {alertCounts.price}</span>
          </div>
        </div>
        <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
          <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] flex items-center gap-2 px-4 py-2">
            <span className="text-lg">📋</span>
            <span className="text-sm font-semibold text-neutral-700">Policy: {alertCounts.policy}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
        <div className="bg-white/50 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[calc(2rem-0.375rem)] p-1">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] relative whitespace-nowrap rounded-xl ${
                  activeTab === tab.id
                    ? 'text-neutral-900 bg-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
                }`}
              >
                {tab.labelHi}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' && (
        <>
          <FarmRiskAssessmentSection district={district} />
          <ActiveAlertsTab alerts={alerts} loading={loading} district={district} setDistrict={setDistrict} />
        </>
      )}

      {activeTab === 'history' && (
        <AlertHistoryTab district={district} />
      )}

      {activeTab === 'settings' && (
        <AlertSettingsTab />
      )}
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="py-8 md:py-12 lg:py-16">Loading alerts...</div>}>
      <AlertsPageContent />
    </Suspense>
  );
}
