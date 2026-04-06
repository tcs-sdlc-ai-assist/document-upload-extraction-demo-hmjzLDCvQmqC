import React from 'react';
import { MainLayout } from '../components/MainLayout';
import { DocumentCard } from '../components/DocumentCard';
import { useDocumentHistory } from '../hooks/useDocumentHistory';

const HistoryPage: React.FC = () => {
  const { history: documents, clearHistory } = useDocumentHistory();
  const isLoading = false;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Document History</h1>
            <p className="text-sm text-neutral-500 mt-1">
              All previously uploaded and extracted documents
            </p>
          </div>
          {documents.length > 0 && (
            <button
              onClick={clearHistory}
              className="btn-secondary text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear History
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Loading history...</p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-neutral-700 mb-2">No documents yet</h2>
            <p className="text-sm text-neutral-500 max-w-sm">
              You haven&apos;t uploaded any documents yet. Head to the Upload page to get started.
            </p>
            <a
              href="/upload"
              className="btn-primary mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Upload a Document
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} found
            </p>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HistoryPage;