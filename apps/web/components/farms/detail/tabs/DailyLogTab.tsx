'use client';

import { useState } from 'react';
import { PencilSimple, Download, CheckCircle, Pencil } from '@phosphor-icons/react';
import { DailyLogForm } from '@/app/dashboard/farms/[farmId]/components/DailyLogForm';

interface DailyLogTabProps {
  farmId: string;
  batchId: string;
  birdsPlaced?: number;
  birdsAlive?: number;
  cumulativeFeedKg?: number;
  cumulativeDead?: number;
  yesterdayWeight?: number;
}

// Mock data - in production this would come from API
const mockLogs = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  day: 28 - i,
  deathsToday: Math.floor(Math.random() * 5),
  mortalityPct: (2 + Math.random() * 1).toFixed(2),
  feedConsumed: (100 + Math.random() * 50).toFixed(1),
  fcr: (1.7 + Math.random() * 0.2).toFixed(2),
  avgWeight: (1500 + (28 - i) * 20).toFixed(0),
  water: (200 + Math.random() * 50).toFixed(0),
  tempMin: (22 + Math.random() * 3).toFixed(1),
  tempMax: (30 + Math.random() * 3).toFixed(1),
  humidity: Math.random() > 0.3 ? (55 + Math.random() * 25).toFixed(0) : null,
  ammoniaPpm: Math.random() > 0.5 ? (3 + Math.random() * 12).toFixed(1) : null,
  lightHours: (16 + Math.random() * 4).toFixed(1),
  notes: Math.random() > 0.7 ? 'Normal day' : '',
  source: Math.random() > 0.7 ? 'whatsapp' : 'manual', // Randomly assign source
}));

export function DailyLogTab({ 
  farmId, 
  batchId,
  birdsPlaced = 12500,
  birdsAlive = 12450,
  cumulativeFeedKg = 15000,
  cumulativeDead = 50,
  yesterdayWeight = 1650,
}: DailyLogTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);
  const [logSubmittedTime, setLogSubmittedTime] = useState<string | null>(null);
  const itemsPerPage = 30;

  const totalPages = Math.ceil(mockLogs.length / itemsPerPage);
  const currentLogs = mockLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Check if today's log is missing
  const today = new Date().toISOString().split('T')[0];
  const isTodayLogged = todayLogged || mockLogs.some(log => log.date === today);

  const handleLogSaved = () => {
    setTodayLogged(true);
    setLogSubmittedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Daily Log Form - shown when today's log is missing or when edit is clicked */}
      {showForm && (
        <DailyLogForm
          farmId={farmId}
          batchId={batchId}
          birdsPlaced={birdsPlaced}
          birdsAlive={birdsAlive}
          cumulativeFeedKg={cumulativeFeedKg}
          cumulativeDead={cumulativeDead}
          yesterdayWeight={yesterdayWeight}
          onLogSaved={handleLogSaved}
        />
      )}

      {/* Log Submitted State - shown when today's log is already submitted */}
      {isTodayLogged && !showForm && (
        <div className="bg-[#DCFCE7] border border-[#16A34A] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-[#16A34A]" />
            <div>
              <p className="font-semibold text-[#16A34A]">✓ Log submitted at {logSubmittedTime || '09:23 AM'}</p>
              <p className="text-sm text-gray-700">आज का लॉग सुरक्षित हो गया</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#16A34A] text-[#16A34A] rounded-lg hover:bg-[#EDF7F1] transition-colors font-semibold"
          >
            <Pencil size={18} />
            Edit
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        {!isTodayLogged && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#1F7040] transition-colors font-semibold"
          >
            <PencilSimple size={18} />
            Log Today's Data
          </button>
        )}
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#CBD5CE] text-gray-700 rounded-lg hover:bg-[#F4F7F5] transition-colors font-semibold">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Day #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Source</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Birds Dead</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Mortality %</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Feed (kg)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">FCR</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Avg Wt (g)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Water (L)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Temp (°C)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Humidity (%)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">NH₃ (ppm)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Light (h)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Notes</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => {
                const mortalityPct = parseFloat(log.mortalityPct);
                const humidityVal = log.humidity ? parseFloat(log.humidity) : null;
                const ammoniaVal = log.ammoniaPpm ? parseFloat(log.ammoniaPpm) : null;
                const rowColor = mortalityPct > 1.5 ? 'bg-amber-50' : 'bg-white';
                return (
                  <tr key={index} className={`border-b border-gray-100 ${rowColor}`}>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{log.date}</td>
                    <td className="px-4 py-3 text-gray-900">{log.day}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.source === 'whatsapp' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#DCFCE7] text-[#16A34A]">
                          📱 WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          ✏ Manual
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{log.deathsToday}</td>
                    <td className="px-4 py-3 text-gray-900">{log.mortalityPct}%</td>
                    <td className="px-4 py-3 text-gray-900">{log.feedConsumed}</td>
                    <td className={`px-4 py-3 font-medium ${parseFloat(log.fcr) < 1.85 ? 'text-green-700' : parseFloat(log.fcr) < 2.0 ? 'text-amber-700' : 'text-red-700'}`}>{log.fcr}</td>
                    <td className="px-4 py-3 text-gray-900">{log.avgWeight}</td>
                    <td className="px-4 py-3 text-gray-900">{log.water}</td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{log.tempMin}–{log.tempMax}</td>
                    <td className={`px-4 py-3 ${humidityVal !== null ? (humidityVal > 75 ? 'text-red-600 font-semibold' : humidityVal > 65 ? 'text-amber-600' : 'text-gray-900') : 'text-gray-400'}`}>
                      {log.humidity ? `${log.humidity}%` : '—'}
                    </td>
                    <td className={`px-4 py-3 ${ammoniaVal !== null ? (ammoniaVal >= 25 ? 'text-red-600 font-semibold' : ammoniaVal >= 10 ? 'text-amber-600' : 'text-green-600') : 'text-gray-400'}`}>
                      {log.ammoniaPpm ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{log.lightHours}h</td>
                    <td className="px-4 py-3 text-gray-600">{log.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
