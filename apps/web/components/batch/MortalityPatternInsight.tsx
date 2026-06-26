'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Warning, CheckCircle, Info } from '@phosphor-icons/react';

interface MortalityPatternInsightProps {
  batchId: string;
  showPattern?: boolean;
}

interface PatternData {
  detected_pattern: string;
  confidence: number;
  pattern_hindi: string;
  pattern_english: string;
  recommendation_hindi: string;
  recommendation_english: string;
  reason: string;
  spike_day?: number;
  created_at: string;
}

const PATTERN_COLORS = {
  doc_stress: 'bg-amber-50 border-amber-200 text-amber-900',
  ibd_pattern: 'bg-red-50 border-red-200 text-red-900',
  heat_stress: 'bg-orange-50 border-orange-200 text-orange-900',
  disease_outbreak: 'bg-red-100 border-red-300 text-red-900',
  normal: 'bg-green-50 border-green-200 text-green-900',
  unknown: 'bg-gray-50 border-gray-200 text-gray-900'
};

const PATTERN_ICONS = {
  doc_stress: <Warning size={24} className="text-amber-600" />,
  ibd_pattern: <Warning size={24} className="text-red-600" />,
  heat_stress: <Warning size={24} className="text-orange-600" />,
  disease_outbreak: <Warning size={24} className="text-red-700" />,
  normal: <CheckCircle size={24} className="text-green-600" />,
  unknown: <Info size={24} className="text-gray-600" />
};

export default function MortalityPatternInsight({ batchId, showPattern = true }: MortalityPatternInsightProps) {
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showPattern) {
      setLoading(false);
      return;
    }

    const fetchPatternData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In production, this would fetch from the API
        // For now, we'll simulate the pattern detection
        // const response = await fetch(`/api/v1/batches/${batchId}/mortality-pattern`);
        // const data = await response.json();
        
        // Simulate pattern detection based on batch
        const mockPatternData: PatternData = {
          detected_pattern: 'ibd_pattern',
          confidence: 0.82,
          pattern_hindi: 'IBD/गुम्बोरो - वायरल संक्रमण',
          pattern_english: 'IBD/Gumboro - Viral infection',
          recommendation_hindi: 'टीकाकरण समय सीमा जांचें। बायोसिक्योरिटी बढ़ाएं। डॉक्टर से सलाह लें।',
          recommendation_english: 'Check vaccination schedule. Enhance biosecurity. Consult veterinarian.',
          reason: 'Spike on day 18 with respiratory/digestive causes indicates IBD',
          spike_day: 18,
          created_at: new Date().toISOString()
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPatternData(mockPatternData);
      } catch (err) {
        console.error('Error fetching pattern data:', err);
        setError('Failed to load pattern analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchPatternData();
  }, [batchId, showPattern]);

  if (!showPattern) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="animate-pulse bg-gray-200 rounded-full w-6 h-6"></div>
          <div className="animate-pulse bg-gray-200 rounded h-4 flex-1"></div>
        </div>
      </div>
    );
  }

  if (error || !patternData) {
    return null;
  }

  const colorClass = PATTERN_COLORS[patternData.detected_pattern as keyof typeof PATTERN_COLORS] || PATTERN_COLORS.unknown;
  const icon = PATTERN_ICONS[patternData.detected_pattern as keyof typeof PATTERN_ICONS] || PATTERN_ICONS.unknown;
  const confidencePercent = Math.round(patternData.confidence * 100);

  return (
    <div className={`border rounded-lg p-6 ${colorClass}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-1">
                इस पैटर्न से लगता है: {patternData.pattern_hindi}
              </h4>
              <p className="text-sm opacity-80">
                {patternData.pattern_english}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                Confidence: {confidencePercent}%
              </div>
              {patternData.spike_day && (
                <div className="text-xs opacity-75">
                  Day {patternData.spike_day}
                </div>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white/50 rounded-lg p-4 border border-current border-opacity-20">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb size={20} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">सुझाव:</p>
                <p className="opacity-90">{patternData.recommendation_hindi}</p>
                <p className="opacity-75 mt-1 text-xs">{patternData.recommendation_english}</p>
              </div>
            </div>
          </div>

          {/* Analysis Reason */}
          <div className="text-xs opacity-75">
            <span className="font-medium">Analysis:</span> {patternData.reason}
          </div>
        </div>
      </div>
    </div>
  );
}
