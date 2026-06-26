'use client';

import { motion } from 'framer-motion';
import { TrendUp, TrendDown, CheckCircle, Clock } from '@phosphor-icons/react';
import { getAccuracyColour } from '@/lib/charts/config';

interface PredictionRow {
  mandi: string;
  p50: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  predicted_at: string;
}

interface AccuracyMetrics {
  directional_accuracy_30d: number;
  mape_30d: number;
  conformal_coverage_30d: number;
  last_updated: string;
}

interface Customer {
  segment: string;
  role: string;
}

interface KPICardsProps {
  primaryPrediction: PredictionRow | null;
  accuracy: AccuracyMetrics | null;
  alertCount: number;
  customer: Customer | null;
}

export function KPICards({ primaryPrediction, accuracy, alertCount, customer }: KPICardsProps) {
  const accuracyGateCleared = process.env.NEXT_PUBLIC_ACCURACY_GATE_CLEARED === 'true';
  
  // Card 1: Today's P50 Price
  const priceCard = (
    <MetricCard
      title="आज का P50 भाव"
      value={primaryPrediction ? `₹${primaryPrediction.p50}/kg` : '—'}
      subtitle={primaryPrediction ? `${primaryPrediction.mandi.charAt(0).toUpperCase() + primaryPrediction.mandi.slice(1)} Mandi` : 'Loading...'}
      trend={null}
      accentColor="var(--brand-green-700)"
    />
  );

  // Card 2: Sell Signal
  const getSignalDisplay = (signal: string) => {
    switch (signal) {
      case 'SELL_NOW':
        return { label: 'आज बेचें ✓', color: 'var(--brand-green-500)' };
      case 'HOLD':
        return { label: 'रुकें', color: 'var(--amber-500)' };
      case 'CAUTION':
        return { label: 'सावधान', color: 'var(--red-600)' };
      default:
        return { label: '—', color: 'var(--neutral-500)' };
    }
  };

  const signalDisplay = primaryPrediction ? getSignalDisplay(primaryPrediction.sell_signal) : { label: '—', color: 'var(--neutral-500)' };
  
  const signalCard = (
    <MetricCard
      title="Sell Signal"
      value={signalDisplay.label}
      subtitle="Signal strength: ●●●●○"
      trend={null}
      accentColor={signalDisplay.color}
    />
  );

  // Card 3: 30-Day Accuracy
  const accuracyValue = accuracyGateCleared && accuracy ? `${accuracy.directional_accuracy_30d}%` : 'Validating...';
  const accuracyCard = (
    <MetricCard
      title="30-Day Accuracy"
      value={accuracyValue}
      subtitle="सही दिशा की सटीकता"
      trend={accuracyGateCleared && accuracy ? '+0.3% vs last month' : null}
      accentColor={accuracyGateCleared && accuracy ? getAccuracyColour(accuracy.directional_accuracy_30d, 'directional') : '#D97706'}
    />
  );

  // Card 4: Active Farms (Admin) or Active Districts (Integrators)
  const isAdmin = customer?.role === 'admin';
  const activeCount = isAdmin ? '12' : '5';
  const activeLabel = isAdmin ? 'Active Farms' : 'Active Districts';
  const activeSubtitle = isAdmin ? 'Under monitoring' : 'Under monitoring';
  
  const activeCard = (
    <MetricCard
      title={activeLabel}
      value={activeCount}
      subtitle={activeSubtitle}
      trend="+2 vs last week"
      accentColor="var(--brand-green-700)"
    />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-section-normal">
      {priceCard}
      {signalCard}
      {accuracyCard}
      {activeCard}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: string | null;
  accentColor: string;
}

function MetricCard({ title, value, subtitle, trend, accentColor }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 100, damping: 20 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-card-compact border border-neutral-200 relative overflow-hidden shadow-diffusion hover:shadow-brand-tint transition-all duration-300 flex flex-col gap-md"
    >
      <div className="relative z-10 flex flex-col gap-md">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-neutral-900 font-space-grotesk font-mono">
          {value}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">{subtitle}</p>
          {trend && (
            <div className="flex items-center gap-sm text-xs font-semibold">
              {trend.startsWith('+') ? (
                <TrendUp size={14} className="text-brandGreen600" />
              ) : (
                <TrendDown size={14} className="text-red600" />
              )}
              <span className={trend.startsWith('+') ? 'text-brandGreen600' : 'text-red600'}>
                {trend}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
