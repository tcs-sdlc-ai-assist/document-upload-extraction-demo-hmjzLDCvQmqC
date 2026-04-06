import React, { useState } from 'react';
import type { ExtractedDocument } from '../types';
import { ExtractionStatus } from '../types';

interface DocumentCardProps {
  document: ExtractedDocument;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

function getFileTypeLabel(fileType: string): string {
  if (fileType === 'application/pdf') return 'PDF';
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
  if (fileType === 'text/plain') return 'TXT';
  return fileType.split('/').pop()?.toUpperCase() ?? 'Unknown';
}

function getFileTypeColor(fileType: string): string {
  if (fileType === 'application/pdf') return 'bg-red-100 text-red-700';
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'bg-blue-100 text-blue-700';
  if (fileType === 'text/plain') return 'bg-neutral-100 text-neutral-700';
  return 'bg-neutral-100 text-neutral-700';
}

function getStatusBadge(status: ExtractionStatus): { label: string; className: string } {
  switch (status) {
    case ExtractionStatus.COMPLETED:
      return { label: 'Completed', className: 'bg-accent-100 text-accent-700' };
    case ExtractionStatus.FAILED:
      return { label: 'Failed', className: 'bg-red-100 text-red-700' };
    case ExtractionStatus.PROCESSING:
      return { label: 'Processing', className: 'bg-yellow-100 text-yellow-700' };
    case ExtractionStatus.PENDING:
    default:
      return { label: 'Pending', className: 'bg-neutral-100 text-neutral-600' };
  }
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fileTypeLabel = getFileTypeLabel(document.fileType);
  const fileTypeColor = getFileTypeColor(document.fileType);
  const statusBadge = getStatusBadge(document.extractionStatus);
  const hasText = document.extractedText && document.extractedText.trim().length > 0;
  const previewText = hasText
    ? document.extractedText.trim().slice(0, 300)
    : null;
  const hasMore = hasText && document.extractedText.trim().length > 300;

  return (
    <div className="card p-5 flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* File icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* File info */}
          <div className="min-w-0">
            <h3
              className="text-sm font-semibold text-neutral-900 truncate"
              title={document.fileName}
            >
              {document.fileName}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${fileTypeColor}`}
              >
                {fileTypeLabel}
              </span>
              <span className="text-xs text-neutral-500">
                {formatFileSize(document.fileSize)}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500">
                {formatTimestamp(document.timestamp)}
              </span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* Error message */}
      {document.extractionStatus === ExtractionStatus.FAILED && document.errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-xs text-red-700">
            <span className="font-medium">Error: </span>
            {document.errorMessage}
          </p>
        </div>
      )}

      {/* Extracted text preview */}
      {hasText && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Extracted Text
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="btn-ghost text-xs px-2 py-1 h-auto"
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Collapse
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Expand
                </span>
              )}
            </button>
          </div>

          <div
            className={`rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'max-h-24'
            }`}
          >
            <p className="text-xs text-neutral-700 font-mono whitespace-pre-wrap break-words leading-relaxed scrollbar-thin overflow-y-auto">
              {isExpanded
                ? document.extractedText.trim()
                : previewText + (hasMore && !isExpanded ? '…' : '')}
            </p>
          </div>

          {!isExpanded && hasMore && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs text-brand-600 hover:text-brand-700 transition-colors self-start"
            >
              Show full text ({document.extractedText.trim().length.toLocaleString()} characters)
            </button>
          )}
        </div>
      )}

      {/* No text available */}
      {!hasText && document.extractionStatus === ExtractionStatus.COMPLETED && (
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2">
          <p className="text-xs text-neutral-500 italic">No text content extracted from this document.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;