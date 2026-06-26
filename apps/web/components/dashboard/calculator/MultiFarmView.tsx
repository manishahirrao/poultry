'use client';

import { useState, useEffect, useCallback } from 'react';
import { CaretDown, TrendUp, TrendDown, Upload, Download, FileText } from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import Papa from 'papaparse';
import { 
  calculateSellHoldMatrix, 
  RoiCalculatorInputs, 
  PriceForecast 
} from '@/lib/roiCalculator';

interface FarmData {
  id: string;
  name: string;
  district: string;
  active_batch?: {
    id: string;
    batch_number: number;
    birds_placed: number;
    birds_alive: number;
    placement_date: string;
    fcr: number;
    avg_weight_g: number;
  };
}

interface FarmWithMetrics extends FarmData {
  flockSize: number;
  batchAge: number;
  avgWeight: number;
  feedCostPerKg: number;
  currentPrice: number;
  projectedPrice: { p10: number; p50: number; p90: number };
  netProfitToday: number;
  netProfitOptimal: number;
  netDelta: number;
  signal: string;
  urgency: 'URGENT' | 'OPTIMAL' | 'WAIT';
  lastUpdated: string;
}

interface CsvFarmRow {
  farm_name: string;
  district: string;
  flock_size: number;
  age_days: number;
  avg_weight_kg: number;
  feed_cost_per_kg: number;
}

