'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock, Warning, CaretDown, CaretUp, Pencil, Trash, Paperclip } from '@phosphor-icons/react';
import { UploadDocumentModal } from '@/components/farms/docs/UploadDocumentModal';

interface Treatment {
  treatment_id: string;
  treatment_date: string;
  medicine_name: string;
  brand_name: string | null;
  lot_number: string | null;
  purpose: string[];
  dosage_amount: number | null;
  dosage_unit: string | null;
  dosage_per: string | null;
  route: string;
  treatment_day_start: number | null;
  treatment_day_end: number | null;
  last_dose_date: string | null;
  withdrawal_days: number;
  clearance_date: string | null;
  is_complete: boolean;
  cost: number | null;
  vet_name_snapshot: string | null;
  notes: string | null;
}

interface TreatmentLogTableProps {
  treatments: Treatment[];
  expandedRow: string | null;
  onRowExpand: (id: string | null) => void;
  onTreatmentUpdate: (treatment: Treatment) => void;
  onTreatmentDelete: (treatmentId: string) => void;
  farmId: string;
  batchId: string;
}

export function TreatmentLogTable({
  treatments,
  expandedRow,
  onRowExpand,
  onTreatmentUpdate,
  onTreatmentDelete,
  farmId,
  batchId
}: TreatmentLogTableProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const getStatus = (treatment: Treatment) => {
    if (treatment.withdrawal_days === 0) {
      return { label: 'Complete', color: 'bg-gray-100 text-gray-700' };
    }
    
    if (!treatment.clearance_date) {
      return { label: 'Active Treatment', color: 'bg-blue-100 text-blue-700' };
    }
    
    const clearanceDate = new Date(treatment.clearance_date);
    const today = new Date();
    
    if (clearanceDate > today) {
      return { label: 'Withdrawal', color: 'bg-amber-100 text-amber-700' };
    }
    
    return { label: 'Cleared', color: 'bg-green-100 text-green-700' };
  };

  const formatCurrencyDollar = (amount: number | null) => {
    if (amount === null) return '-';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (treatments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">💊</span>
        </div>
        <p className="text-gray-900 font-medium mb-1">No treatments recorded</p>
        <p className="text-gray-500 text-sm mb-1">कोई उपचार दर्ज नहीं</p>
        <p className="text-gray-400 text-sm">Log your first treatment when needed</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Medicine</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Brand</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Purpose</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Dosage</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Route</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Withdrawal</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Cost</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((treatment) => {
              const status = getStatus(treatment);
              const isExpanded = expandedRow === treatment.treatment_id;
              
              return (
                <React.Fragment key={treatment.treatment_id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 text-gray-900">{formatDate(treatment.treatment_date)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{treatment.medicine_name}</td>
                    <td className="px-4 py-3 text-gray-600">{treatment.brand_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {treatment.purpose.length > 0 ? treatment.purpose.slice(0, 2).join(', ') + (treatment.purpose.length > 2 ? '...' : '') : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {treatment.dosage_amount && treatment.dosage_unit 
                        ? `${treatment.dosage_amount}${treatment.dosage_unit}` 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{treatment.route}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {treatment.treatment_day_start && treatment.treatment_day_end
                        ? `D${treatment.treatment_day_start}–D${treatment.treatment_day_end}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {treatment.withdrawal_days > 0 ? `${treatment.withdrawal_days} days` : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrencyDollar(treatment.cost)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${status.color}`}>
                        {status.label === 'Complete' && <CheckCircle size={12} />}
                        {status.label === 'Withdrawal' && <Clock size={12} />}
                        {status.label === 'Active Treatment' && <Clock size={12} />}
                        {status.label === 'Cleared' && <CheckCircle size={12} />}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowExpand(isExpanded ? null : treatment.treatment_id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTreatment(treatment);
                            setShowUploadModal(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-600"
                          title="Attach medicine bill"
                        >
                          <Paperclip size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit - would open edit form
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this treatment?')) {
                              onTreatmentDelete(treatment.treatment_id);
                            }
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row Details */}
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={11} className="px-4 py-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Indication</span>
                              <p className="text-sm text-gray-900 mt-1">
                                {treatment.purpose.length > 0 ? treatment.purpose.join(', ') : '-'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Dosage Calculation</span>
                              <p className="text-sm text-gray-900 mt-1">
                                {treatment.dosage_amount && treatment.dosage_unit && treatment.dosage_per
                                  ? `${treatment.dosage_amount}${treatment.dosage_unit} ${treatment.dosage_per}`
                                  : '-'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Batch/Lot Number</span>
                              <p className="text-sm text-gray-900 mt-1">{treatment.lot_number || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Prescribed By</span>
                              <p className="text-sm text-gray-900 mt-1">{treatment.vet_name_snapshot || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Last Dose Date</span>
                              <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.last_dose_date)}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Clearance Date</span>
                              <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.clearance_date)}</p>
                            </div>
                          </div>
                          {treatment.notes && (
                            <div>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Notes</span>
                              <p className="text-sm text-gray-900 mt-1">{treatment.notes}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Completion Status</span>
                            <p className="text-sm text-gray-900 mt-1">
                              {treatment.is_complete ? (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle size={14} /> Complete
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600">
                                  <Clock size={14} /> In Progress
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedTreatment(null);
        }}
        farmId={farmId}
        batchId={batchId}
        initialDocType="medicine_bill"
        onUploadSuccess={() => {
          setShowUploadModal(false);
          setSelectedTreatment(null);
        }}
      />
    </>
  );
}
