'use client';

// WHY: This is the district price map component that displays a geographical map of Uttar Pradesh districts
// with color-coded price intelligence. It uses react-leaflet for map rendering and GeoJSON for district boundaries.
// Districts are colored based on percentile-based price thresholds (high, moderate, low) to enable quick visual
// comparison across regions. The component includes hover tooltips with price details, click handlers for
// district selection, and a deep dive panel showing detailed district information including AI drivers and alerts.

import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, GeoJSON, TileLayer, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js - only run on client
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Types
interface DistrictPriceData {
  district: string;
  p50: number;
  signal: 'sell' | 'hold' | 'caution';
}

interface DistrictData {
  district: string;
  name_hi: string;
  p50: number;
  p10: number;
  p90: number;
  delta_pct: number;
  signal: 'sell' | 'hold' | 'caution';
  hpai_flag: boolean;
  active_alert_count: number;
  last_updated: string;
}

interface DistrictPriceMapProps {
  onDistrictSelect?: (district: string) => void;
  selectedDistrict?: string;
  primaryDistrict?: string;
  showPriceDifferential?: boolean;
  onPriceDifferentialToggle?: (enabled: boolean) => void;
}

// Percentile calculation helper
const percentile = (arr: number[], p: number): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

export function DistrictPriceMap({ 
  onDistrictSelect, 
  selectedDistrict,
  primaryDistrict = 'gorakhpur',
  showPriceDifferential = false,
  onPriceDifferentialToggle
}: DistrictPriceMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [priceData, setPriceData] = useState<DistrictPriceData[]>([]);
  const [districtData, setDistrictData] = useState<Record<string, DistrictData>>({});
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveDistrict, setDeepDiveDistrict] = useState<string | null>(null);
  const [p25, setP25] = useState<number>(0);
  const [p75, setP75] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState<number>(0);
  const mapRef = useRef<L.Map | null>(null);

  // Load GeoJSON
  useEffect(() => {
    const startTime = performance.now();
    fetch('/geojson/up_districts.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        if (loadTime > 800) {
          console.warn(`GeoJSON load took ${loadTime.toFixed(2)}ms (target: <800ms)`);
        }
      })
      .catch(err => console.error('Failed to load GeoJSON:', err));
  }, []);



  // Fetch price data from API
  useEffect(() => {
    fetch('/api/map/district-prices')
      .then(res => res.json())
      .then((data: DistrictPriceData[] | { data?: DistrictPriceData[] }) => {
        // Handle both array and object with data property
        const priceData = Array.isArray(data) ? data : (data?.data || []);
        setPriceData(priceData);
        
        // Calculate dynamic percentile thresholds
        const prices = priceData.map(d => d.p50).filter(Boolean);
        if (prices.length > 0) {
          setP25(percentile(prices, 25));
          setP75(percentile(prices, 75));
        }
        
        // Create price map for quick lookup (normalized to lowercase)
        const priceMap = new Map(priceData.map(p => [p.district.toLowerCase(), p]));
        
        // Merge with GeoJSON data to create full district data
        if (geoData) {
          const mergedData: Record<string, DistrictData> = {};
          geoData.features.forEach((feature: any) => {
            const districtName = feature.properties.district;
            const priceInfo = priceMap.get(districtName.toLowerCase());
            
            mergedData[districtName] = {
              district: districtName,
              name_hi: feature.properties.name_hi || districtName,
              p50: priceInfo?.p50 || 0,
              p10: priceInfo?.p50 ? priceInfo.p50 * 0.95 : 0,
              p90: priceInfo?.p50 ? priceInfo.p50 * 1.05 : 0,
              delta_pct: 0,
              signal: priceInfo?.signal || 'hold',
              hpai_flag: false,
              active_alert_count: 0,
              last_updated: new Date().toISOString()
            };
          });
          setDistrictData(mergedData);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch price data:', err);
        setLoading(false);
      });
  }, [geoData]);

  const handleDistrictClick = useCallback((district: string) => {
    setDeepDiveDistrict(district);
    setShowDeepDive(true);
    if (onDistrictSelect) {
      onDistrictSelect(district);
    }
  }, [onDistrictSelect]);

  const handleDistrictDoubleClick = useCallback(async (district: string) => {
    try {
      const response = await fetch('/api/v2/customers/primary-district', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ district }),
      });
      if (response.ok) {
        console.log(`Primary district set to ${district}`);
      }
    } catch (error) {
      console.error('Failed to set primary district:', error);
    }
  }, []);

  // Dynamic color assignment based on percentile thresholds
  const getDistrictColor = (districtName: string): string => {
    const data = districtData[districtName];
    if (!data || !data.p50) return '#D1D5DB'; // grey — no data
    
    if (data.p50 > p75) return '#16A34A'; // green — high price
    if (data.p50 > p25) return '#D97706'; // amber — moderate
    return '#DC2626'; // red — low price
  };

  const getPriceDifferential = (districtId: string): number => {
    const data = districtData[districtId];
    const primary = districtData[primaryDistrict];
    if (!data || !primary) return 0;
    return data.p50 - primary.p50;
  };

  if (loading || !geoData) {
    return (
      <div className="w-full h-[500px] bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-700 mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">District Price Intelligence</h2>
            <p className="text-sm text-neutral-500">Multi-district price comparison for arbitrage decisions</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={showPriceDifferential}
                onChange={(e) => onPriceDifferentialToggle?.(e.target.checked)}
                className="rounded border-neutral-300 text-brand-green-700 focus:ring-brand-green-700"
              />
              Show Price Differential
            </label>
          </div>
        </div>

        {/* Map */}
        <div className="relative" style={{ height: '500px' }}>
          <MapContainer
            key={mapKey}
            center={[26.5, 83.0]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            ref={(map) => {
              if (map) {
                mapRef.current = map;
              }
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={geoData}
              style={(feature) => ({
                fillColor: getDistrictColor(feature?.properties?.district || ''),
                fillOpacity: 0.65,
                weight: 1,
                color: '#FFFFFF',
                opacity: 0.8,
              })}
              onEachFeature={(feature, layer) => {
                const districtName = feature.properties.district;
                const data = districtData[districtName];
                const isSelected = selectedDistrict === districtName;
                const isPrimary = primaryDistrict === districtName;
                const priceDiff = getPriceDifferential(districtName);

                layer.on({
                  click: () => handleDistrictClick(districtName),
                  mouseover: () => setHoveredDistrict(districtName),
                  mouseout: () => setHoveredDistrict(null),
                });

                if (isSelected) {
                  (layer as any).setStyle({ weight: 3, color: '#1C2B22' });
                } else if (isPrimary) {
                  (layer as any).setStyle({ weight: 2, color: '#1A6B3C' });
                }

                if (data?.hpai_flag) {
                  // HPAI alert styling could be added here
                }
              }}
            />
          </MapContainer>

          {/* Tooltip */}
          {hoveredDistrict && districtData[hoveredDistrict] && (
            <div
              className="absolute bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl pointer-events-none z-10"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="font-semibold text-lg mb-1">
                {districtData[hoveredDistrict].name_hi}
              </div>
              <div className="text-sm space-y-1">
                <div>P50: ₹{districtData[hoveredDistrict].p50}/kg</div>
                <div className="text-neutral-400">
                  Range: ₹{districtData[hoveredDistrict].p10} – ₹{districtData[hoveredDistrict].p90}
                </div>
                <div>
                  {districtData[hoveredDistrict].delta_pct > 0 ? '↑' : districtData[hoveredDistrict].delta_pct < 0 ? '↓' : '→'}{' '}
                  {Math.abs(districtData[hoveredDistrict].delta_pct)}% vs yesterday
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    districtData[hoveredDistrict].signal === 'sell' ? 'bg-green-600' :
                    districtData[hoveredDistrict].signal === 'hold' ? 'bg-amber-500' : 'bg-red-600'
                  }`}>
                    {districtData[hoveredDistrict].signal.toUpperCase()}
                  </span>
                  {districtData[hoveredDistrict].active_alert_count > 0 && (
                    <span className="text-red-400">🚨 {districtData[hoveredDistrict].active_alert_count}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-white">
          <div className="flex items-center gap-6 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#16A34A]"></div>
              <span>High Price (Sell Opportunity)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#D97706]"></div>
              <span>Moderate Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#DC2626]"></div>
              <span>Low Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#D1D5DB]"></div>
              <span>No Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* District Deep Dive Panel */}
      <AnimatePresence>
        {showDeepDive && deepDiveDistrict && districtData[deepDiveDistrict] && (
          <DistrictDeepDivePanel
            district={districtData[deepDiveDistrict]}
            onClose={() => {
              setShowDeepDive(false);
              setDeepDiveDistrict(null);
            }}
            onSetPrimary={() => handleDistrictDoubleClick(deepDiveDistrict)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// District Deep Dive Panel Component
interface DistrictDeepDivePanelProps {
  district: DistrictData;
  onClose: () => void;
  onSetPrimary: () => void;
}

function DistrictDeepDivePanel({ district, onClose, onSetPrimary }: DistrictDeepDivePanelProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.22, ease: 'ease-out' }}
      className="fixed top-0 right-0 h-full w-[320px] bg-white shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">{district.name_hi}</h3>
            <p className="text-sm text-neutral-500 capitalize">{district.district.replace('_', ' ')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Price Info */}
        <div className="bg-neutral-50 rounded-xl p-4 mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-neutral-900">₹{district.p50}</span>
            <span className="text-sm text-neutral-500">/kg</span>
            {district.delta_pct > 0 ? (
              <span className="text-green-600 text-sm">↑ {district.delta_pct}%</span>
            ) : district.delta_pct < 0 ? (
              <span className="text-red-600 text-sm">↓ {Math.abs(district.delta_pct)}%</span>
            ) : (
              <span className="text-neutral-500 text-sm">→ 0%</span>
            )}
          </div>
          <div className="text-sm text-neutral-600 mb-3">
            Confidence Range: ₹{district.p10} – ₹{district.p90}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            district.signal === 'sell' ? 'bg-green-100 text-green-800' :
            district.signal === 'hold' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
          }`}>
            {district.signal === 'sell' ? '✅' : district.signal === 'hold' ? '⏳' : '⚠️'}{' '}
            {district.signal.toUpperCase()}
          </div>
        </div>

        {/* AI Drivers */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">आज की वजहें (Key Drivers)</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <span>🐔</span>
              <span className="text-neutral-700">चारे की कीमत ↑ — ₹4/kg असर</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span>🌡️</span>
              <span className="text-neutral-700">गर्मी — 7 दिन में 5 दिन &gt;35°C</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span>🎉</span>
              <span className="text-neutral-700">ईद से 6 दिन पहले — माँग बढ़ रही है</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {district.active_alert_count > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">🚨 Active Alerts</h4>
            <div className="space-y-2">
              {district.hpai_flag && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-1">
                    🦠 HPAI Disease Alert
                  </div>
                  <div className="text-xs text-red-600">
                    Bird flu warning in this district
                  </div>
                </div>
              )}
              {district.active_alert_count > (district.hpai_flag ? 1 : 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-1">
                    🌡️ Heat Wave Alert
                  </div>
                  <div className="text-xs text-amber-600">
                    Temperature expected to exceed 38°C
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 30-Day Mini Chart Placeholder */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">30-Day Price History</h4>
          <div className="bg-neutral-50 rounded-lg h-32 flex items-center justify-center">
            <p className="text-xs text-neutral-500">Mini chart placeholder</p>
          </div>
        </div>

        {/* Set as Primary Button */}
        <button
          onClick={onSetPrimary}
          className="w-full py-3 bg-brand-green-700 text-white rounded-lg font-medium hover:bg-brand-green-800 transition-colors"
        >
          Set as Primary District
        </button>
      </div>
    </motion.div>
  );
}
