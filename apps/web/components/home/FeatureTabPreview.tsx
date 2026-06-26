// FlockIQ AI — Feature Tab Preview Component
// File: apps/web/components/home/FeatureTabPreview.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-008
// Requirements: REQ-WEB-001 §W1.6–W1.7, Design Spec §3.3

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/app/(marketing)/i18n/useTranslation';
import { TrendUp, CheckCircle, Calendar, ClipboardText, Warning } from '@phosphor-icons/react';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

// CSS Mockup Components
const PriceChartMockup = () => (
  <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm">
    <div className="text-xs text-neutral-500 mb-3 font-medium">7-Day Price Forecast (Beta) — Gorakhpur</div>
    <svg viewBox="0 0 300 120" className="w-full h-24">
      {/* Grid lines */}
      <line x1="0" y1="30" x2="300" y2="30" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
      <line x1="0" y1="60" x2="300" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
      <line x1="0" y1="90" x2="300" y2="90" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
      
      {/* Confidence band */}
      <path
        d="M0,50 L50,45 L100,40 L150,35 L200,30 L250,25 L300,20 L300,70 L250,75 L200,80 L150,85 L100,90 L50,95 L0,100 Z"
        fill="rgba(26, 107, 60, 0.1)"
      />
      
      {/* Actual line */}
      <path
        d="M0,75 L50,70 L100,65 L150,60 L200,55 L250,50 L300,45"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeDasharray="4"
      />
      
      {/* Forecast line */}
      <motion.path
        d="M150,60 L200,55 L250,50 L300,45"
        fill="none"
        stroke="#1a6b3c"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      
      {/* Current point */}
      <circle cx="150" cy="60" r="4" fill="#9ca3af" />
      <circle cx="300" cy="45" r="4" fill="#1a6b3c" />
    </svg>
    <div className="flex justify-between mt-3 text-xs">
      <span className="text-neutral-500">Day -7</span>
      <span className="text-neutral-500">Today</span>
      <span className="text-brand-700 font-semibold">Day +7</span>
    </div>
    <div className="mt-4 flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-brand-700 rounded-full"></div>
        <span className="text-neutral-600">Forecast</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
        <span className="text-neutral-600">Actual</span>
      </div>
    </div>
  </div>
);

const SellVsHoldMockup = () => (
  <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm">
    <div className="text-xs text-neutral-500 mb-4 font-medium">Sell vs Hold — Revenue Impact</div>
    <div className="grid grid-cols-4 gap-2">
      {[
        { day: 'Today', revenue: '₹42.8L', optimal: false },
        { day: '+3D', revenue: '₹43.5L', optimal: false },
        { day: '+7D', revenue: '₹45.2L', optimal: true },
        { day: '+14D', revenue: '₹44.1L', optimal: false },
      ].map((card) => (
        <div
          key={card.day}
          className={`p-3 rounded-lg text-center ${
            card.optimal
              ? 'bg-brand-700 text-white border-2 border-brand-700'
              : 'bg-white text-neutral-700 border border-neutral-200'
          }`}
        >
          <div className="text-xs font-medium mb-1">{card.day}</div>
          <div className="text-sm font-bold">{card.revenue}</div>
          {card.optimal && (
            <div className="text-xs mt-1 flex items-center justify-center gap-1">
              <CheckCircle size={12} />
              Best
            </div>
          )}
        </div>
      ))}
    </div>
    <div className="mt-4 text-xs text-neutral-600 text-center">
      Optimal: Wait 7 days = ₹2.4L more revenue
    </div>
  </div>
);

