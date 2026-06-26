'use client';

/**
 * FlockIQ - Documents Tab
 * TASK-GAP7-UI-001: Documents Tab page and upload flow
 * Requirements: REQ-GAP7-DOCS-001 through REQ-GAP7-DOCS-005
 * Design Reference: FlockIQ_Gap_Remediation_Design_Master_v1.md §7
 * 
 * This component implements the document library per flock/farm with:
 * - Batch selector tabs (farm-level + per-batch)
 * - Storage quota bar (500MB limit with color-coded progress)
 * - Document categories (chick_invoice, feed_invoice, vaccination_cert, etc.)
 * - MagnifyingGlass functionality (name, tags, notes)
 * - Upload modal with drag-drop support
 * - Document management (download, rename, delete)
 * - Cross-tab attachment buttons (from TASK-GAP7-UI-002)
 * 
 * Integration: Integrated into FarmDetailTabs.tsx as "Docs" tab
 */

import { useState, useEffect } from 'react';
import { FileText, Upload, Folder, MagnifyingGlass } from '@phosphor-icons/react';
import { DocumentCategorySection } from '@/components/farms/docs/DocumentCategorySection';
import { UploadDocumentModal } from '@/components/farms/docs/UploadDocumentModal';

interface DocsTabProps {
  farmId: string;
  batchId?: string;
}

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

interface Batch {
  id: string;
  batch_number: number;
  placement_date: string;
  breed: string;
}

const VALID_DOC_TYPES = [
  'chick_invoice',
  'feed_invoice',
  'vaccination_cert',
  'medicine_bill',
  'movement_permit',
  'sale_invoice',
  'lab_report',
  'insurance',
  'batch_closure_report',
  'other',
];

export function DocsTab({ farmId, batchId }: DocsTabProps) {
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(batchId || null);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [totalDocCount, setTotalDocCount] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('other');
  const [searchQuery, setMagnifyingGlassQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
    fetchBatches();
  }, [farmId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/farms/${farmId}/documents`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents || {});
      setTotalDocCount(data.total_count || 0);

      // Calculate total storage used
      let totalBytes = 0;
      const docsArray = Object.values(data.documents || {}) as Document[][];
      docsArray.forEach((docs) => {
        docs.forEach((doc: Document) => {
          totalBytes += doc.file_size_bytes;
        });
      });
      setTotalStorageUsed(totalBytes);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch(`/api/farms/${farmId}/batches`);
      
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
    setIsUploadModalOpen(false);
  };

  const handleDocumentDownload = async (docId: string) => {
    try {
      const response = await fetch(`/api/farms/${farmId}/documents/${docId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get document');
      }

      const data = await response.json();
      
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  const handleDocumentPreview = (docId: string) => {
    // For now, just download. In future, could implement preview modal
    handleDocumentDownload(docId);
  };

  const handleDocumentRename = async (docId: string) => {
    const newName = prompt('Enter new document name:');
    if (!newName) return;

    try {
      const response = await fetch(`/api/farms/${farmId}/documents/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doc_name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename document');
      }

      fetchDocuments();
    } catch (err) {
      console.error('Error renaming document:', err);
      alert('Failed to rename document');
    }
  };

  const handleDocumentDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/farms/${farmId}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  const handleCategoryUpload = (category: string) => {
    setUploadCategory(category);
    setIsUploadModalOpen(true);
  };

  const getSlidersHorizontaledDocuments = () => {
    if (!searchQuery) {
      return documents;
    }

    const filtered: Record<string, Document[]> = {};
    Object.keys(documents).forEach((docType) => {
      const filteredDocs = documents[docType].filter((doc) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          doc.doc_name.toLowerCase().includes(searchLower) ||
          (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
          (doc.notes && doc.notes.toLowerCase().includes(searchLower))
        );
      });
      
      if (filteredDocs.length > 0) {
        filtered[docType] = filteredDocs;
      }
    });

    return filtered;
  };

  const getBatchSlidersHorizontaledDocuments = () => {
    const filteredDocs = getSlidersHorizontaledDocuments();
    
    if (!selectedBatchId) {
      // Show farm-level documents (batch_id is null)
      const farmLevelDocs: Record<string, Document[]> = {};
      Object.keys(filteredDocs).forEach((docType) => {
        farmLevelDocs[docType] = filteredDocs[docType].filter(doc => !doc.batch_id);
      });
      return farmLevelDocs;
    }

    // Show documents for selected batch
    const batchDocs: Record<string, Document[]> = {};
    Object.keys(filteredDocs).forEach((docType) => {
      batchDocs[docType] = filteredDocs[docType].filter(doc => doc.batch_id === selectedBatchId);
    });
    return batchDocs;
  };

  const formatStorageUsed = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1);
  };

  const getStoragePercentage = () => {
    const maxMB = 500;
    const usedMB = totalStorageUsed / (1024 * 1024);
    return Math.min((usedMB / maxMB) * 100, 100);
  };

  const getStorageColor = () => {
    const pct = getStoragePercentage();
    if (pct < 70) return 'bg-green-600';
    if (pct < 90) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const filteredDocuments = getBatchSlidersHorizontaledDocuments();

  return (
    <div className="space-y-6">
      {/* Storage Info Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText size={24} weight="regular" className="text-gray-600" />
              <span className="font-semibold text-gray-900">
                {totalDocCount} documents
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                {formatStorageUsed(totalStorageUsed)} MB used of 500 MB
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getStorageColor()}`}
                  style={{ width: `${getStoragePercentage()}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCategoryUpload('other')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Upload size={18} weight="regular" />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Batch Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedBatchId(null)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedBatchId === null
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Folder size={18} weight="regular" className="inline mr-2" />
          Farm-Level Docs
        </button>
        {batches.map((batch) => (
          <button
            key={batch.id}
            onClick={() => setSelectedBatchId(batch.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedBatchId === batch.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Batch #{batch.batch_number}
          </button>
        ))}
      </div>

      {/* MagnifyingGlass Bar */}
      <div className="relative">
        <MagnifyingGlass
          size={20}
          weight="regular"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="MagnifyingGlass documents by name, tags, or notes..."
          value={searchQuery}
          onChange={(e) => setMagnifyingGlassQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Document Categories */}
      <div className="space-y-4">
        {VALID_DOC_TYPES.map((docType) => {
          const docs = filteredDocuments[docType] || [];
          if (docs.length === 0 && !searchQuery) {
            return null; // Hide empty categories unless searching
          }
          return (
            <DocumentCategorySection
              key={docType}
              category={docType}
              documents={docs}
              onUpload={() => handleCategoryUpload(docType)}
              onDocumentDownload={handleDocumentDownload}
              onDocumentPreview={handleDocumentPreview}
              onDocumentRename={handleDocumentRename}
              onDocumentDelete={handleDocumentDelete}
            />
          );
        })}

        {Object.keys(filteredDocuments).every(key => filteredDocuments[key].length === 0) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <FileText size={48} weight="thin" className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'No documents match your search query.'
                : selectedBatchId
                ? 'No documents for this batch yet.'
                : 'No farm-level documents yet.'}
            </p>
            <button
              onClick={() => handleCategoryUpload('other')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Upload First Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        farmId={farmId}
        batchId={selectedBatchId}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
