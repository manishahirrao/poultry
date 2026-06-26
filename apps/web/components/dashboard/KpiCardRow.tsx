'use client';

import { useRouter } from 'next/navigation';
import { Storefront, Handshake, BellRinging, Plant, ChartBar, PlugsConnected, CrownSimple } from '@phosphor-icons/react';
import { KpiCard } from './KpiCard';
import { useLanguage } from '@/providers/LanguageProvider';

interface KpiCardRowProps {
  userRole: 'admin' | 'enterprise' | 'integrator' | 'pro';
  mandiBenchmark?: {
    price: number;
    delta: number;
    source: string;
    freshness: string;
  };
  middlemanSpread?: {
    delta: number;
    deltaPercent: number;
    source: string;
    freshness: string;
  };
  activeAlerts?: {
    count: number;
    freshness: string;
  };
  feedCostIndex?: {
    value: number;
    delta: number;
    freshness: string;
  };
  gcKpi?: {
    value: number;
    delta: number;
    source: string;
    freshness: string;
  };
  apiUsage?: {
    used: number;
    quota: number;
    freshness: string;
  };
  subscriptionTier?: string;
  isLoading?: boolean;
}

export function KpiCardRow({
  userRole,
  mandiBenchmark,
  middlemanSpread,
  activeAlerts,
  feedCostIndex,
  gcKpi,
  apiUsage,
  subscriptionTier = 'PulsePro',
  isLoading = false
}: KpiCardRowProps) {
  const router = useRouter();
  const { language } = useLanguage();

  // Card 1: Mandi Benchmark
  const mandiBenchmarkCard = (
    <KpiCard
      icon={Storefront}
      iconColor="#1A5C34"
      title={language === 'hi' ? 'मंडी बेंचमार्क' : 'Mandi Benchmark'}
      value={mandiBenchmark ? `₹${mandiBenchmark.price.toFixed(2)} / kg` : '—'}
      subtitle={language === 'hi' ? '7-दिन का औसत' : '7-day avg'}
      delta={mandiBenchmark ? `${mandiBenchmark.delta > 0 ? '+' : ''}${mandiBenchmark.delta.toFixed(1)}%` : undefined}
      deltaDirection={mandiBenchmark?.delta && mandiBenchmark.delta > 0 ? 'up' : mandiBenchmark?.delta && mandiBenchmark.delta < 0 ? 'down' : 'flat'}
      source={mandiBenchmark?.source}
      freshness={mandiBenchmark?.freshness}
      onClick={() => router.push('/dashboard/price-intelligence/historical')}
      isLoading={isLoading}
    />
  );

  // Card 2: Middleman Spread
  const middlemanSpreadCard = (
    <KpiCard
      icon={Handshake}
      iconColor="#7C3AED"
      title={language === 'hi' ? 'बिचौलिया स्प्रेड' : 'Middleman Spread'}
      value={middlemanSpread ? `₹${middlemanSpread.delta.toFixed(2)}` : '—'}
      subtitle={language === 'hi' ? 'NECC जोन की तुलना में' : 'vs NECC zone'}
      delta={middlemanSpread ? `${middlemanSpread.deltaPercent > 0 ? '+' : ''}${middlemanSpread.deltaPercent.toFixed(1)}%` : undefined}
      deltaDirection={middlemanSpread?.deltaPercent && middlemanSpread.deltaPercent > 0 ? 'up' : middlemanSpread?.deltaPercent && middlemanSpread.deltaPercent < 0 ? 'down' : 'flat'}
      source={middlemanSpread?.source}
      freshness={middlemanSpread?.freshness}
      onClick={() => router.push('/dashboard/middleman-check')}
      isLoading={isLoading}
    />
  );

  // Card 3: Active Alerts
  const activeAlertsCard = (
    <KpiCard
      icon={BellRinging}
      iconColor="#DC2626"
      title={language === 'hi' ? 'सक्रिय अलर्ट' : 'Active Alerts'}
      value={activeAlerts?.count.toString() || '0'}
      subtitle={language === 'hi' ? 'रोग + मौसम' : 'disease + weather'}
      source="System"
      freshness={activeAlerts?.freshness}
      onClick={() => router.push('/dashboard/alerts')}
      isLoading={isLoading}
    />
  );

  // Card 4: Feed Cost Index
  const feedCostIndexCard = (
    <KpiCard
      icon={Plant}
      iconColor="#D97706"
      title={language === 'hi' ? 'फ़ीड लागत सूचकांक' : 'Feed Cost Index'}
      value={feedCostIndex ? `${feedCostIndex.value.toFixed(1)}` : '—'}
      subtitle={language === 'hi' ? 'मक्का + सोया' : 'maize + soya'}
      delta={feedCostIndex ? `${feedCostIndex.delta > 0 ? '+' : ''}${feedCostIndex.delta.toFixed(1)}%` : undefined}
      deltaDirection={feedCostIndex?.delta && feedCostIndex.delta > 0 ? 'up' : feedCostIndex?.delta && feedCostIndex.delta < 0 ? 'down' : 'flat'}
      freshness={feedCostIndex?.freshness}
      onClick={() => router.push('/dashboard/feed-intelligence')}
      isLoading={isLoading}
    />
  );

  // Card 5: Growing Cost (GC)
  const gcKpiCard = (
    <KpiCard
      icon={ChartBar}
      iconColor="#0891B2"
      title={language === 'hi' ? 'उत्पादन लागत' : 'Growing Cost'}
      value={gcKpi ? `₹${gcKpi.value.toFixed(2)}/kg` : '—'}
      subtitle={language === 'hi' ? 'प्रति किलोग्राम जीवित वजन' : 'per kg live weight'}
      delta={gcKpi ? `${gcKpi.delta > 0 ? '+' : ''}${gcKpi.delta.toFixed(1)}%` : undefined}
      deltaDirection={gcKpi?.delta && gcKpi.delta > 0 ? 'up' : gcKpi?.delta && gcKpi.delta < 0 ? 'down' : 'flat'}
      source={gcKpi?.source}
      freshness={gcKpi?.freshness}
      onClick={() => router.push('/dashboard/farms')}
      isLoading={isLoading}
    />
  );

  // Card 6: API Usage (for enterprise/admin) or Subscription Tier (for S1/S2)
  const card6 = (userRole === 'enterprise' || userRole === 'admin') ? (
    <KpiCard
      icon={PlugsConnected}
      iconColor="#6366F1"
      title={language === 'hi' ? 'API उपयोग' : 'API Usage'}
      value={apiUsage ? `${apiUsage.used.toLocaleString()}` : '—'}
      subtitle={language === 'hi' ? `कुल ${apiUsage?.quota.toLocaleString() || '—'} में से` : `of ${apiUsage?.quota.toLocaleString() || '—'}`}
      source="Upstash"
      freshness={apiUsage?.freshness}
      onClick={() => router.push('/dashboard/api')}
      isLoading={isLoading}
    />
  ) : (
    <KpiCard
      icon={CrownSimple}
      iconColor="#F59E0B"
      title={language === 'hi' ? 'सदस्यता' : 'Subscription'}
      value={subscriptionTier}
      subtitle={language === 'hi' ? 'वर्तमान योजना' : 'Current plan'}
      onClick={() => router.push('/dashboard/settings/billing')}
      isLoading={isLoading}
    />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-section-normal">
      {mandiBenchmarkCard}
      {middlemanSpreadCard}
      {activeAlertsCard}
      {feedCostIndexCard}
      {gcKpiCard}
      {card6}
    </div>
  );
}
