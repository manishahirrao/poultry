'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Syringe, Warning, CheckCircle, XCircle, Clock, Info } from '@phosphor-icons/react';

interface Farm {
  id: string;
  name: string;
  district: string;
  status: string;
  activeBatch?: {
    id: string;
    batchNumber: number;
    birdsPlaced: number;
    birdsAlive: number;
    placementDate: string;
  };
}

interface HealthTrackingClientProps {
  farms: Farm[];
  integratorId: string;
  integratorDistrict: string;
}

export default function HealthTrackingClient({ farms, integratorId, integratorDistrict }: HealthTrackingClientProps) {
  const router = useRouter();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [biosecurityChecklist, setBiosecurityChecklist] = useState<boolean[]>(new Array(10).fill(false));
  const [hpaiAlert, setHpaiAlert] = useState<any>(null);

  // SWR fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  };

  // Fetch vaccination compliance data
  const { data: vaccinationData, error: vaccinationError } = useSWR(
    `/api/metrics/vaccination-compliance?integrator_id=${integratorId}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch health event timeline data
  const { data: healthEventData, error: healthEventError } = useSWR(
    `/api/metrics/health-events?integrator_id=${integratorId}&severity=${selectedSeverity}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: true }
  );

  // Fetch HPAI alerts
  useEffect(() => {
    const fetchHpaiAlert = async () => {
      try {
        const res = await fetch(`/api/alerts?type=HPAI&district=${integratorDistrict}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setHpaiAlert(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching HPAI alerts:', error);
      }
    };
    fetchHpaiAlert();
  }, [integratorDistrict]);

  // Load biosecurity checklist state from Supabase
  useEffect(() => {
    const loadChecklistState = async () => {
      try {
        const res = await fetch(`/api/metrics/biosecurity-checklist?integrator_id=${integratorId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.checklist) {
            setBiosecurityChecklist(data.checklist);
          }
        }
      } catch (error) {
        console.error('Error loading checklist state:', error);
      }
    };
    loadChecklistState();
  }, [integratorId]);

  // Handle severity filter change
  const handleSeverityChange = (severity: string) => {
    setSelectedSeverity(severity);
  };

  // Handle biosecurity checklist toggle
  const handleChecklistToggle = (index: number) => {
    const newChecklist = [...biosecurityChecklist];
    newChecklist[index] = !newChecklist[index];
    setBiosecurityChecklist(newChecklist);

    // FloppyDisk to Supabase
    fetch('/api/metrics/biosecurity-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integrator_id: integratorId,
        checklist: newChecklist,
      }),
    });
  };

  // Handle farm cell click
  const handleFarmClick = (farmId: string) => {
    router.push(`/dashboard/farms/${farmId}?tab=health`);
  };

  // Get health status for a farm
  const getHealthStatus = (farm: Farm) => {
    // Placeholder logic - would come from daily_logs health_issue field
    return 'healthy'; // healthy, monitor, alert
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-300';
      case 'monitor': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'alert': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const biosecurityItems = [
    'Restrict farm visitor access',
    'Increase disinfection frequency',
    'Monitor birds for respiratory symptoms daily',
    'Report unusual mortality to district vet',
    'Use dedicated footwear per shed',
    'Sanitize vehicles entering premises',
    'Check feed storage for contamination',
    'Monitor water quality regularly',
    'Isolate sick birds immediately',
    'Maintain proper ventilation',
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Health Log & Disease Tracker</h1>
        <p className="text-sm text-gray-600 mt-1">
          Monitor flock health, vaccination compliance, and disease alerts across your farms
        </p>
      </div>

      {/* Section 1: Health Status Grid */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Health Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {farms.map((farm) => {
            const healthStatus = getHealthStatus(farm);
            return (
              <button
                key={farm.id}
                onClick={() => handleFarmClick(farm.id)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getHealthStatusColor(healthStatus)}`}
              >
                <p className="text-sm font-semibold text-gray-900 truncate">{farm.name}</p>
                <p className="text-xs text-gray-600 mt-1 capitalize">{healthStatus}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Vaccination Compliance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vaccination Compliance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Farm</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Vaccine</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Due Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Days Overdue</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
              </tr>
            </thead>
            <tbody>
              {vaccinationData ? (
                vaccinationData.map((vaccination: any, index: number) => {
                  const isOverdue = vaccination.status === 'overdue';
                  const daysOverdue = vaccination.daysOverdue || 0;
                  
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${isOverdue ? 'border-l-4 border-l-red-600' : ''}`}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900">{vaccination.farmName}</td>
                      <td className="py-3 px-4 text-gray-600">{vaccination.vaccine}</td>
                      <td className="py-3 px-4 text-gray-600">{vaccination.dueDate}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          vaccination.status === 'done' ? 'bg-green-100 text-green-800' :
                          vaccination.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          vaccination.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vaccination.status.charAt(0).toUpperCase() + vaccination.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOverdue ? (
                          <span className="text-red-600 font-semibold">{daysOverdue} days</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{vaccination.notes || '—'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading vaccination data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Health Event Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Health Event Timeline</h2>
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {['all', 'critical', 'moderate', 'mild'].map((severity) => (
              <button
                key={severity}
                onClick={() => handleSeverityChange(severity)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  selectedSeverity === severity
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {healthEventData ? (
            healthEventData.length > 0 ? (
              healthEventData.map((event: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      event.severity === 'severe' ? 'bg-red-600' :
                      event.severity === 'moderate' ? 'bg-amber-600' :
                      'bg-blue-600'
                    }`} />
                    {index < healthEventData.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">{event.date}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        event.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        event.severity === 'moderate' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{event.farmName}</p>
                    <p className="text-sm text-gray-600 mt-1">{event.symptoms?.join(', ') || 'No symptoms recorded'}</p>
                    {event.notes && <p className="text-sm text-gray-500 mt-1">{event.notes}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No health events recorded in the selected period
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading health events...
            </div>
          )}
        </div>
      </div>

      {/* Section 4: HPAI + Biosecurity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">HPAI Advisory & Biosecurity</h2>
        
        {hpaiAlert ? (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Warning size={20} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    ⚠ HPAI advisory active in {integratorDistrict}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Follow biosecurity protocols strictly and monitor birds for respiratory symptoms daily.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900 mb-3">Biosecurity Checklist</h3>
            <div className="space-y-2">
              {biosecurityItems.map((item, index) => (
                <label key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={biosecurityChecklist[index]}
                    onChange={() => handleChecklistToggle(index)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">
                🟢 कोई HPAI advisory नहीं है — {integratorDistrict}, {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
