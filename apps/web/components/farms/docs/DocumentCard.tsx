'use client';

import { useState } from 'react';
import { FileText, Download, Eye, Pencil, Trash, DotsThreeVertical } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

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

interface DocumentCardProps {
  document: Document;
  onDownload: () => void;
  onPreview: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function DocumentCard({ document, onDownload, onPreview, onRename, onDelete }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (document.file_ext === 'pdf') {
      return <FileText size={48} weight="thin" className="text-red-600" />;
    }
    if (['jpg', 'jpeg', 'png', 'heif', 'heic'].includes(document.file_ext)) {
      return (
        <Image
          src={document.download_url || ''}
          alt={`Document thumbnail: ${document.doc_name}`}
          width={48}
          height={48}
          className="w-12 h-12 object-cover rounded"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            (e.currentTarget.nextElementSibling as HTMLElement)?.style.removeProperty('display');
          }}
        />
      );
    }
    return <FileText size={48} weight="thin" className="text-gray-600" />;
  };

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Thumbnail or Icon */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-50 rounded">
          {getFileIcon()}
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate" title={document.doc_name}>
            {document.doc_name}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span className="uppercase">{document.file_ext}</span>
            <span>·</span>
            <span>{formatFileSize(document.file_size_bytes)}</span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
            </span>
          </div>
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  +{document.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="More options"
          >
            <DotsThreeVertical size={20} weight="regular" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onPreview();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye size={16} weight="regular" />
                  Preview
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDownload();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={16} weight="regular" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRename();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pencil size={16} weight="regular" />
                  Rename
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash size={16} weight="regular" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Eye size={14} weight="regular" />
          Preview
        </button>
        <button
          onClick={onDownload}
          className="flex-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Download size={14} weight="regular" />
          Download
        </button>
      </div>
    </div>
  );
}
