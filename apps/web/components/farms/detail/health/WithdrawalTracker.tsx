'use client';

import React from 'react';
import { Clock, CheckCircle, Warning } from '@phosphor-icons/react';

interface Treatment {
  treatment_id: string;
  medicine_name: string;
  brand_name: string | null;
  treatment_date: string;
  last_dose_date: string | null;
  withdrawal_days: number;
  clearance_date: string | null;
  is_complete: boolean;
}

interface WithdrawalTrackerProps {
  treatments: Treatment[];
}

export function WithdrawalTracker({ treatments }: WithdrawalTrackerProps) {
  // SlidersHorizontal treatments with withdrawal periods
  const treatmentsWithWithdrawal = treatments.filter(t => t.withdrawal_days > 0);

  // Separate active and cleared withdrawals
  const activeWithdrawals = treatmentsWithWithdrawal.filter(t => 
    !t.is_complete && t.clearance_date && new Date(t.clearance_date) > new Date()
  );

  const clearedWithdrawals = treatmentsWithWithdrawal.filter(t => 
    t.is_complete || (t.clearance_date && new Date(t.clearance_date) <= new Date())
  );

  // Calculate progress for active withdrawals
  const calculateProgress = (treatment: Treatment) => {
    if (!treatment.treatment_date || !treatment.clearance_date) return 0;
    
    const startDate = new Date(treatment.treatment_date);
    const endDate = new Date(treatment.clearance_date);
    const today = new Date();
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
    return Math.round(progress);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 50) return 'bg-green-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // If no treatments with withdrawal periods, don't show the widget
  if (treatmentsWithWithdrawal.length === 0) {
    return null;
  }

  // Determine harvest safety status
  const harvestSafe = activeWithdrawals.length === 0;
  const latestClearanceDate = activeWithdrawals.length > 0
    ? activeWithdrawals.reduce((latest, t) => 
        t.clearance_date && (!latest || new Date(t.clearance_date) > new Date(latest))
          ? t.clearance_date!
          : latest,
        null as string | null
      )
    : null;

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={24} className="text-gray-700" />
        <h4 className="text-lg font-semibold text-gray-900">⏱ Withdrawal Period Tracker</h4>
      </div>

      <div className="space-y-4">
        {/* Active Withdrawals */}
        {activeWithdrawals.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Active withdrawal periods:
            </p>
            <div className="space-y-3">
              {activeWithdrawals.map(treatment => {
                const progress = calculateProgress(treatment);
                const progressColor = getProgressColor(progress);
                
                return (
                  <div key={treatment.treatment_id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {treatment.medicine_name}
                          </span>
                          {treatment.brand_name && (
                            <span className="text-sm text-gray-600">
                              ({treatment.brand_name})
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Treated: {formatDate(treatment.treatment_date)} · Last dose: {formatDate(treatment.last_dose_date)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {treatment.withdrawal_days}-day withdrawal · Clearance: {formatDate(treatment.clearance_date)}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                        ⚠ ACTIVE
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Day {Math.round(progress)} of {treatment.withdrawal_days} withdrawal</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cleared Withdrawals */}
        {clearedWithdrawals.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
              <span>Cleared medicines ({clearedWithdrawals.length})</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 space-y-2">
              {clearedWithdrawals.map(treatment => (
                <div key={treatment.treatment_id} className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">{treatment.medicine_name}</span>
                    {treatment.brand_name && (
                      <span className="text-sm text-gray-600 ml-2">({treatment.brand_name})</span>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      Cleared: {formatDate(treatment.clearance_date)}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Cleared
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Harvest Safety Status */}
        <div className={`mt-4 p-4 rounded-lg border-2 ${
          harvestSafe
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              harvestSafe ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {harvestSafe ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <Warning size={20} className="text-red-600" />
              )}
            </div>
            <div>
              <h5 className={`font-semibold mb-1 ${
                harvestSafe ? 'text-green-900' : 'text-red-900'
              }`}>
                HARVEST SAFETY STATUS:
              </h5>
              {harvestSafe ? (
                <p className="text-green-800">
                  ✅ HARVEST SAFE — No active withdrawal periods
                </p>
              ) : (
                <p className="text-red-800">
                  🔴 DO NOT HARVEST before {latestClearanceDate}
                  <br />
                  <span className="text-sm">
                    ({activeWithdrawals.length} withdrawal period{activeWithdrawals.length > 1 ? 's' : ''} active)
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
