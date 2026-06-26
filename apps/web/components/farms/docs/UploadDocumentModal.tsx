'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, Warning } from '@phosphor-icons/react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  batchId?: string | null;
  onUploadSuccess: () => void;
  initialDocType?: string;
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

const DOC_TYPE_LABELS: Record<string, string> = {
  chick_invoice: 'Chick Purchase Invoice',
  feed_invoice: 'Feed Purchase Invoice',
  vaccination_cert: 'Vaccination Certificate',
  medicine_bill: 'Medicine Bill',
  movement_permit: 'Movement Permit',
  sale_invoice: 'Sale Invoice',
  lab_report: 'Lab Report',
  insurance: 'Insurance Document',
  batch_closure_report: 'Batch Closure Report',
  other: 'Other',
};

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heif', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadDocumentModal({
  isOpen,
  onClose,
  farmId,
  batchId,
  onUploadSuccess,
  initialDocType,
}: UploadDocumentModalProps) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState(initialDocType || 'other');
  const [documentDate, setDocumentDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const validateAndSetFile = (file: File) => {
    setError('');
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('File must be PDF, JPG, PNG, or HEIF');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File must be under 10MB');
      return;
    }
    
    setSelectedFile(file);
    setDocName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    setStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('doc_name', docName);
    formData.append('doc_type', docType);
    formData.append('farm_id', farmId);
    if (batchId) {
      formData.append('batch_id', batchId);
    }
    if (documentDate) {
      formData.append('document_date', documentDate);
    }
    if (tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    if (notes) {
      formData.append('notes', notes);
    }

    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        setUploadSuccess(true);
        setIsUploading(false);
        onUploadSuccess();
      } else {
        setError('Upload failed. Please try again.');
        setIsUploading(false);
      }
    });

    xhr.addEventListener('error', () => {
      setError('Upload failed. Please check your connection.');
      setIsUploading(false);
    });

    try {
      xhr.open('POST', `/api/farms/${farmId}/documents`);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('supabase-auth-token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedFile(null);
    setDocName('');
    setDocType(initialDocType || 'other');
    setDocumentDate('');
    setTags([]);
    setNotes('');
    setError('');
    setUploadProgress(0);
    setIsUploading(false);
    setUploadSuccess(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    handleReset();
    onClose();
  };

  const handleUploadAnother = () => {
    handleReset();
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {uploadSuccess ? 'Document Uploaded' : 'Upload Document'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {uploadSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle size={64} weight="fill" className="text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Document Saved Successfully
              </h3>
              <p className="text-gray-600 mb-6">
                {docName} has been uploaded and saved to your document library.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleUploadAnother}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Upload Another
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: File Selection */
            <div>
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload size={48} weight="regular" className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  Drag PDF, JPG, or PNG here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Accepted: PDF, JPG, PNG, HEIF (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.heif,.heic"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <Warning size={20} weight="regular" className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Document Details */
            <div>
              {/* File Preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded mb-4">
                <FileText size={32} weight="thin" className="text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{selectedFile?.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile?.size || 0) / 1024 / 1024 < 1
                      ? `${(selectedFile?.size || 0) / 1024} KB`
                      : `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Change
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter document name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {VALID_DOC_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {DOC_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Date
                  </label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Optional notes (max 200 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{notes.length}/200</p>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Uploading...</span>
                    <span className="text-sm font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <Warning size={20} weight="regular" className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!uploadSuccess && (
          <div className="flex justify-end gap-3 p-4 border-t">
            {step === 1 ? (
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  disabled={isUploading}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!docName || isUploading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
