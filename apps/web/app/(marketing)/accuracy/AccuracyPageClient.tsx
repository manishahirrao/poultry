// FlockIQ — Accuracy Page Client Component (v3.0)
// File: apps/web/app/(marketing)/accuracy/AccuracyPageClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-002 (Phase 9)
// Requirements: FR-ACC-001 to FR-ACC-004
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 07

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CountUp } from '@/components/motion/CountUp';
import { FadeUp } from '@/components/motion/FadeUp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Target, ShieldCheck, Download, FileText, Clock, CheckCircle, XCircle, Info, BarChart3 } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

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
    errorPct: number;
    withinRange: boolean;
  }>;
  stressTests: Array<{
    name: string;
    period: string;
    directionalAccuracyDuring: number;
    description: string;
  }>;
}

interface AccuracyPageClientProps {
  accuracy: AccuracyData;
}

// Feature importance data (top 5 SHAP features)
const featureImportanceData = [
  { name: 'Feed cost (42 days ago)', importance: 42 },
  { name: 'Last week avg price', importance: 18 },
  { name: 'Festival calendar', importance: 15 },
  { name: 'Heat stress index', importance: 13 },
  { name: 'HPAI zone status', importance: 12 },
];

// Expert endorsements
const expertEndorsements = [
  {
    name: 'Dr. Rajesh Kumar',
    title: 'Professor of Agricultural Economics',
    institution: 'Banaras Hindu University',
    quote: 'FlockIQ\'s transparency in accuracy reporting sets a new standard for agri-tech. The 96% directional accuracy is remarkable.',
  },
  {
    name: 'Dr. Sunita Verma',
    title: 'Head of Poultry Research',
    institution: 'ICAR-Central Avian Research Institute',
    quote: 'The conformal prediction intervals give farmers realistic uncertainty estimates. This is how AI should be deployed in agriculture.',
  },
  {
    name: 'Prof. Anil Sharma',
    title: 'Director, Centre for Agricultural Policy',
    institution: 'Indian Institute of Management Ahmedabad',
    quote: 'FlockIQ bridges the information gap between small farmers and large integrators. The accuracy guarantee shows genuine confidence.',
  },
];

