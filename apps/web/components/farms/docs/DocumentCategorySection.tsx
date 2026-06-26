'use client';

import { useState } from 'react';
import { CaretDown, CaretUp, Plus } from '@phosphor-icons/react';
import { DocumentCard } from './DocumentCard';

interface Document {
  doc_id: string;
  doc_name: string;
  doc_type: string;
  file_ext: string;
  file_size_bytes: number;
  document_date: string | null;
  download_url: string | null;
  created_at: string;
  tags: string[] | null;
  notes: string | null;
  batch_id?: string | null;
}

interface DocumentCategorySectionProps {
  category: string;
  documents: Document[];
  onUpload: () => void;
  onDocumentDownload: (docId: string) => void;
  onDocumentPreview: (docId: string) => void;
  onDocumentRename: (docId: string) => void;
  onDocumentDelete: (docId: string) => void;
}

const CATEGORY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  chick_invoice: { icon: '🐣', label: 'Chick Purchase Documents', color: 'text-amber-600' },
  feed_invoice: { icon: '🌽', label: 'Feed Purchase Invoices', color: 'text-green-600' },
  vaccination_cert: { icon: '💉', label: 'Vaccination & Health Certificates', color: 'text-blue-600' },
  medicine_bill: { icon: '💊', label: 'Medicine Purchase Bills', color: 'text-purple-600' },
  movement_permit: { icon: '🚛', label: 'Movement Permits', color: 'text-orange-600' },
  sale_invoice: { icon: '💰', label: 'Sales / Buyer Invoices', color: 'text-emerald-600' },
  lab_report: { icon: '🧪', label: 'Lab Test Reports', color: 'text-cyan-600' },
  insurance: { icon: '🛡️', label: 'Insurance Documents', color: 'text-indigo-600' },
  batch_closure_report: { icon: '📊', label: 'Batch Closure Reports', color: 'text-slate-600' },
  other: { icon: '📎', label: 'Other / Miscellaneous', color: 'text-gray-600' },
};

export function DocumentCategorySection({
  category,
  documents,
  onUpload,
  onDocumentDownload,
  onDocumentPreview,
  onDocumentRename,
  onDocumentDelete,
}: DocumentCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
            {documents.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                {documents.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpload();
            }}
            className="px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded flex items-center gap-1 transition-colors"
          >
            <Plus size={16} weight="regular" />
            Upload
          </button>
          {isExpanded ? (
            <CaretUp size={20} weight="regular" className="text-gray-500" />
          ) : (
            <CaretDown size={20} weight="regular" className="text-gray-500" />
          )}
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 bg-white">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No documents in this category</p>
              <button
                onClick={onUpload}
                className="mt-2 px-4 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.doc_id}
                  document={doc}
                  onDownload={() => onDocumentDownload(doc.doc_id)}
                  onPreview={() => onDocumentPreview(doc.doc_id)}
                  onRename={() => onDocumentRename(doc.doc_id)}
                  onDelete={() => onDocumentDelete(doc.doc_id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
