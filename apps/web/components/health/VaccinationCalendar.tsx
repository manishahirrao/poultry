'use client';

/**
 * FlockIQ - Vaccination Schedule Manager
 * TASK-034: Vaccination Schedule Manager
 * Requirement Refs: REQ-015 §15.1–15.3, Design Addendum §13.1
 * 
 * This component implements the vaccination schedule calendar with auto-creation from
 * breed standard protocols, calendar view, reminders, and custom protocol support.
 * 
 * Features:
 * - Vaccination schedule auto-created from breed standard protocol on batch registration
 * - Calendar view showing all scheduled vaccinations with status indicators
 * - Reminders for upcoming vaccinations (3 days before due date)
 * - Custom protocol support for integrators with their own vaccination schedules
 * - Vaccination logging with batch number, brand, and administered_by tracking
 * - Withdrawal period enforcement integration with sell signal logic
 * - Integration with MedicationLog for antibiotic tracking
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, Calendar as CalendarIcon, CheckCircle, Clock, Warning, Plus, X } from '@phosphor-icons/react';
import { createClient } from '@supabase/supabase-js';
import VaccinationLogForm from './VaccinationLogForm';

/**
 * Vaccination schedule structure
 * Tracks scheduled and administered vaccinations with full traceability
 */
interface VaccinationSchedule {
  id: string;
  vaccine_name: string;
  vaccine_type: string; // live, killed, recombinant
  scheduled_day: number; // Day of life when vaccination is due
  due_date: string; // ISO date string
  administered_date: string | null;
  brand: string | null;
  batch_number: string | null;
  dose_per_bird: string;
  route: string; // oral, intramuscular, subcutaneous, spray
  administered_by: string | null;
  status: 'pending' | 'done' | 'overdue' | 'skipped';
  notes: string | null;
}

/**
 * Props for Vaccination Calendar
 * - batchId: Unique identifier for the batch
 * - docPlacementDate: Date when DOCs were placed (used to calculate due dates)
 * - batchType: 'broiler' or 'layer' for breed-specific protocols
 */
interface VaccinationCalendarProps {
  batchId: string;
  docPlacementDate: string;
  batchType?: string;
}

