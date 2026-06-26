// FlockIQ AI — Feature Deep-Dive Tabbed Section
// File: apps/web/components/home/FeatureTabsSection.tsx
// Version: v1.0 | May 2026
// Task Reference: B-07
// Requirements: Design §H-07

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendUp, Calendar, Warning, DeviceMobile, CheckCircle } from '@phosphor-icons/react';
import { SectionShell } from '@/components/ui/SectionShell';
import SectionHeader from '@/components/ui/SectionHeader';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: {
    title: string;
    description: string;
    points: string[];
    visual: React.ReactNode;
  };
}

const tabs: Tab[] = [
  {
    id: 'today-price',
    label: 'आज का भाव (Coming Soon)',
    icon: <TrendUp size={20} />,
    content: {
      title: "Today's Price",
      description: 'हर सुबह 4:30 AM को 47 sources से data — 06:00 AM पर AI prediction — 06:30 AM पर आपके phone पर',
      points: [
        'P10/P50/P90 explanation: "₹155 (low) — ₹165 (likely) — ₹175 (high) — we tell you all three, not just one number. Live bird vs dressed bird prices tracked separately."',
        'Offline mode: "No internet? Last cached price shows with timestamp — you are never in the dark. Works even on basic ₹8,000 Android phones."',
        'Comparison callout: "WhatsApp mandi groups बताते हैं कल का भाव। हम बताते हैं अगले 7 दिन का — Cobb 400, Ross 308, Hubbard-specific."',
        'Breed-specific: "Different growth rates (Cobb 400: 2.2kg @ 35 days, Ross 308: 2.3kg @ 35 days, Hubbard: 2.1kg @ 35 days) mean different optimal sell days."',
      ],
      visual: (
        <div className="bg-signal-light rounded-2xl p-6">
          <div className="text-center">
            <div className="text-sm text-neutral-500 mb-2">आज का भाव — गोरखपुर</div>
            <div className="text-4xl font-jakarta font-bold text-signal-500 mb-2">₹165/kg</div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-red-600">₹155 (low)</div>
              <div className="text-signal-500 font-semibold">₹165 (likely)</div>
              <div className="text-green-600">₹175 (high)</div>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'when-to-sell',
    label: 'बेचें कब? (Coming Soon)',
    icon: <Calendar size={20} />,
    content: {
      title: 'When to Sell',
      description: 'Your birds are ready at Day 35. But Day 42 might be worth ₹3/kg more. Or Day 40 might see a price crash. We tell you exactly which day to sell — not a range, an answer.',
      points: [
        'Batch age slider (28–56 days) with breed-specific weight targets (Cobb 400: 2.2kg @ 35 days, Ross 308: 2.3kg @ 35 days)',
        'Optimal 14-day window with colour-coded days based on FCR curves (pre-starter 0-10d: FCR 1.2, starter 11-24d: FCR 1.4, finisher 25-42d: FCR 1.6-1.8)',
        'Profit calculator (pre-filled from your farm profile) — accounts for feed cost volatility (maize ₹1,800-2,200/qtl, soybean meal ₹3,800-4,500/qtl)',
        'Middleman check: "Enter price offered → we say fair/low/high based on current Gorakhpur APMC live bird rates"',
        'Transport cost factoring: "₹0.50-1.00/kg for 50-100km radius to major processing plants"',
      ],
      visual: (
        <div className="bg-signal-light rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="text-sm text-neutral-500 mb-2">Optimal Sell Window</div>
            <div className="flex justify-center gap-2">
              {[35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48].map((day) => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                    day === 40
                      ? 'bg-green-500 text-white'
                      : day >= 38 && day <= 42
                      ? 'bg-green-200 text-green-700'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-green-600">Day 40: Best Price (₹168/kg)</span>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'alerts',
    label: 'बाज़ार समाचार',
    icon: <Warning size={20} />,
    content: {
      title: 'Market Alerts',
      description: '48 घंटे पहले चेतावनी — HPAI का, मौसम का, भाव गिरने का',
      points: [
        'November 2024: HPAI zone declared near Gorakhpur. FlockIQ customers who saw the alert 48 hours earlier avoided ₹3–5L losses on 25,000-bird flocks.',
        'Alert types: HPAI (H5N1, H5N8), heat stress alerts for 35-42 day birds (mortality risk above 35°C), feed price spikes (maize/soybean)',
        'Real-time disease tracking from government sources (ICAR, DAHD) with 10km radius notifications',
        'Weather impact: "Heat wave (43°C) → increased mortality in finisher phase → reduced market supply → price spike prediction"',
        'Vaccination reminders: "Day 7: RD vaccine, Day 14: IB vaccine, Day 21: IBD vaccine" — timing affects sell window',
      ],
      visual: (
        <div className="bg-red-50 rounded-2xl p-6 border border-red200">
          <div className="flex items-start gap-3">
            <Warning size={24} className="text-red-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-red-700 mb-1">⚠️ HPAI Alert</div>
              <div className="text-sm text-red-600 mb-2">Gorakhpur District</div>
              <div className="text-xs text-neutral-600">
                Disease detected in nearby area. Consider selling within 48 hours to avoid transport restrictions.
              </div>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: <DeviceMobile size={20} />,
    content: {
      title: 'WhatsApp Channel',
      description: 'आपको नया app सीखने की ज़रूरत नहीं। सिर्फ WhatsApp चाहिए।',
      points: [
        'No new app to learn. Just WhatsApp — works even on slow 2G networks in rural areas.',
        'Daily message sample shown in WhatsApp green bubble with breed-specific data (Cobb 400, Ross 308, Hubbard)',
        '6:30 AM सुबह — हर रोज़ — सात दिन — before morning feed distribution',
        'Works on basic Android phones too (₹8,000-15,000 range) — no high-end device required',
        'Hindi + English bilingual messages — no language barrier for farm workers',
      ],
      visual: (
        <div className="bg-green-500 rounded-2xl p-6 text-white max-w-xs mx-auto">
          <div className="text-sm font-semibold mb-2">🐔 आज का भाव — गोरखपुर</div>
          <div className="text-2xl font-bold mb-1">₹168/kg</div>
          <div className="text-xs opacity-90 mb-2">(₹161–₹175 संभावित)</div>
          <div className="text-sm font-semibold mb-1">संकेत: ✅ आज बेचें</div>
          <div className="text-xs opacity-90 mb-2">कारण: मंडी में आवक कम, खरीदार ज़्यादा, मौसम अच्छा</div>
          <div className="text-xs opacity-90">—FlockIQ AI</div>
        </div>
      ),
    },
  },
];

export default function FeatureTabsSection() {
  const [activeTab, setActiveTab] = useState('today-price');

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else {
      return;
    }

    e.preventDefault();
    setActiveTab(tabs[newIndex].id);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <SectionShell bg="white" ariaLabel="Product features">
      <SectionHeader
        eyebrow="PRODUCT FEATURES"
        heading="Explore Our Features"
        align="center"
      />

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`relative px-6 py-3 rounded-full font-semibold transition-transform duration-200 ease-out active:scale-[0.97] flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-brand-700 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand-700 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeContent && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 100, damping: 20 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Content */}
              <div>
                <h3 className="font-jakarta font-bold text-2xl text-neutral-900 mb-4">
                  {activeContent.title}
                </h3>
                <p className="font-jakarta text-lg text-neutral-700 mb-6 leading-relaxed">
                  {activeContent.description}
                </p>
                <ul className="space-y-3">
                  {activeContent.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="flex justify-center">
                {activeContent.visual}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </SectionShell>
  );
}

