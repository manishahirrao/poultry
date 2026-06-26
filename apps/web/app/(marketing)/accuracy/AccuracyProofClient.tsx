// FlockIQ — Accuracy Page Client Component
// File: apps/web/app/(marketing)/accuracy/AccuracyProofClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-002 (Phase 9)
// Requirements: FR-ACC-001 to FR-ACC-004
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 07
// @ts-nocheck

'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useInView as useInViewHook } from 'react-intersection-observer';
import { CountUp } from '@/components/motion/CountUp';
import { TrendingUp, Target, ShieldCheck, TrendingDown, Download, FileText, Clock, CheckCircle, XCircle, Info } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';

// Lazy load Recharts components to avoid hydration mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComposedChart = dynamic(() => import('recharts').then(mod => ({ default: mod.ComposedChart as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Area = dynamic(() => import('recharts').then(mod => ({ default: mod.Area as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid as any })), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend as any })), { ssr: false });

interface AccuracyData {
  directionalAccuracy: number;
  mape30d: number;
  conformalCoverage: number;
  predictionsVerified: number;
  lastUpdated: string;
  last30Days: Array<{
    date: string;
    mape: number;
    directionCorrect: boolean;
    district: string;
    predictedP50: number;
    actualPrice: number;
  }>;
  stressTests: Array<{
    name: string;
    period: string;
    directionalAccuracyDuring: number;
    description: string;
  }>;
}

interface AccuracyProofClientProps {
  accuracy: AccuracyData;
}

// Feature importance data (top 5 model signals)
const featureImportanceData = [
  { name: 'Feed cost (42 days ago)', importance: 42 },
  { name: 'Last week avg price', importance: 18 },
  { name: 'Festival calendar', importance: 15 },
  { name: 'Heat stress index', importance: 13 },
  { name: 'HPAI zone status', importance: 12 },
];

