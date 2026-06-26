'use client';

import Link from 'next/link';
import {
  Bird, Scales, Calculator, FileText, ChartLineUp,
  BellRinging, Plant, ShieldCheck, TrendUp, TrendDown,
  Clock, Circle, CalendarCheck, ArrowsClockwise, Warning,
  Storefront, ShoppingCart
} from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

const IconMap: Record<string, any> = {
  ChartLineUp,
  BellRinging,
  Warning,
  Plant,
  ShieldCheck,
  TrendUp,
  TrendDown,
  CalendarCheck,
  Storefront,
  ShoppingCart
};

// ─── Quick Actions Card ─────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    href: '/dashboard/farms',
    icon: Bird,
    iconColor: '#1A5C34',
    iconBg: '#D4EFDE',
    labelEn: 'View My Farms',
    labelHi: 'मेरे फार्म देखें',
  },
  {
    href: '/dashboard/batch-optimizer',
    icon: Scales,
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
    labelEn: 'Batch Status Board',
    labelHi: 'बैच स्टेटस बोर्ड',
  },
  {
    href: '/dashboard/calculator',
    icon: Calculator,
    iconColor: '#0891B2',
    iconBg: '#CFFAFE',
    labelEn: 'Profit Calculator',
    labelHi: 'लाभ कैलकुलेटर',
  },
  {
    href: '/dashboard/reports',
    icon: FileText,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    labelEn: 'Generate Reports',
    labelHi: 'रिपोर्ट बनाएं',
  },
];

export function QuickActionsCard() {
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-card-standard">
      <h3 className="text-sm font-semibold text-neutral-900 mb-4">
        {isHindi ? 'त्वरित कार्य' : 'Quick Actions'}
      </h3>
      <div className="space-y-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-3 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-sm text-neutral-700 font-medium transition-all duration-200 hover:translate-x-0.5"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: action.iconBg }}
              >
                <Icon size={16} weight="duotone" style={{ color: action.iconColor }} />
              </div>
              {isHindi ? action.labelHi : action.labelEn}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Activity Card ───────────────────────────────────────

export interface ActivityItem {
  icon: string;
  iconColor: string;
  iconBg: string;
  textEn: string;
  textHi: string;
  timeEn: string;
  timeHi: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-card-standard flex flex-col h-full">
      <h3 className="text-sm font-semibold text-neutral-900 mb-4">
        {isHindi ? 'हाल की गतिविधि' : 'Recent Activity'}
      </h3>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-4">
            {isHindi ? 'कोई नई गतिविधि नहीं' : 'No recent activity'}
          </p>
        ) : (
          activities.map((activity, idx) => {
            const Icon = IconMap[activity.icon] || Clock;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: activity.iconBg }}
                >
                  <Icon size={14} weight="duotone" style={{ color: activity.iconColor }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-900 font-medium leading-snug">
                    {isHindi ? activity.textHi : activity.textEn}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} weight="fill" className="flex-shrink-0" />
                    {isHindi ? activity.timeHi : activity.timeEn}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── System Status Card ─────────────────────────────────────────

const SYSTEM_SERVICES = [
  { labelEn: 'Price API', labelHi: 'प्राइस API', status: 'online' as const },
  { labelEn: 'Forecast Engine', labelHi: 'फोरकास्ट इंजन', status: 'online' as const },
  { labelEn: 'Alert System', labelHi: 'अलर्ट सिस्टम', status: 'online' as const },
  { labelEn: 'Data Sync', labelHi: 'डेटा सिंक', status: 'synced' as const },
];

interface SystemStatusCardProps {
  lastUpdateEn: string;
  lastUpdateHi: string;
}

export function SystemStatusCard({ lastUpdateEn, lastUpdateHi }: SystemStatusCardProps) {
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-card-standard flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900">
          {isHindi ? 'सिस्टम स्थिति' : 'System Status'}
        </h3>
        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Circle size={6} weight="fill" />
          {isHindi ? 'सब ठीक' : 'All OK'}
        </span>
      </div>
      <div className="space-y-3 flex-1">
        {SYSTEM_SERVICES.map((service, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 font-medium">
              {isHindi ? service.labelHi : service.labelEn}
            </span>
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
              <Circle size={7} weight="fill" className="text-green-500" />
              {service.status === 'synced'
                ? (isHindi ? 'सिंक्ड' : 'Synced')
                : (isHindi ? 'ऑनलाइन' : 'Online')
              }
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between mt-auto">
          <span className="text-xs text-neutral-400 font-medium">
            {isHindi ? 'अंतिम अपडेट' : 'Last Update'}
          </span>
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <ArrowsClockwise size={11} weight="bold" />
            {isHindi ? lastUpdateHi : lastUpdateEn}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Market Insights Card ───────────────────────────────────────

export interface InsightItem {
  labelEn: string;
  labelHi: string;
  value: string;
  icon: string;
  descEn: string;
  descHi: string;
  direction: 'up' | 'down' | 'flat';
}

interface MarketInsightsCardProps {
  insights: InsightItem[];
}

export function MarketInsightsCard({ insights }: MarketInsightsCardProps) {
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  return (
    <div className="col-span-1 lg:col-span-12 bg-gradient-to-br from-[#1A5C34] via-[#1F6B3E] to-[#247245] rounded-2xl p-card-standard text-white overflow-hidden relative">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <div className="relative">
        <h3 className="text-base font-semibold mb-4">
          {isHindi ? 'बाजार अंतर्दृष्टि सारांश' : 'Market Insights Summary'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {insights.map((insight, idx) => {
            const Icon = IconMap[insight.icon] || ChartLineUp;
            return (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} weight="duotone" className="text-white/70" />
                  <p className="text-xs text-white/70 font-medium">
                    {isHindi ? insight.labelHi : insight.labelEn}
                  </p>
                </div>
                <p className="text-xl font-bold flex items-center gap-1.5">
                  {insight.direction === 'up' && <TrendUp size={18} weight="bold" className="text-emerald-300" />}
                  {insight.direction === 'down' && <TrendDown size={18} weight="bold" className="text-red-300" />}
                  {isHindi && insight.value === 'Bullish' ? 'तेजी' : isHindi && insight.value === 'Bearish' ? 'मंदी' : isHindi && insight.value === 'Low' ? 'कम' : isHindi && insight.value === 'High' ? 'उच्च' : isHindi && insight.value === 'Medium' ? 'मध्यम' : insight.value}
                </p>
                <p className="text-[10px] text-white/50 mt-1">
                  {isHindi ? insight.descHi : insight.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
