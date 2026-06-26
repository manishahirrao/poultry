'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SpreadHistoryChart } from './SpreadHistoryChart';
import { EnhancedVerdictCard } from './EnhancedVerdictCard';

interface MiddlemanCheckProps {
  district?: string;
  userRole?: 'admin' | 'integrator' | 'enterprise' | 'pro';
  poultryType?: 'broiler' | 'layer';
}

export function MiddlemanCheck({ district = 'gorakhpur', userRole = 'pro', poultryType = 'broiler' }: MiddlemanCheckProps) {
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [benchmarkPrice, setBenchmarkPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [negotiationScript, setNegotiationScript] = useState<string>('');
  const [scriptLoading, setScriptLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState<Array<{
    date: string;
    offeredPrice: number;
    benchmark: number;
    outcome: 'accepted' | 'rejected';
  }>>([]);
  const needleRef = useRef<SVGPathElement>(null);

  // Load price history from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem('middleman_price_history');
    if (history) {
      setPriceHistory(JSON.parse(history));
    }
  }, []);

  // Fetch benchmark price on mount
  useEffect(() => {
    fetchBenchmarkPrice();
  }, [district, poultryType]);

  const fetchBenchmarkPrice = async () => {
    try {
      const response = await fetch(`/api/v1/middleman/check?district=${district}&poultry_type=${poultryType}`);
      const data = await response.json();
      setBenchmarkPrice(data.benchmark);
    } catch (error) {
      console.error('Error fetching benchmark price:', error);
    }
  };

  const calculatePricePosition = (offered: number, benchmark: number) => {
    if (!benchmark) return 0;
    const ratio = (offered / benchmark) * 100;
    // Map ratio to gauge position (0-100)
    // < 90% = LOW (0-30), 90-110% = FAIR (30-70), > 110% = HIGH (70-100)
    if (ratio < 90) {
      return (ratio / 90) * 30;
    } else if (ratio <= 110) {
      return 30 + ((ratio - 90) / 20) * 40;
    } else {
      return 70 + Math.min(((ratio - 110) / 40) * 30, 30);
    }
  };

  const getZoneColor = (offered: number, benchmark: number) => {
    if (!benchmark) return '#7A9C8A';
    const ratio = (offered / benchmark) * 100;
    if (ratio < 90) return '#C0392B'; // LOW - red
    if (ratio <= 110) return '#1A6B3C'; // FAIR - green
    return '#2563EB'; // HIGH - blue
  };

  const getZoneLabel = (offered: number, benchmark: number) => {
    if (!benchmark) return 'Enter price';
    const ratio = (offered / benchmark) * 100;
    if (ratio < 90) return 'LOW - Below Market';
    if (ratio <= 110) return 'FAIR - Market Rate';
    return 'HIGH - Premium';
  };

  const generateNegotiationScript = async () => {
    if (!offeredPrice || !benchmarkPrice) return;

    setScriptLoading(true);
    try {
      const response = await fetch('/api/v1/ai/negotiation-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district,
          offeredPrice: parseFloat(offeredPrice),
          benchmarkPrice,
        }),
      });
      const data = await response.json();
      setNegotiationScript(data.script);
    } catch (error) {
      console.error('Error generating negotiation script:', error);
    } finally {
      setScriptLoading(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(negotiationScript);
  };

  const handleShareWhatsApp = () => {
    const encodedScript = encodeURIComponent(negotiationScript);
    window.open(`whatsapp://send?text=${encodedScript}`, '_blank');
  };

  const handleRecordOutcome = (outcome: 'accepted' | 'rejected') => {
    if (!offeredPrice || !benchmarkPrice) return;

    const newEntry = {
      date: new Date().toISOString(),
      offeredPrice: parseFloat(offeredPrice),
      benchmark: benchmarkPrice,
      outcome,
    };

    const updatedHistory = [newEntry, ...priceHistory].slice(0, 10);
    setPriceHistory(updatedHistory);
    localStorage.setItem('middleman_price_history', JSON.stringify(updatedHistory));
  };

  const gaugeRadius = 80;
  const gaugeCenter = 100;
  const needlePosition = offeredPrice && benchmarkPrice 
    ? calculatePricePosition(parseFloat(offeredPrice), benchmarkPrice)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Middleman Price Check</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Check if the trader's offered price is fair compared to the mandi benchmark
        </p>

        {/* Price Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Trader's Offered Price ({poultryType === 'layer' ? '₹/egg' : '₹/kg'})
          </label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-neutral-900">₹</span>
            <input
              type="number"
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              placeholder="Enter price"
              className="flex-1 px-4 py-3 border border-neutral-200 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brandGreen500"
              step={poultryType === 'layer' ? '0.01' : '0.50'}
              min={poultryType === 'layer' ? '4' : '80'}
              max={poultryType === 'layer' ? '8' : '250'}
            />
            <span className="text-lg text-neutral-600">{poultryType === 'layer' ? '/egg' : '/kg'}</span>
          </div>
        </div>

        {/* Benchmark Display */}
        {benchmarkPrice && (
          <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600 mb-1">
              {poultryType === 'layer' ? 'NECC Zone Egg Price Benchmark' : '7-day AGMARKNET Mandi Benchmark'}
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              ₹{benchmarkPrice.toFixed(2)}/{poultryType === 'layer' ? 'egg' : 'kg'}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              District: {district.charAt(0).toUpperCase() + district.slice(1)}
            </div>
          </div>
        )}

        {/* Enhanced Verdict Card */}
        {offeredPrice && benchmarkPrice && (
          <div className="mb-6">
            <EnhancedVerdictCard
              offeredPrice={parseFloat(offeredPrice)}
              benchmarkPrice={benchmarkPrice}
              district={district}
              poultryType={poultryType}
            />
          </div>
        )}

        {/* Action Buttons */}
        {offeredPrice && benchmarkPrice && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={generateNegotiationScript}
              disabled={scriptLoading}
              className="flex-1 px-4 py-3 bg-brandGreen700 text-white rounded-lg font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50"
            >
              {scriptLoading ? 'Generating...' : 'Generate Negotiation Script'}
            </button>
          </div>
        )}

        {/* Negotiation Script Card */}
        {negotiationScript && (
          <div className="mb-6 p-4 bg-brandGreen50 rounded-lg border border-brandGreen200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💬</span>
              <span className="text-sm font-semibold text-brandGreen700">
                Negotiation Script (Hindi)
              </span>
            </div>
            <p className="text-base text-neutral-800 mb-4 leading-relaxed">
              {negotiationScript}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyScript}
                className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                📤 Share on WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Outcome Recording */}
        {offeredPrice && benchmarkPrice && (
          <div className="flex gap-3">
            <button
              onClick={() => handleRecordOutcome('accepted')}
              className="flex-1 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
            >
              ✓ Accepted Offer
            </button>
            <button
              onClick={() => handleRecordOutcome('rejected')}
              className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              ✕ Rejected Offer
            </button>
          </div>
        )}
      </div>

      {/* Price History Chart */}
      {priceHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Price History (Last 10 Checks)
          </h3>
          <SpreadHistoryChart data={priceHistory} />
        </div>
      )}

      {/* S2 Integrator Spread Analytics */}
      {(userRole === 'integrator' || userRole === 'admin') && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Spread Analytics (Integrator View)
          </h3>
          <div className="text-sm text-neutral-600">
            <p className="mb-2">Average spread across your contract farms:</p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900">₹4.50</div>
                <div className="text-xs text-neutral-600">Avg Spread/kg</div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">-2.8%</div>
                <div className="text-xs text-neutral-600">vs Benchmark</div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-neutral-900">12</div>
                <div className="text-xs text-neutral-600">Farms Tracked</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