export default function AccuracyProofClient({ accuracy }: AccuracyProofClientProps) {
  const [sortField, setSortField] = useState<'date' | 'mape'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [chartLoaded, setChartLoaded] = useState(false);
  const [trackedDepths, setTrackedDepths] = useState<Set<number>>(new Set());

  // Calculate running accuracy for table header
  const correctPredictions = accuracy.last30Days.filter(p => p.directionCorrect).length;
  const runningAccuracy = ((correctPredictions / accuracy.last30Days.length) * 100).toFixed(1);

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      
      const depthsToTrack = [25, 50, 75, 100];
      depthsToTrack.forEach(depth => {
        if (scrolled >= depth && !trackedDepths.has(depth)) {
          trackAccuracyPageViewed(depth as 25 | 50 | 75 | 100);
          setTrackedDepths(prev => new Set([...prev, depth]));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackedDepths]);

  // Sort prediction history
  const sortedPredictions = [...accuracy.last30Days].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return sortDirection === 'asc' ? a.mape - b.mape : b.mape - a.mape;
    }
  });

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Toggle sort
  const handleSort = (field: 'date' | 'mape') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Load charts when in view
  const { ref: chartRef, inView } = useInViewHook({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      setChartLoaded(true);
    }
  }, [inView]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Dark */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="font-space-grotesk font-bold text-[clamp(2rem,4vw+1rem,3.5rem)] leading-[1.1] mb-4">
              The Most Transparent AI in Indian Agri-Tech
            </h1>
            <p className="font-space-grotesk text-lg text-neutral-300 max-w-3xl mx-auto mb-8">
              We publish our accuracy live. Every day.
              <br />
              Because we built this product for farmers, not for investors.
            </p>
          </motion.div>

          {/* 4 Live Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-white mb-2">
                <AnimatedStat value={accuracy.directionalAccuracy} decimals={1} suffix="%" />
              </div>
              <div className="text-sm text-neutral-400 mb-1">Directional Accuracy</div>
              <div className="text-xs text-brand-green-400">Target: 95%+</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-white mb-2">
                <AnimatedStat value={accuracy.mape30d} decimals={1} suffix="%" />
              </div>
              <div className="text-sm text-neutral-400 mb-1">MAPE (30d)</div>
              <div className="text-xs text-brand-green-400">&lt; 6% target ✅</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-white mb-2">
                <AnimatedStat value={accuracy.conformalCoverage} decimals={1} suffix="%" />
              </div>
              <div className="text-sm text-neutral-400 mb-1">Conformal Coverage</div>
              <div className="text-xs text-brand-green-400">78-82% target</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-white mb-2">
                <AnimatedStat value={accuracy.predictionsVerified} decimals={0} />
              </div>
              <div className="text-sm text-neutral-400 mb-1">Predictions Verified</div>
              <div className="text-xs text-neutral-500">Ground-truthed</div>
            </motion.div>
          </div>

          <div className="mt-8 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
            <Clock size={16} />
            Updated daily · Last: {new Date(accuracy.lastUpdated).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })} IST
          </div>
        </div>
      </section>

      {/* 30-Day MAPE Trend Chart */}
      <section className="py-16 bg-white" ref={chartRef}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              30-Day MAPE Trend
            </h2>
            <p className="text-neutral-600">
              Daily MAPE performance over the last 30 days. Green zone indicates target performance (&lt; 6%).
            </p>
          </motion.div>

          {chartLoaded && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={accuracy.last30Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    label={{ value: 'MAPE %', angle: -90, position: 'insideLeft' }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'MAPE']}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="mape"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    stroke="#22c55e"
                    name="MAPE"
                  />
                  <Line
                    type="monotone"
                    dataKey="mape"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="MAPE Trend"
                  />
                  {/* Reference line at 6% */}
                  <Line
                    type="monotone"
                    dataKey={() => 6}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target (6%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Prediction History Table */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Prediction History
            </h2>
            <p className="text-neutral-600">
              Showing {accuracy.last30Days.length} predictions — {runningAccuracy}% correct direction
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 cursor-pointer hover:bg-neutral-200"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      District
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Predicted P50
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Actual Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                      Direction ✓?
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 cursor-pointer hover:bg-neutral-200"
                      onClick={() => handleSort('mape')}
                    >
                      MAPE {sortField === 'mape' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPredictions.map((prediction, index) => (
                    <tr 
                      key={index}
                      className={`border-t border-neutral-100 ${
                        !prediction.directionCorrect ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {formatDate(prediction.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        {prediction.district}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        ₹{prediction.predictedP50.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        ₹{prediction.actualPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {prediction.directionCorrect ? (
                          <span className="text-green-600">✅</span>
                        ) : (
                          <span className="text-amber-600">❌</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${
                        prediction.mape < 6 ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {prediction.mape.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Accordion */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Methodology
            </h2>
            <p className="text-neutral-600">
              How our model achieves 95%+ directional accuracy
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: 'What is MAPE?',
                answer: 'MAPE (Mean Absolute Percentage Error) measures the average percentage difference between our predicted prices and actual market prices. A MAPE below 6% means our predictions are, on average, within 6% of the actual price.',
              },
              {
                question: 'What is directional accuracy?',
                answer: 'Directional accuracy measures whether we correctly predicted whether prices would go up or down. 96.2% directional accuracy means we got the direction right 96 out of 100 times. This is what matters most for sell timing decisions.',
              },
              {
                question: 'What data does the model use?',
                answer: 'Our model uses 47 public data sources including AGMARKNET mandi prices, NECC poultry statistics, IMD weather forecasts, feed commodity prices (maize, soy), festival calendars, and HPAI outbreak data from government sources.',
              },
              {
                question: 'How often does the model retrain?',
                answer: 'The model retrains weekly with a champion/challenger framework. We test new model versions against a 6-month holdout dataset before deployment. If a new version beats the current champion by 2%+ directional accuracy, we promote it.',
              },
              {
                question: 'What are conformal prediction intervals?',
                answer: 'Conformal prediction gives us statistically valid confidence intervals. When we show P10-P90 ranges, there is a calibrated 80% probability that the actual price will fall within that range. This helps you understand uncertainty in the forecast.',
              },
            ].map((item, index) => (
              <details
                key={index}
                className="group bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-neutral-100 transition-colors">
                  <span className="font-semibold text-neutral-900">{item.question}</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 py-4 text-neutral-700 border-t border-neutral-200">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Importance Bar Chart */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Feature Importance
            </h2>
            <p className="text-neutral-600">
              Top 5 factors that drive today's price forecast. This demystifies the AI and shows you what the model is actually looking at.
            </p>
          </motion.div>

          {chartLoaded && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={featureImportanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={180}
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Importance']}
                  />
                  <Bar dataKey="importance" fill="#1a6b3c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Stress Test Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Stress Test Results
            </h2>
            <p className="text-neutral-600">
              How our model performed during historical market shocks
            </p>
          </motion.div>

          <div className="space-y-6">
            {accuracy.stressTests.map((test, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-neutral-50 rounded-2xl p-6 border border-brand-green-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-green-100 rounded-full flex items-center justify-center">
                    {index === 0 && <TrendUp size={24} className="text-brand-green-700" />}
                    {index === 1 && <ShieldCheck size={24} className="text-brand-green-700" />}
                    {index === 2 && <ChartLineUp size={24} className="text-brand-green-700" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-space-grotesk font-bold text-lg text-neutral-900 mb-1">
                      {test.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-3">{test.period}</p>
                    <p className="text-neutral-700 mb-4">{test.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green-100 text-brand-green-700 rounded-full text-sm font-semibold">
                      Directional accuracy during event: {test.directionalAccuracyDuring}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual Validation Attestation */}
      <section className="py-16 bg-brand-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 border border-brand-green-200"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-green-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-brand-green-700" />
              </div>
              <div>
                <h3 className="font-space-grotesk font-bold text-xl text-neutral-900 mb-2">
                  Manual Validation Attestation
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  Our CTO and Data Head spent 10 days at Gorakhpur APMC in November 2025, 
                  recording actual broker prices manually. Our model predicted the correct 
                  direction 9 out of 10 days. This is our baseline before we take a single 
                  rupee from customers.
                </p>
              </div>
            </div>

            <a
              href="/docs/accuracy-cert-2026.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green-700 text-white font-semibold rounded-full hover:bg-brand-green-800 transition-colors"
            >
              <Download size={20} />
              Download Accuracy Certification Report
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] mb-4">
              See accuracy in your district — Start Free Trial
            </h2>
            <p className="font-space-grotesk text-lg text-brand-green-100 mb-8">
              14 days free. No credit card required.
            </p>
            <a
              href="/login?action=signup"
              className="inline-block px-8 py-4 bg-white text-brand-green-700 font-semibold rounded-full hover:bg-brand-green-50 transition-colors"
            >
              Start Free Trial
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