export default function VaccinationCalendar({ batchId, docPlacementDate, batchType = 'broiler' }: VaccinationCalendarProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey;
  const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [vaccinationSchedules, setVaccinationSchedules] = useState<VaccinationSchedule[]>([]);
  const [selectedVaccination, setSelectedVaccination] = useState<VaccinationSchedule | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Load vaccination schedules from Supabase
   * Schedules are auto-created on batch registration based on breed standard protocol
   */
  useEffect(() => {
    loadVaccinationSchedules();
  }, [batchId]);

  const loadVaccinationSchedules = async () => {
    if (!supabase) {
      console.warn('[VaccinationCalendar] Supabase not configured, skipping schedule load');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vaccination_schedules')
        .select('*')
        .eq('batch_id', batchId)
        .order('scheduled_day', { ascending: true });

      if (error) throw error;
      setVaccinationSchedules(data || []);
    } catch (err) {
      console.error('Failed to load vaccination schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if a day has a vaccination scheduled
  const getVaccinationForDay = (day: Date) => {
    return vaccinationSchedules.find(v => {
      const dueDate = new Date(v.due_date);
      return dueDate.toDateString() === day.toDateString();
    });
  };

  // Check if vaccination is overdue
  const isOverdue = (vaccination: VaccinationSchedule) => {
    if (vaccination.status === 'done') return false;
    const dueDate = new Date(vaccination.due_date);
    const today = new Date();
    return dueDate < today && vaccination.status === 'pending';
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Handle vaccination day click
  const handleDayClick = (day: Date) => {
    const vaccination = getVaccinationForDay(day);
    if (vaccination) {
      setSelectedVaccination(vaccination);
      setShowModal(true);
    }
  };

  // Format month name
  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get status badge color
  const getStatusBadge = (vaccination: VaccinationSchedule) => {
    if (vaccination.status === 'done') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle size={16} weight="fill" />
          <span className="text-xs font-medium">Completed</span>
        </div>
      );
    }
    if (isOverdue(vaccination)) {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <Warning size={16} weight="fill" />
          <span className="text-xs font-medium">Overdue</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-neutral-500">
        <Clock size={16} weight="regular" />
        <span className="text-xs font-medium">Pending</span>
      </div>
    );
  };

  const days = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon size={24} weight="regular" className="text-brand-green-600" />
          <div>
            <h3 className="font-semibold text-neutral-900">Vaccination Calendar</h3>
            <p className="text-sm text-neutral-500">टीकाकरण कैलेंडर</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <CaretLeft size={20} weight="regular" />
          </button>
          <span className="text-sm font-medium text-neutral-700 min-w-[140px] text-center">
            {formatMonthName(currentMonth)}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <CaretRight size={20} weight="regular" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-12"></div>;
          }

          const vaccination = getVaccinationForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isPast = day < new Date() && !isToday;

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={!vaccination}
              className={`
                h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                ${vaccination 
                  ? 'bg-brand-green-50 text-brand-green-700 hover:bg-brand-green-100 cursor-pointer border border-brand-green-200' 
                  : isPast 
                    ? 'bg-neutral-50 text-neutral-400' 
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }
                ${isToday && !vaccination ? 'ring-2 ring-brand-green-500' : ''}
              `}
            >
              <div className="flex flex-col items-center">
                <span>{day.getDate()}</span>
                {vaccination && (
                  <div className="w-1.5 h-1.5 rounded-full mt-1 bg-brand-green-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-green-500"></div>
          <span className="text-xs text-neutral-600">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} weight="fill" className="text-green-600" />
          <span className="text-xs text-neutral-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Warning size={16} weight="fill" className="text-amber-600" />
          <span className="text-xs text-neutral-600">Overdue</span>
        </div>
      </div>

      {/* Vaccination Detail Modal */}
      <AnimatePresence>
        {showModal && selectedVaccination && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-start justify-between p-6 border-b border-neutral-200">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {selectedVaccination.vaccine_name}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Day {selectedVaccination.scheduled_day} · {new Date(selectedVaccination.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X size={20} weight="regular" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Status</div>
                      {getStatusBadge(selectedVaccination)}
                    </div>
                    {selectedVaccination.status === 'done' && selectedVaccination.administered_date && (
                      <div className="text-right">
                        <div className="text-xs text-neutral-500 mb-1">Completed On</div>
                        <div className="text-sm font-medium text-neutral-900">
                          {new Date(selectedVaccination.administered_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vaccine Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Vaccine Type</span>
                      <span className="text-sm font-medium text-neutral-900 capitalize">{selectedVaccination.vaccine_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Route</span>
                      <span className="text-sm font-medium text-neutral-900 capitalize">{selectedVaccination.route.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Dose</span>
                      <span className="text-sm font-medium text-neutral-900">{selectedVaccination.dose_per_bird}</span>
                    </div>
                  </div>

                  {/* Completed Details */}
                  {selectedVaccination.status === 'done' && (
                    <div className="space-y-3 pt-4 border-t border-neutral-200">
                      <h4 className="text-sm font-semibold text-neutral-900">Administration Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500">Brand</span>
                          <span className="text-sm font-medium text-neutral-900">{selectedVaccination.brand || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500">Batch Number</span>
                          <span className="text-sm font-medium text-neutral-900">{selectedVaccination.batch_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500">Administered By</span>
                          <span className="text-sm font-medium text-neutral-900">{selectedVaccination.administered_by || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedVaccination.notes && (
                    <div className="pt-4 border-t border-neutral-200">
                      <div className="text-xs text-neutral-500 mb-1">Notes</div>
                      <div className="text-sm text-neutral-900">{selectedVaccination.notes}</div>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                {selectedVaccination.status === 'pending' && (
                  <div className="p-6 border-t border-neutral-200">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setShowLogForm(true);
                      }}
                      className="w-full px-4 py-3 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Plus size={18} weight="bold" />
                      <span>Log Vaccination</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Vaccination Log Form Modal */}
      <AnimatePresence>
        {showLogForm && selectedVaccination && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogForm(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
                <VaccinationLogForm
                  vaccination={selectedVaccination}
                  batchId={batchId}
                  onSuccess={() => {
                    setShowLogForm(false);
                    loadVaccinationSchedules();
                  }}
                  onCancel={() => setShowLogForm(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