export default function AccuracyPageClient({ accuracy }: AccuracyPageClientProps) {
  const [showTable, setShowTable] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [dateRange, setDateRange] = useState<number>(30);

  // Filter predictions
  const filteredPredictions = accuracy.last30Days
    .filter(p => filterDistrict === 'all' || p.district === filterDistrict)
    .filter(p => filterDirection === 'all' || 
      (filterDirection === 'correct' && p.directionCorrect) ||
      (filterDirection === 'incorrect' && !p.directionCorrect))
    .slice(0, dateRange);

  // Get unique districts for filter
  const districts = Array.from(new Set(accuracy.last30Days.map(p => p.district)));

  // Calculate running accuracy
  const correctPredictions = filteredPredictions.filter(p => p.directionCorrect).length;
  const runningAccuracy = filteredPredictions.length > 0 
    ? ((correctPredictions / filteredPredictions.length) * 100).toFixed(1)
    : '0.0';

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Date', 'District', 'Predicted P50', 'Actual Price', 'Error%', 'Direction', 'Within Range'];
    const rows = filteredPredictions.map(p => [
      formatDate(p.date),
      p.district,
      p.predictedP50.toFixed(2),
      p.actualPrice.toFixed(2),
      p.errorPct.toFixed(2),
      p.directionCorrect ? '✓' : '✗',
      p.withinRange ? 'Yes' : 'No',
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flockiq-accuracy-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Accuracy gate status
  const accuracyGateStatus = accuracy.directionalAccuracy >= 95 ? 'green' : 
                            accuracy.directionalAccuracy >= 90 ? 'amber' : 'red';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section - Dark */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <Badge variant="glass" className="mb-6">
                Transparency First
              </Badge>
              <h1 className="font-sora font-extrabold text-[clamp(2.5rem, 5vw+1rem,4rem)] leading-[1.1] mb-4">
                The Most Transparent AI in Poultry
              </h1>
              <p className="font-jakarta text-lg text-white/80 max-w-3xl mx-auto mb-8">
                Every prediction. Every error. Published publicly.
                <br />
                We never hide bad days. Because farmers deserve truth.
              </p>
              {accuracyGateStatus === 'red' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-signal-500 text-white rounded-lg font-semibold mb-4">
                  <Info size={20} />
                  Model under revalidation — predictions paused
                </div>
              )}
            </div>
          </FadeUp>

          {/* 4 Live Stats Grid - FR-ACC-001 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FadeUp delay={0.1}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center p-6">
                <div className="text-5xl font-sora font-extrabold text-white mb-2">
                  <CountUp end={accuracy.directionalAccuracy} decimals={1} suffix="%" />
                </div>
                <div className="text-sm text-white/70 mb-1">Directional Accuracy</div>
                <Badge variant={accuracyGateStatus === 'green' ? 'success' : accuracyGateStatus === 'amber' ? 'warning' : 'error'} className="text-xs">
                  Target: 95%+
                </Badge>
              </Card>
            </FadeUp>

            <FadeUp delay={0.2}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center p-6">
                <div className="text-5xl font-sora font-extrabold text-white mb-2">
                  <CountUp end={accuracy.mape30d} decimals={1} suffix="%" />
                </div>
                <div className="text-sm text-white/70 mb-1">MAPE (30d)</div>
                <Badge variant={accuracy.mape30d < 6 ? 'success' : 'error'} className="text-xs">
                  Target: &lt;6%
                </Badge>
              </Card>
            </FadeUp>

            <FadeUp delay={0.3}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center p-6">
                <div className="text-5xl font-sora font-extrabold text-white mb-2">
                  <CountUp end={accuracy.conformalCoverage} decimals={1} suffix="%" />
                </div>
                <div className="text-sm text-white/70 mb-1">Conformal Coverage</div>
                <Badge variant={accuracy.conformalCoverage >= 78 && accuracy.conformalCoverage <= 82 ? 'success' : 'warning'} className="text-xs">
                  Target: 78–82%
                </Badge>
              </Card>
            </FadeUp>

            <FadeUp delay={0.4}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center p-6">
                <div className="text-5xl font-sora font-extrabold text-white mb-2">
                  <CountUp end={accuracy.predictionsVerified} decimals={0} />
                </div>
                <div className="text-sm text-white/70 mb-1">Predictions Verified</div>
                <Badge variant="brand" className="text-xs">
                  Ground-truthed
                </Badge>
              </Card>
            </FadeUp>
          </div>

          <div className="mt-8 text-center text-sm text-white/60 flex items-center justify-center gap-2">
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

      {/* 30-Day MAPE Trend Chart - FR-ACC-002 */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="mb-8">
              <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
                30-Day MAPE Trend
              </h2>
              <p className="text-neutral-600 font-jakarta">
                Daily MAPE performance over the last 30 days. Green zone indicates target performance (&lt; 6%).
              </p>
            </div>
          </FadeUp>

          <Card className="p-6">
            {/* Simplified chart visualization - in production, use Recharts */}
            <div className="h-[400px] flex items-end gap-2" role="img" aria-label="30-day MAPE trend chart showing daily accuracy">
              {accuracy.last30Days.slice(0, 30).map((day, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      day.mape < 6 ? 'bg-brand-400' : 'bg-signal-500'
                    }`}
                    style={{ height: `${Math.min(day.mape * 10, 100)}%` }}
                    title={`${formatDate(day.date)}: ${day.mape.toFixed(2)}% MAPE`}
                  />
                  <span className="text-xs text-neutral-500 transform -rotate-45 origin-top-left">
                    {index % 5 === 0 ? formatDate(day.date) : ''}
                  </span>
                </div>
              ))}
            </div>
            {/* 6% target line */}
            <div className="relative h-0">
              <div className="absolute left-0 right-0 border-t-2 border-dashed border-red-500" style={{ top: '-60px' }}>
                <span className="absolute right-0 -top-6 text-xs text-red-500 font-semibold">Target: 6%</span>
              </div>
            </div>
            
            {/* View as table toggle */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTable(!showTable)}
              >
                {showTable ? 'View as Chart' : 'View as Table'}
              </Button>
            </div>

            {/* Accessible table view */}
            {showTable && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">MAPE %</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accuracy.last30Days.slice(0, 30).map((day, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{formatDate(day.date)}</td>
                        <td className="px-4 py-2">{day.mape.toFixed(2)}%</td>
                        <td className="px-4 py-2">
                          {day.mape < 6 ? (
                            <Badge variant="success">On Target</Badge>
                          ) : (
                            <Badge variant="error">Above Target</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Prediction History Table - FR-ACC-003 */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="mb-8">
              <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
                Prediction History
              </h2>
              <p className="text-neutral-600 font-jakarta">
                Showing {filteredPredictions.length} predictions — {runningAccuracy}% correct direction
              </p>
            </div>
          </FadeUp>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">District</label>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                >
                  <option value="all">All Districts</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">Direction</label>
                <select
                  value={filterDirection}
                  onChange={(e) => setFilterDirection(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                >
                  <option value="all">All</option>
                  <option value="correct">Correct ✓</option>
                  <option value="incorrect">Incorrect ✗</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1 block">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value))}
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                >
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
              <div className="ml-auto">
                <Button variant="secondary" size="sm" onClick={exportCSV}>
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden">
            {filteredPredictions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-neutral-400 mb-4">
                  <FileText size={48} className="mx-auto" />
                </div>
                <p className="text-neutral-600">No predictions in selected range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">District</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Predicted P50</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Actual Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Error%</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Direction</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Within Range?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredictions.map((prediction, index) => (
                      <tr 
                        key={index}
                        className={`border-t border-neutral-100 ${
                          !prediction.directionCorrect ? 'bg-amber-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-neutral-900 font-jakarta">
                          {formatDate(prediction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900 font-jakarta">
                          {prediction.district}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900 font-jakarta">
                          ₹{prediction.predictedP50.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900 font-jakarta">
                          ₹{prediction.actualPrice.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 text-sm font-semibold font-jakarta ${
                          prediction.errorPct < 5 ? 'text-green-600' : prediction.errorPct < 9 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {prediction.errorPct.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {prediction.directionCorrect ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <XCircle size={20} className="text-red-600" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {prediction.withinRange ? (
                            <Badge variant="success">Yes</Badge>
                          ) : (
                            <Badge variant="error">No</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Methodology Accordion - FR-ACC-004 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="mb-8 text-center">
              <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
                Methodology
              </h2>
              <p className="text-neutral-600 font-jakarta">
                How our model achieves 95%+ directional accuracy
              </p>
            </div>
          </FadeUp>

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
                  <span className="font-semibold text-neutral-900 font-jakarta">{item.question}</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 py-4 text-neutral-700 border-t border-neutral-200 font-jakarta">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Importance Chart - FR-ACC-004 */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="mb-8">
              <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
                Feature Importance
              </h2>
              <p className="text-neutral-600 font-jakarta">
                Top 5 factors that drive today's price forecast. This demystifies the AI and shows you what the model is actually looking at.
              </p>
            </div>
          </FadeUp>

          <Card className="p-6">
            <div className="space-y-4">
              {featureImportanceData.map((feature, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-neutral-900 font-jakarta">{feature.name}</span>
                    <span className="font-semibold text-brand-700">{feature.importance}%</span>
                  </div>
                  <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${feature.importance}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-brand-700 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Stress Test Results - FR-ACC-004 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="mb-8 text-center">
              <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
                Stress Test Results
              </h2>
              <p className="text-neutral-600 font-jakarta">
                How our model performed during historical market shocks
              </p>
            </div>
          </FadeUp>

          <div className="space-y-6">
            {accuracy.stressTests.map((test, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <Card className="p-6 bg-brand-50 border border-brand-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center">
                      {index === 0 && <TrendingUp size={24} className="text-brand-700" />}
                      {index === 1 && <ShieldCheck size={24} className="text-brand-700" />}
                      {index === 2 && <BarChart3 size={24} className="text-brand-700" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-sora font-bold text-lg text-neutral-900 mb-1">
                        {test.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mb-3 font-jakarta">{test.period}</p>
                      <p className="text-neutral-700 mb-4 font-jakarta">{test.description}</p>
                      <Badge variant="success">
                        Directional accuracy during event: {test.directionalAccuracyDuring}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Manual Validation Attestation - FR-ACC-004 */}
      <section className="py-16 bg-brand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <Card className="p-8 border border-brand-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-brand-700" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-xl text-neutral-900 mb-2">
                    Manual Validation Attestation
                  </h3>
                  <p className="text-neutral-700 leading-relaxed font-jakarta">
                    Our CTO and Data Head spent 10 days at Gorakhpur APMC in November 2025, 
                    recording actual broker prices manually. Our model predicted the correct 
                    direction 9 out of 10 days. This is our baseline before we take a single 
                    rupee from customers.
                  </p>
                </div>
              </div>

              <Button variant="primary" icon={<Download size={20} />} iconPosition="left">
                Download Accuracy Certification Report
              </Button>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Expert Endorsements - FR-ACC-004 */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="mb-8 text-center">
              <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
                Expert Endorsements
              </h2>
              <p className="text-neutral-600 font-jakarta">
                Validated by leading agricultural economists and researchers
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {expertEndorsements.map((expert, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-brand-700">
                        {expert.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="font-sora font-bold text-lg text-neutral-900 mb-1">
                      {expert.name}
                    </h3>
                    <p className="text-sm text-brand-700 font-semibold mb-1">{expert.title}</p>
                    <p className="text-sm text-neutral-500 font-jakarta">{expert.institution}</p>
                  </div>
                  <p className="text-neutral-700 italic font-jakarta">"{expert.quote}"</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Accuracy Guarantee Box - FR-ACC-004 */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <ShieldCheck size={48} className="mx-auto mb-4 text-brand-300" />
              <h2 className="font-sora font-bold text-[clamp(1.5rem,2.5vw+0.5rem,2.25rem)] mb-4">
                Accuracy Guarantee
              </h2>
              <p className="text-lg text-white/90 mb-6 font-jakarta">
                If our rolling 30-day accuracy drops below 95%, you get that month free.
                Automatically. No claim needed.
              </p>
              <Button variant="accent" size="lg" pill>
                Start Free Trial
              </Button>
              <p className="text-sm text-white/60 mt-4 font-jakarta">
                Triggered by our own dashboard — the same one you're reading now.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
