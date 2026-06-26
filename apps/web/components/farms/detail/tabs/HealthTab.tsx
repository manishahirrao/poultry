'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Warning, X, Heart, Pulse, Drop, Wind } from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import { TreatmentLog } from '../health/TreatmentLog';
import EnvironmentScoreCard from '@/components/dashboard/iot/EnvironmentScoreCard';
import { LatestSensorReading } from '@/types/iot';

interface HealthTabProps {
  farmId: string;
  batchId: string;
  district: string;
}

interface AlertRow {
  id: string;
  type: 'HPAI' | 'WEATHER' | 'PRICE_WARNING' | 'POLICY';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  title_hi: string;
  message: string;
  message_hi: string;
  districts: string[];
  active_from: string;
  active_until: string;
}

interface HealthChecklist {
  id: string;
  log_date: string;
  bird_behaviour: string;
  appetite: string;
  droppings: string;
  respiratory: string;
  water_consumption: string;
}

// Mock vaccination schedule data
const mockVaccinations = [
  { vaccine: 'IBD', type: 'Live', scheduledDay: 7, dueDate: '2026-05-09', status: 'done', adminRoute: 'Water', notes: '' },
  { vaccine: 'ND', type: 'Live', scheduledDay: 14, dueDate: '2026-05-16', status: 'done', adminRoute: 'Water', notes: '' },
  { vaccine: 'IB', type: 'Live', scheduledDay: 21, dueDate: '2026-05-23', status: 'pending', adminRoute: 'Water', notes: '' },
  { vaccine: 'ND + IB', type: 'Killed', scheduledDay: 28, dueDate: '2026-05-30', status: 'pending', adminRoute: 'Injection', notes: '' },
];

// Mock health events
const mockHealthEvents = [
  { date: '2026-05-20', severity: 'mild', symptoms: ['Respiratory'], notes: 'Mild respiratory symptoms, treated with antibiotics' },
  { date: '2026-05-12', severity: 'moderate', symptoms: ['Leg weakness'], notes: 'Few birds showing leg weakness, added supplements' },
];