const BatchBoardMockup = () => (
  <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm">
    <div className="text-xs text-neutral-500 mb-4 font-medium">Batch Status Board</div>
    <div className="grid grid-cols-3 gap-3">
      {[
        { status: 'Growing', progress: 65, color: 'bg-blue-100 text-blue-700 border-blue-200' },
        { status: 'Ready', progress: 100, color: 'bg-green-100 text-green-700 border-green-200' },
        { status: 'Harvested', progress: 100, color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
      ].map((batch) => (
        <div
          key={batch.status}
          className={`p-3 rounded-lg border ${batch.color}`}
        >
          <div className="text-xs font-medium mb-2">{batch.status}</div>
          <div className="w-full bg-white rounded-full h-2 mb-1">
            <div
              className="h-2 rounded-full bg-current opacity-60"
              style={{ width: `${batch.progress}%` }}
            />
          </div>
          <div className="text-xs">{batch.progress}%</div>
        </div>
      ))}
    </div>
    <div className="mt-4 text-xs text-neutral-600 text-center">
      3 active batches • 2 ready to sell
    </div>
  </div>
);

const FSSAIReportMockup = () => (
  <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm">
    <div className="text-xs text-neutral-500 mb-4 font-medium">FSSAI Traceability Report</div>
    <div className="bg-white rounded-lg p-4 border border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-neutral-900">Batch #GP-2026-042</div>
        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
          AB-Free ✅
        </div>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          <span className="text-neutral-700">Vaccination: Complete (IB, IBD, ND)</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          <span className="text-neutral-700">Medication: No antibiotics used</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          <span className="text-neutral-700">Biosecurity: Score 92/100</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
        <div className="text-xs text-neutral-500">QR Code</div>
        <div className="w-8 h-8 bg-neutral-200 rounded"></div>
      </div>
    </div>
  </div>
);

const AlertCardsMockup = () => (
  <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm">
    <div className="text-xs text-neutral-500 mb-4 font-medium">Smart Alerts</div>
    <div className="space-y-2">
      {[
        { severity: 'critical', title: 'HPAI Alert', desc: 'Gorakhpur zone • 15km away', color: 'bg-red-50 border-red-200 text-red-700' },
        { severity: 'warning', title: 'Heat Stress', desc: '43°C forecast • Day 35-42 birds', color: 'bg-amber-50 border-amber-200 text-amber-700' },
        { severity: 'info', title: 'Feed Price', desc: 'Maize +5% • Consider stock', color: 'bg-blue-50 border-blue-200 text-blue-700' },
      ].map((alert) => (
        <div
          key={alert.title}
          className={`p-3 rounded-lg border ${alert.color}`}
        >
          <div className="flex items-start gap-2">
            <Warning size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold mb-1">{alert.title}</div>
              <div className="text-xs opacity-90">{alert.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Tab data with mockups
const tabData = [
  {
    id: 'priceIntelligence',
    icon: <TrendUp size={20} />,
    mockup: <PriceChartMockup />,
  },
  {
    id: 'sellSignal',
    icon: <CheckCircle size={20} />,
    mockup: <SellVsHoldMockup />,
  },
  {
    id: 'farmOperations',
    icon: <Calendar size={20} />,
    mockup: <BatchBoardMockup />,
  },
  {
    id: 'healthCompliance',
    icon: <ClipboardText size={20} />,
    mockup: <FSSAIReportMockup />,
  },
  {
    id: 'smartAlerts',
    icon: <Warning size={20} />,
    mockup: <AlertCardsMockup />,
  },
];

export default function FeatureTabPreview() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('priceIntelligence');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    autoPlayRef.current = setInterval(() => {
      setActiveTab((prev) => {
        const currentIndex = tabData.findIndex((tab) => tab.id === prev);
        const nextIndex = (currentIndex + 1) % tabData.length;
        return tabData[nextIndex].id;
      });
    }, 6000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

  // Pause auto-play on user interaction
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsAutoPlaying(false);
    
    // Resume auto-play after 30 seconds of no interaction
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 30000);
  };

  // Scroll active tab into view on mobile
  useEffect(() => {
    const activeIndex = tabData.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabData.findIndex((tab) => tab.id === tabId);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (currentIndex + 1) % tabData.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (currentIndex - 1 + tabData.length) % tabData.length;
    } else {
      return;
    }

    e.preventDefault();
    handleTabClick(tabData[newIndex].id);
  };

  const activeContent = tabData.find((tab) => tab.id === activeTab);
  const tabTranslations = t(`home.featureTabPreview.tabs.${activeTab}`) as any;

  return (
    <SectionShell bg="white" ariaLabel="Feature preview">
      <SectionHeader
        eyebrow="FEATURES"
        heading={t('home.featureTabPreview.sectionTitle') as string}
        align="center"
      />

        {/* Tab Bar */}
        <div
          className="flex lg:justify-center gap-2 mb-12 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide"
          role="tablist"
          aria-label="Feature tabs"
        >
          {tabData.map((tab, index) => {
            const tabTranslation = t(`home.featureTabPreview.tabs.${tab.id}`) as any;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                className={`relative px-6 py-3 rounded-full font-jakarta font-semibold text-[0.875rem] transition-all duration-200 ease-out active:scale-[0.97] flex items-center gap-2 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-brand-700 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                {tab.icon}
                {tabTranslation?.label || tab.id}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeContent && tabTranslations && (
            <motion.div
              key={activeTab}
              id={`tabpanel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Left Panel - Description */}
              <div>
                <h3 className="font-sora font-bold text-[clamp(1.375rem,2vw+0.25rem,1.75rem)] leading-[1.15] tracking-[-0.025em] text-neutral-900 mb-4">
                  {tabTranslations.headline}
                </h3>
                <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.125rem)] text-neutral-600 mb-6 leading-[1.7]">
                  {tabTranslations.description}
                </p>
                <ul className="space-y-3">
                  {tabTranslations.benefits?.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-jakarta text-[0.9375rem] text-neutral-700 leading-snug">{benefit}</span>
                    </li>
                  ))}
                </ul>
                {tabTranslations.cta && (
                  <motion.a
                    href="/accuracy"
                    className="inline-flex items-center gap-2 mt-6 text-brand-700 font-semibold hover:text-brand-800 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {tabTranslations.cta}
                  </motion.a>
                )}
              </div>

              {/* Right Panel - CSS Mockup */}
              <div className="flex justify-center">
                {activeContent.mockup}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </SectionShell>
  );
}

