'use client';

import React, { useState, useEffect } from 'react';
import { 
  CriticalControlPoint, 
  MeasurableLimit, 
  HACCPChecklistItem, 
  HACCPDeviation,
  getAllCCPs,
  getCCPById,
  checkLimitCompliance
} from '@/lib/haccpTypes';

interface HACCPChecklistProps {
  processingRunId: string;
  batchId?: string;
  supervisorId: string;
  supervisorName: string;
  onComplete?: (checklist: HACCPChecklistItem[], deviations: HACCPDeviation[]) => void;
}

export function HACCPChecklist({ 
  processingRunId, 
  batchId, 
  supervisorId, 
  supervisorName,
  onComplete 
}: HACCPChecklistProps) {
  const [ccps] = useState<CriticalControlPoint[]>(getAllCCPs());
  const [checklistItems, setChecklistItems] = useState<Record<string, HACCPChecklistItem>>({});
  const [deviations, setDeviations] = useState<HACCPDeviation[]>([]);
  const [readings, setReadings] = useState<Record<string, Record<string, number>>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedCCP, setExpandedCCP] = useState<string | null>(null);
  const [showDeviationModal, setShowDeviationModal] = useState(false);
  const [currentDeviation, setCurrentDeviation] = useState<{
    ccpId: string;
    limitId: string;
    parameter: string;
    actualValue: number;
    limitValue: number;
    deviationType: 'minor' | 'major' | 'critical';
  } | null>(null);

  const handleReadingChange = (ccpId: string, limitId: string, value: number) => {
    setReadings(prev => ({
      ...prev,
      [ccpId]: {
        ...prev[ccpId],
        [limitId]: value
      }
    }));

    const ccp = getCCPById(ccpId);
    if (!ccp) return;

    const limit = ccp.measurableLimits.find(l => l.id === limitId);
    if (!limit) return;

    const compliance = checkLimitCompliance(value, limit);

    if (!compliance.compliant) {
      setCurrentDeviation({
        ccpId,
        limitId,
        parameter: limit.parameter,
        actualValue: value,
        limitValue: limit.maxLimit || limit.minLimit || limit.criticalLimit,
        deviationType: compliance.deviationType === 'none' ? 'minor' : compliance.deviationType
      });
      setShowDeviationModal(true);
    }
  };

  const handleDeviationSubmit = (correctiveAction: string) => {
    if (!currentDeviation) return;

    const newDeviation: HACCPDeviation = {
      id: `dev-${Date.now()}`,
      ccpId: currentDeviation.ccpId,
      ccpName: getCCPById(currentDeviation.ccpId)?.name || '',
      parameter: currentDeviation.parameter,
      actualValue: currentDeviation.actualValue,
      limitValue: currentDeviation.limitValue,
      deviationType: currentDeviation.deviationType,
      timestamp: new Date().toISOString(),
      supervisorId,
      supervisorName,
      correctiveAction,
      correctiveActionHindi: correctiveAction, // In production, this would be translated
      resolved: false,
      processingRunId,
      batchId
    };

    setDeviations(prev => [...prev, newDeviation]);
    setShowDeviationModal(false);
    setCurrentDeviation(null);
  };

  const handleCCPComplete = (ccpId: string) => {
    const ccp = getCCPById(ccpId);
    if (!ccp) return;

    const ccpReadings = readings[ccpId] || {};
    const hasAllReadings = ccp.measurableLimits.every(limit => 
      ccpReadings[limit.id] !== undefined
    );

    if (!hasAllReadings) {
      alert('Please complete all readings for this CCP');
      return;
    }

    const checklistItem: HACCPChecklistItem = {
      ccpId,
      status: deviations.some(d => d.ccpId === ccpId && !d.resolved) 
        ? 'deviation' 
        : 'compliant',
      readings: ccpReadings,
      timestamp: new Date().toISOString(),
      supervisorId,
      supervisorName,
      notes: notes[ccpId]
    };

    setChecklistItems(prev => ({
      ...prev,
      [ccpId]: checklistItem
    }));
  };

  const handleCompleteAll = () => {
    const allCCPsCompleted = ccps.every(ccp => checklistItems[ccp.id]);
    
    if (!allCCPsCompleted) {
      alert('Please complete all CCPs before submitting');
      return;
    }

    const completedItems = Object.values(checklistItems);
    onComplete?.(completedItems, deviations);
  };

  const getCCPStatus = (ccpId: string): 'compliant' | 'deviation' | 'not_monitored' => {
    const item = checklistItems[ccpId];
    if (!item) return 'not_monitored';
    return item.status;
  };

  const getLimitStatus = (ccpId: string, limitId: string): 'compliant' | 'deviation' | 'pending' => {
    const reading = readings[ccpId]?.[limitId];
    if (reading === undefined) return 'pending';

    const ccp = getCCPById(ccpId);
    if (!ccp) return 'pending';

    const limit = ccp.measurableLimits.find(l => l.id === limitId);
    if (!limit) return 'pending';

    const compliance = checkLimitCompliance(reading, limit);
    return compliance.compliant ? 'compliant' : 'deviation';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">HACCP Audit Checklist</h2>
            <p className="text-sm text-gray-600 mt-1">
              Processing Run: {processingRunId} {batchId && `· Batch: ${batchId}`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Supervisor: {supervisorName}
            </div>
            <button
              onClick={handleCompleteAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Complete Audit
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {ccps.map((ccp, index) => (
            <div
              key={ccp.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedCCP(expandedCCP === ccp.id ? null : ccp.id)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{ccp.name}</h3>
                    <p className="text-sm text-gray-600">{ccp.nameHindi}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {(() => {
                    const status = getCCPStatus(ccp.id);
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'compliant' 
                          ? 'bg-green-100 text-green-700' 
                          : status === 'deviation'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {status === 'compliant' ? '✓ Compliant' : status === 'deviation' ? '⚠ Deviation' : 'Pending'}
                      </span>
                    );
                  })()}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedCCP === ccp.id ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedCCP === ccp.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-4">{ccp.description}</p>
                  
                  <div className="space-y-4">
                    {ccp.measurableLimits.map((limit) => (
                      <div key={limit.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{limit.parameter}</h4>
                            <p className="text-sm text-gray-600">{limit.parameterHindi}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Limit: {limit.minLimit !== undefined ? `${limit.minLimit}-` : ''}{limit.maxLimit} {limit.unit}
                            </p>
                            <p className="text-xs text-gray-500">
                              Critical: {limit.criticalLimit} {limit.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Reading ({limit.unit})
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={readings[ccp.id]?.[limit.id] || ''}
                              onChange={(e) => handleReadingChange(ccp.id, limit.id, parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder={`Enter value in ${limit.unit}`}
                            />
                          </div>

                          {(() => {
                            const status = getLimitStatus(ccp.id, limit.id);
                            return (
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                status === 'compliant' 
                                  ? 'bg-green-100 text-green-700' 
                                  : status === 'deviation'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {status === 'compliant' ? '✓ OK' : status === 'deviation' ? '⚠ Deviation' : 'Pending'}
                              </div>
                            );
                          })()}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Monitoring:</span> {limit.monitoringFrequency} · {limit.monitoringMethod}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes[ccp.id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [ccp.id]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={2}
                      placeholder="Add any observations or notes..."
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleCCPComplete(ccp.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      {checklistItems[ccp.id] ? 'Update CCP' : 'Complete CCP'}
                    </button>
                  </div>

                  {deviations.filter(d => d.ccpId === ccp.id).length > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">Deviations Recorded</h4>
                      <div className="space-y-2">
                        {deviations.filter(d => d.ccpId === ccp.id).map((deviation) => (
                          <div key={deviation.id} className="text-sm">
                            <p className="font-medium text-red-800">
                              {deviation.parameter}: {deviation.actualValue} (limit: {deviation.limitValue})
                            </p>
                            <p className="text-red-700">Corrective Action: {deviation.correctiveAction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {deviations.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Deviations Summary ({deviations.length})
            </h3>
            <div className="space-y-2">
              {deviations.map((deviation) => (
                <div key={deviation.id} className="text-sm">
                  <p className="font-medium text-yellow-800">
                    {deviation.ccpName} - {deviation.parameter}
                  </p>
                  <p className="text-yellow-700">
                    {deviation.actualValue} (limit: {deviation.limitValue}) · {deviation.deviationType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDeviationModal && currentDeviation && (
        <DeviationModal
          deviation={currentDeviation}
          onSubmit={handleDeviationSubmit}
          onClose={() => {
            setShowDeviationModal(false);
            setCurrentDeviation(null);
          }}
        />
      )}
    </div>
  );
}

interface DeviationModalProps {
  deviation: {
    ccpId: string;
    limitId: string;
    parameter: string;
    actualValue: number;
    limitValue: number;
    deviationType: 'minor' | 'major' | 'critical';
  };
  onSubmit: (correctiveAction: string) => void;
  onClose: () => void;
}

function DeviationModal({ deviation, onSubmit, onClose }: DeviationModalProps) {
  const [correctiveAction, setCorrectiveAction] = useState('');

  const ccp = getCCPById(deviation.ccpId);
  const limit = ccp?.measurableLimits.find(l => l.id === deviation.limitId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctiveAction.trim()) {
      alert('Please enter a corrective action');
      return;
    }
    onSubmit(correctiveAction);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Deviation Recorded
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="font-medium text-red-900">{ccp?.name}</p>
            <p className="text-red-800">{deviation.parameter}: {deviation.actualValue} (limit: {deviation.limitValue})</p>
            <p className="text-sm text-red-700 mt-1">Severity: {deviation.deviationType}</p>
          </div>

          {limit && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Suggested Corrective Actions:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {(limit as any).correctiveActions?.map((action: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{action}</span>
                  </li>
                )) || []}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corrective Action Taken *
              </label>
              <textarea
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the corrective action taken..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Record Deviation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