export function HealthTab({ farmId, batchId, district }: HealthTabProps) {
  const [showSymptomLog, setShowSymptomLog] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [hpaiAlert, setHpaiAlert] = useState<AlertRow | null>(null);
  const [showBiosecurityChecklist, setShowBiosecurityChecklist] = useState(false);
  const [biosecurityItems, setBiosecurityItems] = useState<string[]>([]);
  const [healthChecklists, setHealthChecklists] = useState<HealthChecklist[]>([]);
  const [loadingChecklists, setLoadingChecklists] = useState(true);
  const [sensorReading, setSensorReading] = useState<LatestSensorReading | null>(null);
  const [loadingSensor, setLoadingSensor] = useState(true);

  // Fetch HPAI alerts for this district
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const supabase = createClient();
        if (!supabase) return;
        
        const { data: alerts } = await supabase
          .from('alerts')
          .select('*')
          .eq('type', 'HPAI')
          .eq('severity', 'critical')
          .contains('districts', [district])
          .gte('active_from', new Date().toISOString())
          .lte('active_until', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (alerts && alerts.length > 0) {
          setHpaiAlert(alerts[0] as AlertRow);
        }
      } catch (error) {
        console.error('Error fetching HPAI alerts:', error);
      }
    };

    fetchAlerts();
  }, [district]);

  // Fetch health checklists for the last 14 days
  useEffect(() => {
    const fetchHealthChecklists = async () => {
      try {
        const supabase = createClient();
        if (!supabase) return;
        
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const { data: checklists } = await supabase
          .from('health_checklists')
          .select('*')
          .eq('batch_id', batchId)
          .gte('log_date', fourteenDaysAgo.toISOString().split('T')[0])
          .order('log_date', { ascending: false });

        if (checklists) {
          setHealthChecklists(checklists);
        }
      } catch (error) {
        console.error('Error fetching health checklists:', error);
      } finally {
        setLoadingChecklists(false);
      }
    };

    fetchHealthChecklists();
  }, [batchId]);

  // Fetch latest sensor reading for environment monitoring
  useEffect(() => {
    const fetchSensorReading = async () => {
      try {
        const supabase = createClient();
        if (!supabase) return;

        // Try to fetch from materialized view if it exists, otherwise from sensor_telemetry table
        const { data: reading } = await supabase
          .from('mv_latest_sensor_readings')
          .select('*')
          .eq('farm_id', farmId)
          .maybeSingle();

        if (reading) {
          setSensorReading(reading as LatestSensorReading);
        } else {
          // Fallback: fetch latest from sensor_telemetry
          const { data: telemetry } = await supabase
            .from('sensor_telemetry')
            .select('*')
            .eq('farm_id', farmId)
            .order('received_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (telemetry) {
            setSensorReading(telemetry as LatestSensorReading);
          }
        }
      } catch (error) {
        console.error('Error fetching sensor reading:', error);
        // Silently fail - sensor data is optional
      } finally {
        setLoadingSensor(false);
      }
    };

    fetchSensorReading();
  }, [farmId]);

  const today = new Date().toISOString().split('T')[0];
  const overdueVaccinations = mockVaccinations.filter(v => v.status === 'pending' && v.dueDate < today);

  // Calculate health checklist status for each day
  const getChecklistStatus = (checklist: HealthChecklist | null): 'green' | 'amber' | 'red' => {
    if (!checklist) return 'red';
    
    const abnormalFields = [
      checklist.bird_behaviour !== 'normal',
      checklist.appetite !== 'normal',
      checklist.droppings !== 'normal',
      checklist.respiratory !== 'normal',
      checklist.water_consumption !== 'normal'
    ].filter(Boolean).length;

    if (abnormalFields === 0) return 'green';
    if (abnormalFields <= 2) return 'amber';
    return 'red';
  };

  // Generate last 14 days array
  const getLast14Days = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last14Days = getLast14Days();

  return (
    <div className="space-y-6">
      {/* HPAI Alert Banner */}
      {hpaiAlert && (
        <div role="alert" aria-live="assertive" aria-atomic="true" className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Warning size={20} className="text-red-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-red-900">{hpaiAlert.title_hi}</h4>
                <p className="text-sm text-red-700 mt-1">{hpaiAlert.message_hi}</p>
                <button
                  onClick={() => setShowBiosecurityChecklist(!showBiosecurityChecklist)}
                  className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-800"
                >
                  {showBiosecurityChecklist ? 'Hide' : 'Show'} Biosecurity Checklist →
                </button>
              </div>
            </div>
            <button
              onClick={() => setHpaiAlert(null)}
              className="text-red-400 hover:text-red-600"
              aria-label="Dismiss alert"
            >
              <X size={20} />
            </button>
          </div>

          {/* Biosecurity Checklist */}
          {showBiosecurityChecklist && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <h5 className="text-sm font-semibold text-red-900 mb-3">Biosecurity Checklist (HPAI Advisory Active)</h5>
              <div className="space-y-2">
                {[
                  'Restrict farm visitor access',
                  'Increase disinfection frequency',
                  'Monitor birds for respiratory symptoms',
                  'Report sudden deaths immediately',
                  'Separate sick birds from healthy flock',
                  'Use dedicated footwear for each shed',
                  'Avoid contact with wild birds',
                  'Check feed and water sources for contamination'
                ].map((item, index) => (
                  <label key={index} className="flex items-start gap-2 text-sm text-red-800">
                    <input
                      type="checkbox"
                      checked={biosecurityItems.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBiosecurityItems([...biosecurityItems, item]);
                        } else {
                          setBiosecurityItems(biosecurityItems.filter(i => i !== item));
                        }
                      }}
                      className="mt-0.5 rounded border-red-300"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs text-red-600">
                Completed: {biosecurityItems.length} / 8 items
              </div>
            </div>
          )}
        </div>
      )}

      {/* Environment Score Card */}
      {!loadingSensor && (
        <EnvironmentScoreCard
          reading={sensorReading}
          farmName={`Farm ${farmId}`}
        />
      )}

      {/* Current Health Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🟢 Healthy</h3>
            <p className="text-sm text-gray-600">Last updated: Today, 09:23 AM</p>
          </div>
        </div>
      </div>

      {/* Vaccination Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vaccination Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Vaccine</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Scheduled Day</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Due Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Route</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Notes</th>
              </tr>
            </thead>
            <tbody>
              {mockVaccinations.map((vacc, index) => {
                const isOverdue = vacc.status === 'pending' && vacc.dueDate < today;
                const rowClass = isOverdue ? 'bg-red-50 ring-1 ring-inset ring-red-300' : '';
                return (
                  <tr key={index} className={`border-b border-gray-100 ${rowClass}`}>
                    <td className="px-4 py-3 text-gray-900">{vacc.vaccine}</td>
                    <td className="px-4 py-3 text-gray-900">{vacc.type}</td>
                    <td className="px-4 py-3 text-gray-900">Day {vacc.scheduledDay}</td>
                    <td className="px-4 py-3 text-gray-900">{vacc.dueDate}</td>
                    <td className="px-4 py-3">
                      {vacc.status === 'done' ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} /> Done
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                          <Warning size={16} /> Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Clock size={16} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{vacc.adminRoute}</td>
                    <td className="px-4 py-3 text-gray-600">{vacc.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health Event Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Event Timeline</h3>
        <div className="space-y-4">
          {mockHealthEvents.map((event, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">{event.date}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  event.severity === 'severe' ? 'bg-red-100 text-red-700' :
                  event.severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {event.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600">Symptoms: {event.symptoms.join(', ')}</p>
              <p className="text-sm text-gray-600">{event.notes}</p>
            </div>
          ))}
          {mockHealthEvents.length === 0 && (
            <p className="text-sm text-gray-500">No health events recorded</p>
          )}
        </div>
      </div>

      {/* Symptom Quick-Log */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptom Quick-Log</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-900 mb-2">आज कोई symptom है?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSymptomLog(false)}
                className={`px-4 py-2 rounded-lg font-semibold ${!showSymptomLog ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                नहीं
              </button>
              <button
                onClick={() => setShowSymptomLog(true)}
                className={`px-4 py-2 rounded-lg font-semibold ${showSymptomLog ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                हाँ
              </button>
            </div>
          </div>

          {showSymptomLog && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Select symptoms:</p>
              <div className="grid grid-cols-2 gap-2">
                {['Respiratory', 'Digestive', 'Leg weakness', 'Skin lesions', 'Neuro signs', 'Other'].map((symptom) => (
                  <label key={symptom} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSymptoms([...selectedSymptoms, symptom]);
                        } else {
                          setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    {symptom}
                  </label>
                ))}
              </div>
              <textarea
                placeholder="Description (optional, 200 char max)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                maxLength={200}
              />
              <button className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-semibold">
                Log Symptoms
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Treatment Log - GAP3-UI-001 */}
      <TreatmentLog farmId={farmId} batchId={batchId} />

      {/* Health Checklist History - TASK-036 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Checklist History (Last 14 Days)</h3>
        <p className="text-sm text-gray-600 mb-4">दैनिक स्वास्थ्य जांच इतिहास (पिछले 14 दिन)</p>
        
        {loadingChecklists ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">All Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-gray-700">Some Abnormal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-700">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-700">Not Submitted</span>
              </div>
            </div>

            {/* 14-day Grid */}
            <div className="grid grid-cols-7 gap-2">
              {last14Days.map((date) => {
                const checklist = healthChecklists.find(c => c.log_date === date);
                const status = getChecklistStatus(checklist || null);
                const dateObj = new Date(date);
                const dayOfMonth = dateObj.getDate();
                const isToday = date === today;

                const bgColor = checklist 
                  ? status === 'green' ? 'bg-green-500' 
                  : status === 'amber' ? 'bg-amber-500' 
                  : 'bg-red-500'
                  : 'bg-gray-300';

                return (
                  <div
                    key={date}
                    className={`
                      ${bgColor} ${isToday ? 'ring-2 ring-offset-2 ring-brand-green-500' : ''}
                      rounded-lg p-2 text-center cursor-pointer hover:opacity-80 transition-opacity
                    `}
                    title={checklist ? `Submitted: ${date}` : `Not submitted: ${date}`}
                  >
                    <div className="text-white font-semibold text-sm">{dayOfMonth}</div>
                    {checklist && (
                      <div className="flex justify-center gap-1 mt-1">
                        {checklist.respiratory !== 'normal' && <Wind size={12} className="text-white" weight="fill" />}
                        {checklist.appetite !== 'normal' && <Pulse size={12} className="text-white" weight="fill" />}
                        {checklist.droppings !== 'normal' && <Drop size={12} className="text-white" weight="fill" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  Submitted: {healthChecklists.length}/14 days
                </span>
                <span className="text-gray-700">
                  Completion rate: {Math.round((healthChecklists.length / 14) * 100)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
