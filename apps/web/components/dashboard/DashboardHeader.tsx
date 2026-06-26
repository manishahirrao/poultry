'use client';

import { useState, useEffect } from 'react';
import { Bell, ArrowClockwise, CaretDown, Gift, Circle, MagnifyingGlass } from '@phosphor-icons/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSWRConfig } from 'swr';
import Link from 'next/link';
import { ReferralPrompt } from './ReferralPrompt';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/providers/LanguageProvider';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

// Page title map (pathname → title)
const PAGE_TITLES: Record<string, string> = {
  '/dashboard/overview':           'Overview',
  '/dashboard/price-intelligence': 'Price Intelligence',
  '/dashboard/alerts':             'Alerts',
  '/dashboard/calculator':         'Calculator',
  '/dashboard/api':                'API Access',
  '/dashboard/admin-accuracy':      'Model Accuracy',
  '/dashboard/customers':          'Customers',
  '/dashboard/settings':           'Settings',
};

interface DashboardHeaderProps {
  customer: {
    name?: string;
    district: string;
    role: string;
    id?: string;
  };
}

export function DashboardHeader({ customer }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig();
  const { language, t } = useLanguage();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [showReferralPrompt, setShowReferralPrompt] = useState(false);
  const [referralTrigger, setReferralTrigger] = useState<'first_prediction' | 'milestone' | 'after_support' | 'reminder' | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([customer.district]);
  const [modelStatus, setModelStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [modelMape, setModelMape] = useState(4.8);

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

  // Available districts for multi-select
  const availableDistricts = [
    { id: 'gorakhpur', name: 'Gorakhpur', nameHi: 'गोरखपुर' },
    { id: 'deoria', name: 'Deoria', nameHi: 'देवरिया' },
    { id: 'kushinagar', name: 'Kushinagar', nameHi: 'कुशीनगर' },
    { id: 'maharajganj', name: 'Maharajganj', nameHi: 'महाराजगंज' },
    { id: 'basti', name: 'Basti', nameHi: 'बस्ती' },
    { id: 'sant-kabir-nagar', name: 'Sant Kabir Nagar', nameHi: 'संत कबीर नगर' },
  ];

  // Sync selected districts to URL params
  useEffect(() => {
    const currentDistricts = searchParams.get('districts')?.split(',') || [customer.district];
    setSelectedDistricts(currentDistricts);
  }, [searchParams, customer.district]);

  const toggleDistrict = (districtId: string) => {
    const newSelection = selectedDistricts.includes(districtId)
      ? selectedDistricts.filter(d => d !== districtId)
      : [...selectedDistricts, districtId];
    
    setSelectedDistricts(newSelection);
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (newSelection.length > 0) {
      params.set('districts', newSelection.join(','));
    } else {
      params.delete('districts');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Stale check: data is stale if > 24h old
  const dataIsStale = Date.now() - lastUpdated.getTime() > 86_400_000;

  // Manual refresh - SWR global revalidation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Invalidate all SWR keys (global refresh)
    await mutate(() => true, undefined, { revalidate: true });
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Format last updated time
  const formatLastUpdated = (date: Date): string => {
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    return `${Math.floor(diffMinutes / 60)} hr ago`;
  };

  return (
    <>
    <header className="h-[64px] bg-white border-b border-neutral-200 px-4
                       flex items-center justify-between gap-3 flex-shrink-0 z-20 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
      {/* Left section: Logo + District Selector */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Logo - links to dashboard root */}
        <Link
          href="/dashboard"
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
          aria-label="FlockIQ AI Dashboard"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brandOrange500 flex items-center justify-center text-white text-xs font-bold">
              PS
            </div>
            <span className="hidden sm:block text-sm font-semibold text-neutral-900">
              FlockIQ AI
            </span>
          </div>
        </Link>

        {/* Global District Selector - multi-select pill group */}
        <div className="hidden md:flex items-center gap-2 flex-1 overflow-x-auto">
          <span className="text-xs text-neutral-500 whitespace-nowrap">{language === 'hi' ? 'जिले:' : 'Districts:'}</span>
          {availableDistricts.map((district) => (
            <button
              key={district.id}
              onClick={() => toggleDistrict(district.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2
                         ${
                           selectedDistricts.includes(district.id)
                             ? 'bg-brandOrange500 text-white'
                             : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                         }`}
              aria-pressed={selectedDistricts.includes(district.id)}
              title={language === 'hi' ? district.name : district.nameHi}
            >
              {language === 'hi' ? district.nameHi : district.name}
            </button>
          ))}
        </div>
      </div>

      {/* Center section: Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <MagnifyingGlass
            size={15}
            weight="regular"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder', { defaultValue: language === 'hi' ? 'खोजें...' : 'Search...' })}
            className="w-full bg-neutral-100 border border-transparent rounded-full pl-9 pr-3 py-1.5 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-brandOrange400 focus:ring-2 focus:ring-brandOrange100 transition-all duration-200"
            aria-label={t('dashboard.searchLabel', { defaultValue: language === 'hi' ? 'डैशबोर्ड में खोजें' : 'Search dashboard' })}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set('q', e.target.value);
              } else {
                params.delete('q');
              }
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            defaultValue={searchParams.get('q') || ''}
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Language Toggle */}
        <div className="hidden sm:block">
          <LanguageToggle />
        </div>

        {/* Model Status Dot */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full
                     bg-neutral-100 text-neutral-600 text-xs"
          title={`Model MAPE: ${modelMape}%`}
        >
          <Circle
            size={8}
            weight="fill"
            className={
              modelStatus === 'healthy' ? 'text-brandGreen600' :
              modelStatus === 'warning' ? 'text-amber500' :
              'text-red600'
            }
            aria-hidden="true"
          />
          <span className="hidden lg:inline">
            {modelMape.toFixed(1)}% MAPE
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="group w-9 h-9 flex items-center justify-center rounded-full
                     text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100
                     transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2
                     disabled:opacity-50"
          aria-label="Refresh data"
          title="Refresh data"
        >
          <ArrowClockwise
            size={16}
            weight="regular"
            aria-hidden="true"
            className={isRefreshing ? 'animate-spin' : ''}
          />
        </button>

        {/* Notification bell */}
        <Link
          href="/dashboard/alerts"
          className="group relative w-9 h-9 flex items-center justify-center rounded-full
                     text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100
                     transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2"
          aria-label={`Alerts — ${unreadAlerts} unread`}
        >
          <Bell size={16} weight="regular" aria-hidden="true" />
          {unreadAlerts > 0 && (
            <span
              className="absolute top-1 right-1 w-3.5 h-3.5 bg-red600 text-white
                         text-[8px] font-bold rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            className="group flex items-center gap-md h-9 pl-2 pr-1.5 rounded-full
                       hover:bg-neutral-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange700 focus-visible:ring-offset-2"
            aria-label="User menu"
            aria-haspopup="true"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center
                            justify-center text-white text-[9px] font-bold flex-shrink-0">
              {customer.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-neutral-700 max-w-[80px] truncate">
              {customer.name ?? 'Account'}
            </span>
            <CaretDown size={10} weight="bold" aria-hidden="true" className="text-neutral-400" />
          </button>
        </div>

        {/* Referral button */}
        <button
          onClick={() => {
            setReferralTrigger('reminder');
            setShowReferralPrompt(true);
          }}
          className="group w-9 h-9 flex items-center justify-center rounded-full
                     text-amber600 hover:text-amber700 hover:bg-amberLight
                     transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber500 focus-visible:ring-offset-2"
          aria-label="Refer friends"
          title="Refer & Earn"
        >
          <Gift size={16} weight="fill" />
        </button>
      </div>
    </header>

    {/* Referral Prompt */}
    {showReferralPrompt && referralTrigger && customer.id && (
      <ReferralPrompt
        triggerMoment={referralTrigger}
        onClose={() => {
          setShowReferralPrompt(false);
          setReferralTrigger(null);
        }}
        userId={customer.id}
      />
    )}
  </>
  );
}
