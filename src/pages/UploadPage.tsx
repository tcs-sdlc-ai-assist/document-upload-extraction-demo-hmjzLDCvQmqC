Looking at the error:

```
src/pages/UploadPage.tsx(11,11): error TS2339: Property 'state' does not exist on type '{ uploadState: UploadState; uploadFile: (file: File) => Promise<void>; reset: () => void; }'.
```

The `useFileUpload` hook returns `uploadState` not `state`. I need to update the destructuring accordingly.

import React from 'react';
import { MainLayout } from '../components/MainLayout';
import { UploadArea } from '../components/UploadArea';
import { ProgressBar } from '../components/ProgressBar';
import { StatusMessage } from '../components/StatusMessage';
import { ExtractionResult } from '../components/ExtractionResult';
import { useFileUpload } from '../hooks/useFileUpload';
import { ExtractionStatus } from '../types';

export const UploadPage: React.FC = () => {
  const { uploadState, uploadFile, reset } = useFileUpload();

  const { isUploading, isExtracting, progress, status, error, result } = uploadState;

  const isProcessing = isUploading || isExtracting;

  function getProgressLabel(): string {
    if (isUploading) return 'Uploading file...';
    if (isExtracting) return 'Extracting text...';
    return '';
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Upload Document</h1>
          <p className="text-sm text-neutral-500">
            Upload a PDF, DOCX, or TXT file to extract its text content. Maximum file size is 10MB.
          </p>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <UploadArea onFileSelected={uploadFile} disabled={isProcessing} />
          </div>

          {isProcessing && (
            <div className="card p-6 animate-fade-in">
              <ProgressBar progress={progress} label={getProgressLabel()} />
            </div>
          )}

          {error && !isProcessing && (
            <div className="animate-fade-in">
              <StatusMessage
                type="error"
                message={error}
                onDismiss={reset}
              />
            </div>
          )}

          {status === ExtractionStatus.COMPLETED && result && !isProcessing && (
            <div className="animate-fade-in">
              <StatusMessage
                type="success"
                message="Text extraction completed successfully."
              />
            </div>
          )}

          {result && !isProcessing && (
            <div className="animate-slide-up">
              <ExtractionResult document={result} />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={reset}
                  className="btn-secondary"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}

          {!isProcessing && !result && !error && (
            <div className="card p-6">
              <h2 className="text-sm font-medium text-neutral-700 mb-3">Supported File Types</h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="inline-flex items-center justify-center w-10 h-6 rounded text-xs font-semibold bg-red-100 text-red-700">
                    PDF
                  </span>
                  <span>Adobe PDF documents (.pdf)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="inline-flex items-center justify-center w-10 h-6 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                    DOCX
                  </span>
                  <span>Microsoft Word documents (.docx)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="inline-flex items-center justify-center w-10 h-6 rounded text-xs font-semibold bg-neutral-100 text-neutral-700">
                    TXT
                  </span>
                  <span>Plain text files (.txt)</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UploadPage;