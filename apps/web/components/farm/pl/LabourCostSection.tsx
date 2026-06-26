'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check, Users } from '@phosphor-icons/react';
import useSWR from 'swr';

interface LabourCostRecord {
  cost_id?: string;
  category: 'labour_daily' | 'labour_period';
  workers_count?: number;
  rate_per_day?: number;
  period_start_date?: string;
  period_end_date?: string;
  days_count?: number;
  description?: string;
  amount: number;
  entry_date: string;
  batch_id?: string;
  farm_id?: string;
}

interface GCCosts {
  labour_cost_total?: number;
}

interface BatchData {
  current_day: number;
  target_days: number;
}

interface LabourCostSectionProps {
  farmId: string;
  batchId: string;
  initialData?: LabourCostRecord[];
  batchData?: BatchData;
  onSave?: (data: LabourCostRecord) => void;
  onDelete?: (id: string) => void;
}

export function LabourCostSection({ farmId, batchId, initialData = [], batchData, onSave, onDelete }: LabourCostSectionProps) {
  const [mode, setMode] = useState<'daily' | 'period'>('daily');
  const [dailyFormData, setDailyFormData] = useState({
    workers_count: 0,
    rate_per_day: 0,
  });
  const [periodFormData, setPeriodFormData] = useState({
    period_start_date: '',
    period_end_date: '',
    workers_count: 0,
    rate_per_day: 0,
    description: '',
  });
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labourCosts, setLabourCosts] = useState<LabourCostRecord[]>(initialData);

  // Fetch GC costs to get salary-synced labour costs
  const { data: gcData } = useSWR<GCCosts>(`/api/farms/${farmId}/gc`, async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch GC data');
    return response.json();
  });

  // Load mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem(`labour_cost_mode_${farmId}`);
    if (savedMode === 'daily' || savedMode === 'period') {
      setMode(savedMode);
    }
  }, [farmId]);

  // Save mode preference to localStorage
  useEffect(() => {
    localStorage.setItem(`labour_cost_mode_${farmId}`, mode);
  }, [mode, farmId]);

  const totalLabourCost = labourCosts.reduce((sum, record) => sum + record.amount, 0);
  const batchDays = batchData?.current_day || batchData?.target_days || 42;

  const estimatedDailyCost = dailyFormData.workers_count * dailyFormData.rate_per_day * batchDays;

  // Calculate total including salary-synced labour costs
  const salarySyncedLabourCost = gcData?.labour_cost_total || 0;
  const grandTotalLabourCost = totalLabourCost + salarySyncedLabourCost;

  const handleModeChange = (newMode: 'daily' | 'period') => {
    setMode(newMode);
  };

  const handleDailySave = async () => {
    if (dailyFormData.workers_count <= 0 || dailyFormData.rate_per_day <= 0) {
      setError('Workers count and rate per day are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: LabourCostRecord = {
        category: 'labour_daily',
        workers_count: dailyFormData.workers_count,
        rate_per_day: dailyFormData.rate_per_day,
        amount: estimatedDailyCost,
        entry_date: new Date().toISOString().split('T')[0],
        batch_id: batchId,
        farm_id: farmId,
      };

      const response = await fetch(`/api/farms/${farmId}/costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save labour cost');
      }

      const savedData = await response.json();
      const newRecord = { ...payload, cost_id: savedData.cost_id };
      setLabourCosts([...labourCosts, newRecord]);
      onSave?.(newRecord);
      
      // Reset form
      setDailyFormData({ workers_count: 0, rate_per_day: 0 });
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handlePeriodSave = async () => {
    if (!periodFormData.period_start_date || !periodFormData.period_end_date) {
      setError('Start date and end date are required');
      return;
    }
    if (periodFormData.workers_count <= 0 || periodFormData.rate_per_day <= 0) {
      setError('Workers count and rate per day are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const daysCount = calculateDays(periodFormData.period_start_date, periodFormData.period_end_date);
      const totalCost = periodFormData.workers_count * periodFormData.rate_per_day * daysCount;

      const payload: LabourCostRecord = {
        category: 'labour_period',
        workers_count: periodFormData.workers_count,
        rate_per_day: periodFormData.rate_per_day,
        period_start_date: periodFormData.period_start_date,
        period_end_date: periodFormData.period_end_date,
        days_count: daysCount,
        description: periodFormData.description,
        amount: totalCost,
        entry_date: new Date().toISOString().split('T')[0],
        batch_id: batchId,
        farm_id: farmId,
      };

      const response = await fetch(`/api/farms/${farmId}/costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save labour cost');
      }

      const savedData = await response.json();
      const newRecord = { ...payload, cost_id: savedData.cost_id };
      setLabourCosts([...labourCosts, newRecord]);
      onSave?.(newRecord);
      
      // Reset form
      setPeriodFormData({
        period_start_date: '',
        period_end_date: '',
        workers_count: 0,
        rate_per_day: 0,
        description: '',
      });
      setShowPeriodForm(false);
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this labour entry?')) return;

    try {
      const response = await fetch(`/api/farms/${farmId}/costs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete labour cost');
      }

      setLabourCosts(labourCosts.filter(record => record.cost_id !== id));
      onDelete?.(id);
    } catch (err) {
      setError('Failed to delete. Please try again.');
      console.error(err);
    }
  };

  const handlePeriodCancel = () => {
    setPeriodFormData({
      period_start_date: '',
      period_end_date: '',
      workers_count: 0,
      rate_per_day: 0,
      description: '',
    });
    setShowPeriodForm(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange('daily')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'daily' 
              ? 'bg-green-700 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Daily Rate
        </button>
        <button
          onClick={() => handleModeChange('period')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'period' 
              ? 'bg-green-700 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Period Log
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {mode === 'daily' ? (
        /* Daily Rate Mode */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Enter daily labour cost and apply to the full batch</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labour Rate (₹/day) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={dailyFormData.rate_per_day || ''}
                onChange={(e) => setDailyFormData({ ...dailyFormData, rate_per_day: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Workers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={dailyFormData.workers_count || ''}
                onChange={(e) => setDailyFormData({ ...dailyFormData, workers_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                placeholder="2"
              />
            </div>
          </div>
          
          {dailyFormData.workers_count > 0 && dailyFormData.rate_per_day > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Auto-calculation:
              </p>
              <p className="text-base font-semibold text-gray-900 mt-1">
                ₹{dailyFormData.rate_per_day}/day × {dailyFormData.workers_count} workers × {batchDays} days = ₹{estimatedDailyCost.toLocaleString()} (estimated)
              </p>
            </div>
          )}

          <button
            onClick={handleDailySave}
            disabled={isSaving || dailyFormData.workers_count <= 0 || dailyFormData.rate_per_day <= 0}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Check size={16} /> Apply to Batch
              </>
            )}
          </button>
        </div>
      ) : (
        /* Period Log Mode */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Log labour costs by period</p>

          {/* Period Entries Table */}
          {labourCosts.filter(r => r.category === 'labour_period').length === 0 ? (
            <p className="text-sm text-gray-500 italic">No labour periods logged yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Period</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Workers</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Days</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Rate/Day</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Notes</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Total</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {labourCosts.filter(r => r.category === 'labour_period').map((record) => (
                    <tr key={record.cost_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        {new Date(record.period_start_date!).toLocaleDateString()} — {new Date(record.period_end_date!).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3">{record.workers_count}</td>
                      <td className="py-2 px-3">{record.days_count}</td>
                      <td className="py-2 px-3">₹{record.rate_per_day}</td>
                      <td className="py-2 px-3 text-gray-600">{record.description || '-'}</td>
                      <td className="py-2 px-3 text-right font-medium">₹{record.amount.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => record.cost_id && handleDelete(record.cost_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!showPeriodForm && (
            <button
              onClick={() => setShowPeriodForm(true)}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              <Plus size={16} /> Add Period
            </button>
          )}

          {showPeriodForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-gray-900">Add Labour Period</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodFormData.period_start_date}
                    onChange={(e) => setPeriodFormData({ ...periodFormData, period_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodFormData.period_end_date}
                    onChange={(e) => setPeriodFormData({ ...periodFormData, period_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workers <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={periodFormData.workers_count || ''}
                    onChange={(e) => setPeriodFormData({ ...periodFormData, workers_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate/Day (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={periodFormData.rate_per_day || ''}
                    onChange={(e) => setPeriodFormData({ ...periodFormData, rate_per_day: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                    placeholder="800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={periodFormData.description}
                    onChange={(e) => setPeriodFormData({ ...periodFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700"
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              {periodFormData.period_start_date && periodFormData.period_end_date && (
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Calculated Total:</span>
                    <span className="font-semibold text-gray-900">
                      ₹{(
                        periodFormData.workers_count * 
                        periodFormData.rate_per_day * 
                        calculateDays(periodFormData.period_start_date, periodFormData.period_end_date)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ({periodFormData.workers_count} workers × ₹{periodFormData.rate_per_day}/day × {calculateDays(periodFormData.period_start_date, periodFormData.period_end_date)} days)
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handlePeriodSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Check size={16} /> Save Period
                    </>
                  )}
                </button>
                <button
                  onClick={handlePeriodCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total Labour Cost */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total labour cost logged:</span>
          <span className="font-semibold text-gray-900">₹{totalLabourCost.toLocaleString()}</span>
        </div>
        {mode === 'daily' && estimatedDailyCost > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            of ~₹{estimatedDailyCost.toLocaleString()} estimated ({batchDays} days)
          </p>
        )}
      </div>

      {/* Fixed Costs → Employee Salaries (Salary-synced labour costs) */}
      {salarySyncedLabourCost > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-900">Fixed Costs → Employee Salaries</h4>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Auto-synced from Salary Module ✓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Salary-synced labour cost:</span>
            <span className="font-semibold text-blue-900">₹{salarySyncedLabourCost.toLocaleString()}</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            This cost is automatically synced from the Salary Management module when salaries are marked as paid
          </p>
          {totalLabourCost > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Grand Total Labour Cost:</span>
                <span className="font-bold text-blue-900 text-lg">₹{grandTotalLabourCost.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
