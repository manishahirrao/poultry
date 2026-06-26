'use client';

import Link from 'next/link';
import { CheckCircle, Warning } from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

interface FarmMiniCard {
  id: string;
  name: string;
  batchNumber: number;
  dayNumber: number;
  targetDays: number;
  fcr: number;
  mortalityPct: number;
  logSubmittedToday: boolean;
  logTime?: string;
}

interface FarmQuickSummaryProps {
  farms: FarmMiniCard[];
  isLoading?: boolean;
}

export function FarmQuickSummary({ farms, isLoading = false }: FarmQuickSummaryProps) {
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[280px] h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!farms || farms.length === 0) {
    return null;
  }

  const getFCRColor = (fcr: number) => {
    if (fcr < 1.70) return 'text-green-600';
    if (fcr < 1.90) return 'text-lime-600';
    if (fcr < 2.10) return 'text-amber-600';
    return 'text-red-600';
  };

  const getMortalityColor = (pct: number) => {
    if (pct < 2.5) return 'text-green-600';
    if (pct < 4.0) return 'text-amber-600';
    return 'text-red-600';
  };

  const progressPercentage = (day: number, target: number) => {
    return Math.min((day / target) * 100, 100);
  };

  const pendingLogsCount = farms.filter(f => !f.logSubmittedToday).length;

  return (
    <div className="bg-white rounded-xl border border-[#E3EDE7] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {isHindi ? 'आज के Farms' : "Today's Farms"}
          </h2>
          <p className="text-xs text-gray-500">
            {isHindi ? 'आज के फार्म की स्थिति' : "Today's Farm Status"}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {farms.length} {isHindi ? 'फार्म' : 'farms'} · {pendingLogsCount} {isHindi ? 'आज के लॉग पेंडिंग हैं' : "today's logs pending"}
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {farms.map((farm) => (
          <Link
            key={farm.id}
            href={`/dashboard/farms/${farm.id}`}
            className="min-w-[280px] bg-[#F4F7F5] rounded-lg p-4 hover:shadow-md transition-shadow border border-[#E3EDE7]"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{farm.name}</h3>
                <p className="text-xs text-gray-500">
                  {isHindi ? `बैच #${farm.batchNumber} · दिन ${farm.dayNumber} (~${farm.targetDays} में से)` : `Batch #${farm.batchNumber} · Day ${farm.dayNumber} of ~${farm.targetDays}`}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">FCR</p>
                <p className={`text-sm font-semibold ${getFCRColor(farm.fcr)}`}>
                  {farm.fcr.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mort%</p>
                <p className={`text-sm font-semibold ${getMortalityColor(farm.mortalityPct)}`}>
                  {farm.mortalityPct.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A5C34] transition-all"
                  style={{ width: `${progressPercentage(farm.dayNumber, farm.targetDays)}%` }}
                />
              </div>
            </div>

            {farm.logSubmittedToday ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle size={14} />
                <span>
                  {isHindi ? `${farm.logTime} पर लॉग सबमिट किया गया` : `Log submitted at ${farm.logTime}`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-600 group hover:underline">
                <Warning size={14} />
                <span>
                  {isHindi ? "आज का लॉग पेंडिंग — अभी सबमिट करें →" : "Today's log pending — Submit now →"}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#E3EDE7]">
        <Link
          href="/dashboard/farms"
          className="text-sm text-[#1A5C34] hover:underline font-semibold"
        >
          {isHindi ? 'सभी फार्म देखें →' : 'View All Farms →'}
        </Link>
      </div>
    </div>
  );
}
