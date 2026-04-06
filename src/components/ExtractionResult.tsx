src/components/ExtractionResult.tsx
import React from 'react';
import type { ExtractedDocument } from '../types';
import { ExtractionStatus } from '../types';

interface ExtractionResultProps {
  document: ExtractedDocument | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileType(fileType: string): string {
  if (fileType === 'application/pdf') return 'PDF';
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
  if (fileType === 'text/plain') return 'TXT';
  return fileType.split('/').pop()?.toUpperCase() ?? fileType;
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

function getStatusBadgeClasses(status: ExtractionStatus): string {
  switch (status) {
    case ExtractionStatus.COMPLETED:
      return 'bg-accent-100 text-accent-700 border border-accent-200';
    case ExtractionStatus.FAILED:
      return 'bg-red-100 text-red-700 border border-red-200';
    case ExtractionStatus.PROCESSING:
      return 'bg-brand-100 text-brand-700 border border-brand-200';
    case ExtractionStatus.PENDING:
    default:
      return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
  }
}

function getStatusLabel(status: ExtractionStatus): string {
  switch (status) {
    case ExtractionStatus.COMPLETED:
      return 'Completed';
    case ExtractionStatus.FAILED:
      return 'Failed';
    case ExtractionStatus.PROCESSING:
      return 'Processing';
    case ExtractionStatus.PENDING:
    default:
      return 'Pending';
  }
}

export const ExtractionResult: React.FC<ExtractionResultProps> = ({ document }) => {
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-neutral-500 text-sm font-medium">No document extracted yet</p>
        <p className="text-neutral-400 text-xs mt-1">Upload a file to see the extracted text here</p>
      </div>
    );
  }

  const wordCount = document.extractedText
    ? document.extractedText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const charCount = document.extractedText ? document.extractedText.length : 0;

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
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
            <div className="min-w-0">
              <h2
                className="text-sm font-semibold text-neutral-900 truncate"
                title={document.fileName}
              >
                {document.fileName}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {formatTimestamp(document.timestamp)}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadgeClasses(document.extractionStatus as ExtractionStatus)}`}
          >
            {getStatusLabel(document.extractionStatus as ExtractionStatus)}
          </span>
        </div>

        {/* Metadata row */}
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <svg
              className="w-3.5 h-3.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium text-neutral-700">{formatFileType(document.fileType)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <svg
              className="w-3.5 h-3.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
            <span>{formatFileSize(document.fileSize)}</span>
          </div>
          {document.extractionStatus === ExtractionStatus.COMPLETED && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <svg
                  className="w-3.5 h-3.5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <span>{wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <svg
                  className="w-3.5 h-3.5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>{charCount.toLocaleString()} chars</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {document.extractionStatus === ExtractionStatus.FAILED && document.errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Extraction Failed</p>
              <p className="text-sm text-red-700 mt-1">{document.errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted text */}
      {document.extractionStatus === ExtractionStatus.COMPLETED && document.extractedText && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
            <h3 className="text-sm font-medium text-neutral-700">Extracted Text</h3>
            <button
              type="button"
              className="btn-ghost text-xs px-2 py-1"
              onClick={() => {
                void navigator.clipboard.writeText(document.extractedText);
              }}
              title="Copy to clipboard"
            >
              <svg
                className="w-4 h-4 mr-1.5 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin">
            <pre className="text-sm text-neutral-800 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {document.extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Empty text state */}
      {document.extractionStatus === ExtractionStatus.COMPLETED && !document.extractedText && (
        <div className="card p-6 text-center">
          <svg
            className="w-10 h-10 text-neutral-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm text-neutral-500">No text could be extracted from this document.</p>
        </div>
      )}
    </div>
  );
};

export default ExtractionResult;