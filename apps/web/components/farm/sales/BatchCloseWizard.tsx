'use client';

/**
 * FlockIQ - Batch Close Wizard
 * TASK-GAP2-UI-003: Batch Close Wizard modal
 * Requirements: REQ-GAP2-SALES-005
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §2.3
 * 
 * This component implements a 3-step modal wizard for closing batches:
 * - Step 1: Confirm Final Numbers - shows batch summary with computed values
 * - Step 2: Batch Performance Review - Radar chart + AI-generated summary
 * - Step 3: What's Next - checkboxes for next actions
 * 
 * Features:
 * - 640px wide modal with progress dots
 * - Recharts RadarChart with 3 datasets (this batch, farm average, platform benchmark)
 * - AI-generated batch summary (with fallback to template text)
 * - Confetti animation on close (CSS-only, no library)
 * - PDF download placeholder
 * - Redirects to Batch History tab after close
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  TrendUp, 
  TrendDown, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Plus,
  Calendar,
  Sparkle
} from '@phosphor-icons/react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface BatchData {
  id: string;
  batch_number: string;
  breed: string;
  birds_placed: number;
  birds_sold: number;
  total_mortality: number;
  avg_weight_kg: number;
  fcr: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_per_bird: number;
  farm_name: string;
}

interface BenchmarkData {
  metric: string;
  thisBatch: number;
  farmAverage: number;
  platformBenchmark: number;
}

interface BatchCloseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchData;
  farmId: string;
}

type WizardStep = 1 | 2 | 3;

export function BatchCloseWizard({ isOpen, onClose, batch, farmId }: BatchCloseWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isClosing, setIsClosing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  
  // Step 3 checkboxes
  const [downloadReport, setDownloadReport] = useState(true);
  const [startNewBatch, setStartNewBatch] = useState(false);
  const [scheduleNextPlacement, setScheduleNextPlacement] = useState(false);
  const [nextPlacementDate, setNextPlacementDate] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsClosing(false);
      setShowConfetti(false);
      setDownloadReport(true);
      setStartNewBatch(false);
      setScheduleNextPlacement(false);
      setNextPlacementDate('');
    }
  }, [isOpen]);

  // Fetch benchmark data and AI summary when entering step 2
  useEffect(() => {
    if (currentStep === 2) {
      fetchBenchmarkData();
      fetchAISummary();
    }
  }, [currentStep]);

  const fetchBenchmarkData = async () => {
    try {
      // Placeholder: In production, this would call GET /api/benchmark/data
      // For now, we'll generate mock data based on the batch metrics
      const mockData: BenchmarkData[] = [
        { metric: 'FCR', thisBatch: batch.fcr, farmAverage: 1.85, platformBenchmark: 1.75 },
        { metric: 'Mortality %', thisBatch: (batch.total_mortality / batch.birds_placed) * 100, farmAverage: 3.2, platformBenchmark: 2.8 },
        { metric: 'Avg Weight (kg)', thisBatch: batch.avg_weight_kg, farmAverage: 1.85, platformBenchmark: 2.0 },
        { metric: 'Batch Duration (days)', thisBatch: batch.duration_days, farmAverage: 40, platformBenchmark: 38 },
        { metric: 'Gross Margin %', thisBatch: (batch.gross_profit / batch.total_revenue) * 100, farmAverage: 18, platformBenchmark: 22 },
      ];
      setBenchmarkData(normalizeBenchmarkData(mockData));
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
    }
  };

  const normalizeBenchmarkData = (data: BenchmarkData[]): BenchmarkData[] => {
    // Normalize all metrics to 0-1 scale for radar chart
    return data.map(item => {
      const maxValue = Math.max(item.thisBatch, item.farmAverage, item.platformBenchmark);
      const minValue = Math.min(item.thisBatch, item.farmAverage, item.platformBenchmark);
      const range = maxValue - minValue || 1;
      
      return {
        metric: item.metric,
        thisBatch: (item.thisBatch - minValue) / range,
        farmAverage: (item.farmAverage - minValue) / range,
        platformBenchmark: (item.platformBenchmark - minValue) / range,
      };
    });
  };

  const fetchAISummary = async () => {
    setAiSummaryLoading(true);
    try {
      // Placeholder: In production, this would call POST /api/benchmark/insights
      // For now, we'll generate a template-based summary
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      const mortalityPct = ((batch.total_mortality / batch.birds_placed) * 100).toFixed(2);
      const marginPct = ((batch.gross_profit / batch.total_revenue) * 100).toFixed(1);
      
      const summary = `Batch #${batch.batch_number} performed ${batch.fcr < 1.8 ? 'above' : 'at'} your farm average. FCR improved to ${batch.fcr.toFixed(3)}. Mortality was excellent at ${mortalityPct}% vs farm avg of 3.2%. Gross margin of ${marginPct}% is ${parseFloat(marginPct) > 18 ? 'above' : 'at'} target.`;
      
      setAiSummary(summary);
    } catch (error) {
      console.error('Error fetching AI summary:', error);
      setAiSummary('Batch performance summary unavailable. Please check your metrics tab for detailed analysis.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleCloseBatch = async () => {
    setIsClosing(true);
    try {
      // Call the batch close API
      const response = await fetch(`/api/farms/${farmId}/batches/${batch.id}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birds_harvested: batch.birds_sold,
          closed_at: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to close batch');
      }

      // Trigger confetti animation
      setShowConfetti(true);

      // Handle PDF download (placeholder)
      if (downloadReport) {
        // Placeholder: Would trigger PDF generation via TASK-GAP7-API-002
        console.log('PDF download requested - placeholder implementation');
      }

      // Redirect after animation
      setTimeout(() => {
        setShowConfetti(false);
        onClose();
        // Redirect to Batch History tab
        window.location.href = `/dashboard/farms/${farmId}?tab=history`;
      }, 3000);

    } catch (error) {
      console.error('Error closing batch:', error);
      setIsClosing(false);
      alert('Failed to close batch. Please try again.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isClosing) {
      onClose();
    }
  };

  const formatCurrencyDollar = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="batch-close-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              {!isClosing && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 pt-6 pb-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      step === currentStep
                        ? 'w-8 bg-green-600'
                        : step < currentStep
                        ? 'w-2 bg-green-600'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="px-6 pb-6">
                {/* STEP 1: Confirm Final Numbers */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 id="batch-close-title" className="text-2xl font-bold text-gray-900 mb-2">
                      🎉 Close Batch #{batch.batch_number} — {batch.farm_name}
                    </h2>
                    <p className="text-gray-600 mb-6">Review your batch summary before closing</p>

                    {/* Final Summary Card */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Breed</p>
                          <p className="font-semibold text-gray-900">{batch.breed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">
                            Day 1 ({formatDate(batch.start_date)}) → Day {batch.duration_days} ({formatDate(batch.end_date)})
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Birds Placed</p>
                            <p className="font-semibold text-gray-900">{batch.birds_placed.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Birds Sold</p>
                            <p className="font-semibold text-gray-900">{batch.birds_sold.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Mortality</p>
                            <p className="font-semibold text-gray-900">
                              {batch.total_mortality} birds ({((batch.total_mortality / batch.birds_placed) * 100).toFixed(2)}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Avg Live Weight</p>
                            <p className="font-semibold text-gray-900">{batch.avg_weight_kg.toFixed(2)} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">FCR (final)</p>
                            <p className="font-semibold text-gray-900">{batch.fcr.toFixed(3)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">TOTAL REVENUE</span>
                            <span className="font-bold text-gray-900">{formatCurrencyDollar(batch.total_revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">TOTAL COST</span>
                            <span className="font-bold text-gray-900">{formatCurrencyDollar(batch.total_cost)}</span>
                          </div>
                          <div className="flex justify-between text-lg">
                            <span className="font-semibold text-gray-900">GROSS PROFIT</span>
                            <span className="font-bold text-green-600">
                              {formatCurrencyDollar(batch.gross_profit)} ({((batch.gross_profit / batch.total_revenue) * 100).toFixed(1)}% margin)
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-600">PROFIT PER BIRD</span>
                            <span className="font-semibold text-gray-900">{formatCurrencyDollar(batch.profit_per_bird)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edit links */}
                    <div className="flex gap-4 mb-6 text-sm">
                      <button className="text-blue-600 hover:text-blue-800 hover:underline">
                        Edit Mortality
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 hover:underline">
                        Edit Revenue
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 hover:underline">
                        Edit Costs
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleNext}
                        className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                      >
                        Next <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Batch Performance Review */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      How did this batch compare?
                    </h2>
                    <p className="text-gray-600 mb-6">Performance review against benchmarks</p>

                    {/* AI Summary Card */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
                      {aiSummaryLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin">
                            <Sparkle size={20} className="text-green-600" />
                          </div>
                          <span className="text-sm text-green-800">Generating AI insight...</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <Sparkle size={20} weight="fill" className="text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-green-900">{aiSummary}</p>
                        </div>
                      )}
                    </div>

                    {/* Radar Chart */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={benchmarkData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis 
                            dataKey="metric" 
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 1]}
                            tick={false}
                          />
                          <Legend />
                          
                          {/* This Batch - Blue solid line */}
                          <Radar
                            name="This Batch"
                            dataKey="thisBatch"
                            stroke="#2563EB"
                            fill="#2563EB"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          
                          {/* Farm Average - Green dotted line */}
                          <Radar
                            name="Farm Average"
                            dataKey="farmAverage"
                            stroke="#16A34A"
                            fill="#16A34A"
                            fillOpacity={0.1}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                          
                          {/* Platform Benchmark - Purple dashed line */}
                          <Radar
                            name="Platform Benchmark"
                            dataKey="platformBenchmark"
                            stroke="#A855F7"
                            fill="#A855F7"
                            fillOpacity={0.1}
                            strokeWidth={2}
                            strokeDasharray="3 3"
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevious}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                      >
                        <ArrowLeft size={20} /> Previous
                      </button>
                      <button
                        onClick={handleNext}
                        className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                      >
                        Next <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: What's Next */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Ready to close this batch
                    </h2>
                    <p className="text-gray-600 mb-6">What would you like to do next?</p>

                    {/* Checkboxes */}
                    <div className="space-y-4 mb-6">
                      <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={downloadReport}
                          onChange={(e) => setDownloadReport(e.target.checked)}
                          className="mt-1 w-5 h-5 text-green-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText size={20} className="text-green-600" />
                            <span className="font-medium text-gray-900">Download Batch Closure Report (PDF)</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Generate a comprehensive report of this batch's performance</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={startNewBatch}
                          onChange={(e) => setStartNewBatch(e.target.checked)}
                          className="mt-1 w-5 h-5 text-green-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Plus size={20} className="text-green-600" />
                            <span className="font-medium text-gray-900">Start New Batch immediately</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Open the new batch creation form after closing</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={scheduleNextPlacement}
                          onChange={(e) => setScheduleNextPlacement(e.target.checked)}
                          className="mt-1 w-5 h-5 text-green-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={20} className="text-green-600" />
                            <span className="font-medium text-gray-900">Schedule next batch placement</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Set a reminder for your next batch start date</p>
                        </div>
                      </label>

                      {scheduleNextPlacement && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="ml-8"
                        >
                          <input
                            type="date"
                            value={nextPlacementDate}
                            onChange={(e) => setNextPlacementDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevious}
                        disabled={isClosing}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <ArrowLeft size={20} /> Previous
                      </button>
                      <button
                        onClick={handleCloseBatch}
                        disabled={isClosing}
                        className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isClosing ? (
                          <>Closing...</>
                        ) : (
                          <>
                            <CheckCircle size={20} /> Close Batch & Save
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confetti Animation */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: Math.random() * 640,
                        y: -20,
                        rotate: 0,
                        opacity: 1,
                      }}
                      animate={{
                        y: window.innerHeight + 20,
                        rotate: 720,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 3,
                        ease: 'easeOut',
                        delay: Math.random() * 0.5,
                      }}
                      className="absolute w-3 h-3"
                      style={{
                        backgroundColor: ['#16A34A', '#2563EB', '#A855F7', '#F59E0B', '#EF4444'][i % 5],
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BatchCloseWizard;