export function MultiFarmView() {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [farms, setFarms] = useState<FarmWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvData, setCsvData] = useState<CsvFarmRow[]>([]);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch farms with active batches
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.phone) return;

        const { data: customer } = await supabase
          .from('customers')
          .select('id, role')
          .eq('phone', user.phone)
          .single();

        if (!customer) return;

        // Check if user has integrator or admin role
        if (customer.role !== 'integrator' && customer.role !== 'admin') {
          console.log('Multi-farm view only available for integrators and admins');
          setLoading(false);
          return;
        }

        const { data: farmsData } = await supabase
          .from('farms')
          .select(`
            id,
            name,
            district,
            active_batch:batches(
              id,
              batch_number,
              birds_placed,
              birds_alive,
              placement_date,
              fcr,
              avg_weight_g
            )
          `)
          .eq('integrator_id', customer.id)
          .eq('status', 'active')
          .order('name');

        if (!farmsData) return;

        if (farmsData) {
          const transformedFarms: FarmWithMetrics[] = await Promise.all(
            farmsData
              .filter((farm: any) => farm.active_batch && Array.isArray(farm.active_batch) && farm.active_batch.length > 0)
              .map(async (farm: any) => {
                const batch = farm.active_batch[0];
                const flockSize = batch.birds_alive || batch.birds_placed;
                const placementDate = new Date(batch.placement_date);
                const batchAge = Math.floor((Date.now() - placementDate.getTime()) / (1000 * 60 * 60 * 24));
                const avgWeight = (batch.avg_weight_g || 0) / 1000; // Convert to kg
                
                // Fetch price forecast for district
                const forecastResponse = await fetch(`/api/v2/forecast/${farm.district}`);
                const forecastData = await forecastResponse.json();
                const forecast: PriceForecast = forecastData.forecast || {
                  p10: 158,
                  p50: 162,
                  p90: 168
                };

                const inputs: RoiCalculatorInputs = {
                  flockSize,
                  ageDays: batchAge,
                  avgWeightKg: avgWeight,
                  feedCostPerKg: 58, // Default, should come from batch data
                  overheadCostPerBirdPerDay: 0.50,
                };

                const result = calculateSellHoldMatrix(inputs, forecast);
                const todayRow = result.sellHoldMatrix[0];
                const optimalRow = result.sellHoldMatrix.find(row => row.isOptimal) || todayRow;

                // Determine urgency
                let urgency: 'URGENT' | 'OPTIMAL' | 'WAIT' = 'WAIT';
                const forecastSignal = (forecast as any).signal;
                if (forecastSignal === 'sell' && batchAge > 45) {
                  urgency = 'URGENT';
                } else if (optimalRow.isOptimal && optimalRow.scenario !== 'today') {
                  urgency = 'OPTIMAL';
                }

                const signal = forecastSignal === 'sell' ? 'SELL_NOW' : 
                              forecastSignal === 'hold' ? 'HOLD' : 'CAUTION';

                return {
                  id: farm.id,
                  name: farm.name,
                  district: farm.district,
                  flockSize,
                  batchAge,
                  avgWeight,
                  feedCostPerKg: inputs.feedCostPerKg,
                  currentPrice: forecast.p50,
                  projectedPrice: forecast,
                  netProfitToday: todayRow.netProfit.base,
                  netProfitOptimal: optimalRow.netProfit.base,
                  netDelta: optimalRow.netProfit.base - todayRow.netProfit.base,
                  signal,
                  urgency,
                  lastUpdated: 'Recently',
                };
              })
          );

          // Sort by urgency
          const urgencyOrder = { 'URGENT': 0, 'OPTIMAL': 1, 'WAIT': 2 };
          transformedFarms.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

          setFarms(transformedFarms);
        }
      } catch (error) {
        console.error('Error fetching farms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleCsvUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as CsvFarmRow[];
          
          // Validate CSV structure
          const requiredColumns = ['farm_name', 'district', 'flock_size', 'age_days', 'avg_weight_kg', 'feed_cost_per_kg'];
          const missingColumns = requiredColumns.filter(col => !results.meta.fields?.includes(col));
          
          if (missingColumns.length > 0) {
            setCsvError(`Missing required columns: ${missingColumns.join(', ')}`);
            return;
          }

          // Validate data
          const validRows: CsvFarmRow[] = [];
          const errors: string[] = [];

          rows.forEach((row, index) => {
            if (row.flock_size < 1000) {
              errors.push(`Row ${index + 1}: Flock size must be at least 1000`);
              return;
            }
            if (!row.farm_name || !row.district) {
              errors.push(`Row ${index + 1}: Missing farm name or district`);
              return;
            }
            validRows.push(row);
          });

          if (errors.length > 0) {
            setCsvError(errors.join('; '));
            return;
          }

          setCsvData(validRows);
          setShowCsvUpload(false);

          // Process CSV data with ROI calculator
          processCsvFarms(validRows);
        } catch (error) {
          setCsvError('Failed to parse CSV file');
          console.error('CSV parsing error:', error);
        }
      },
      error: (error) => {
        setCsvError('Failed to read CSV file');
        console.error('CSV read error:', error);
      }
    });
  }, []);

  const processCsvFarms = async (csvRows: CsvFarmRow[]) => {
    try {
      const processedFarms: FarmWithMetrics[] = await Promise.all(
        csvRows.map(async (row) => {
          // Fetch price forecast for district
          const forecastResponse = await fetch(`/api/v2/forecast/${row.district}`);
          const forecastData = await forecastResponse.json();
          const forecast: PriceForecast = forecastData.forecast || {
            p10: 158,
            p50: 162,
            p90: 168
          };

          const inputs: RoiCalculatorInputs = {
            flockSize: row.flock_size,
            ageDays: row.age_days,
            avgWeightKg: row.avg_weight_kg,
            feedCostPerKg: row.feed_cost_per_kg,
            overheadCostPerBirdPerDay: 0.50,
          };

          const result = calculateSellHoldMatrix(inputs, forecast);
          const todayRow = result.sellHoldMatrix[0];
          const optimalRow = result.sellHoldMatrix.find(row => row.isOptimal) || todayRow;

          // Determine urgency
          let urgency: 'URGENT' | 'OPTIMAL' | 'WAIT' = 'WAIT';
          const forecastSignal = (forecast as any).signal;
          if (forecastSignal === 'sell' && row.age_days > 45) {
            urgency = 'URGENT';
          } else if (optimalRow.isOptimal && optimalRow.scenario !== 'today') {
            urgency = 'OPTIMAL';
          }

          const signal = forecastSignal === 'sell' ? 'SELL_NOW' : 
                        forecastSignal === 'hold' ? 'HOLD' : 'CAUTION';

          return {
            id: `csv-${row.farm_name}`,
            name: row.farm_name,
            district: row.district,
            flockSize: row.flock_size,
            batchAge: row.age_days,
            avgWeight: row.avg_weight_kg,
            feedCostPerKg: row.feed_cost_per_kg,
            currentPrice: forecast.p50,
            projectedPrice: forecast,
            netProfitToday: todayRow.netProfit.base,
            netProfitOptimal: optimalRow.netProfit.base,
            netDelta: optimalRow.netProfit.base - todayRow.netProfit.base,
            signal,
            urgency,
            lastUpdated: 'Just now',
          };
        })
      );

      // Sort by urgency
      const urgencyOrder = { 'URGENT': 0, 'OPTIMAL': 1, 'WAIT': 2 };
      processedFarms.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

      setFarms(processedFarms);
    } catch (error) {
      console.error('Error processing CSV farms:', error);
      setCsvError('Failed to process farm data');
    }
  };

  const handleExportPdf = useCallback(async () => {
    setGeneratingPdf(true);
    try {
      // Generate PDF using @react-pdf/renderer
      // For now, this is a placeholder - actual PDF generation would be implemented here
      console.log('Generating PDF for', farms.length, 'farms');
      
      // Simulate PDF generation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('PDF export feature would be implemented with @react-pdf/renderer');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  }, [farms]);

  const downloadTemplate = useCallback(() => {
    const template = `farm_name,district,flock_size,age_days,avg_weight_kg,feed_cost_per_kg
Sharma Farm,Gorakhpur,25000,38,1.8,58
Gupta Farms,Deoria,15000,42,2.0,60
Singh Farms,Kushinagar,40000,35,1.6,56`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'harvest_queue_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const selectedFarmData = farms.find(f => f.id === selectedFarm);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            🔴 URGENT
          </span>
        );
      case 'OPTIMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            🟡 OPTIMAL
          </span>
        );
      case 'WAIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            🟢 WAIT
          </span>
        );
      default:
        return null;
    }
  };

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'SELL_NOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            आज बेचें ✓
          </span>
        );
      case 'HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            रुकें
          </span>
        );
      case 'CAUTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            सावधान
          </span>
        );
      default:
        return null;
    }
  };

  const totalProfit = farms.reduce((sum, farm) => sum + farm.netProfitOptimal, 0);
  const totalFlockSize = farms.reduce((sum, farm) => sum + farm.flockSize, 0);

  return (
    <div className="space-y-6">
      {/* Header with CSV Upload */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Farm Harvest Priority Queue</h2>
          <p className="text-sm text-neutral-500">Multi-farm harvest scheduling for integrators</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Download size={16} />
            Download Template
          </button>
          <button
            onClick={() => setShowCsvUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green-700 text-white rounded-lg text-sm font-medium hover:bg-brand-green-800 transition-colors"
          >
            <Upload size={16} />
            Upload CSV
          </button>
          <button
            onClick={handleExportPdf}
            disabled={generatingPdf || farms.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={16} />
            {generatingPdf ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showCsvUpload && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Upload Farm Data (CSV)</h3>
            <button
              onClick={() => setShowCsvUpload(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>
          
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer"
            >
              <Upload size={32} className="mx-auto mb-3 text-neutral-400" />
              <p className="text-sm text-neutral-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-neutral-500">
                CSV file with columns: farm_name, district, flock_size, age_days, avg_weight_kg, feed_cost_per_kg
              </p>
            </label>
          </div>

          {csvError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{csvError}</p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-neutral-500">Loading farm data...</div>
        </div>
      ) : farms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-neutral-500 mb-4">No farm data found. Upload a CSV to get started.</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Total Farms</div>
              <div className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                {farms.length}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Total Flock Size</div>
              <div className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "'Sora', system-ui" }}>
                {totalFlockSize.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Total Optimal Profit</div>
              <div className="text-2xl font-bold text-brandGreen700" style={{ fontFamily: "'Sora', system-ui" }}>
                ₹{totalProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Priority Queue Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left py-3 px-4 font-medium text-neutral-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-900">Farm</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-900">District</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-900">Flock Size</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-900">Age</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-900">Signal</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-900">Net Delta</th>
                  <th className="text-right py-3 px-4 font-medium text-neutral-900">Optimal Profit</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((farm) => (
                  <tr 
                    key={farm.id}
                    onClick={() => setSelectedFarm(farm.id)}
                    className={`border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 ${
                      selectedFarm === farm.id ? 'bg-brand-green-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      {getUrgencyBadge(farm.urgency)}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-900">{farm.name}</td>
                    <td className="py-3 px-4 text-neutral-600 capitalize">{farm.district.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-right text-neutral-900">{farm.flockSize.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-neutral-900">{farm.batchAge} days</td>
                    <td className="py-3 px-4 text-right">
                      {getSignalBadge(farm.signal)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      farm.netDelta > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {farm.netDelta > 0 ? '+' : ''}₹{farm.netDelta.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-brandGreen700">
                      ₹{farm.netProfitOptimal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Farm Details */}
          {selectedFarmData && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-neutral-900">{selectedFarmData.name} - Details</h3>
                <button
                  onClick={() => setSelectedFarm(null)}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 mb-3">Batch Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Location:</span>
                      <span className="font-semibold text-neutral-900 capitalize">{selectedFarmData.district.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Flock Size:</span>
                      <span className="font-semibold text-neutral-900">{selectedFarmData.flockSize.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Batch Age:</span>
                      <span className="font-semibold text-neutral-900">{selectedFarmData.batchAge} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Avg Weight:</span>
                      <span className="font-semibold text-neutral-900">{selectedFarmData.avgWeight} kg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 mb-3">Price & Profit Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Current Price:</span>
                      <span className="font-semibold text-neutral-900">₹{selectedFarmData.currentPrice}/kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Projected Price (P50):</span>
                      <span className="font-semibold text-neutral-900">₹{selectedFarmData.projectedPrice.p50}/kg</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-neutral-200">
                      <span className="text-neutral-600">Profit Today:</span>
                      <span className="font-semibold text-neutral-900">₹{selectedFarmData.netProfitToday.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Optimal Profit:</span>
                      <span className="font-bold text-brandGreen700">₹{selectedFarmData.netProfitOptimal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Net Delta:</span>
                      <span className={`font-bold ${selectedFarmData.netDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedFarmData.netDelta > 0 ? '+' : ''}₹{selectedFarmData.netDelta.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
