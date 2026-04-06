import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useDocumentHistory } from '../hooks/useDocumentHistory';
import { ExtractedDocument } from '../types';

const UploadIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const HistoryIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DocumentIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CalendarIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

function formatDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { history } = useDocumentHistory();

  const documents = history;

  const totalUploads = documents.length;
  const lastUpload =
    documents.length > 0
      ? documents.reduce((latest: ExtractedDocument, doc: ExtractedDocument) =>
          new Date(doc.timestamp) > new Date(latest.timestamp) ? doc : latest
        )
      : null;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Here's an overview of your document extraction activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="card p-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <DocumentIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Uploads</p>
              <p className="text-3xl font-semibold text-neutral-900 mt-0.5">
                {totalUploads}
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Last Upload</p>
              <p className="text-base font-semibold text-neutral-900 mt-0.5">
                {lastUpload ? formatDate(lastUpload.timestamp) : 'No uploads yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-neutral-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="btn-primary flex items-center gap-2 px-5 py-2.5"
            >
              <UploadIcon />
              Upload Document
            </button>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="btn-secondary flex items-center gap-2 px-5 py-2.5"
            >
              <HistoryIcon />
              View History
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {documents.length > 0 && (
          <div className="mt-6 card p-6">
            <h2 className="text-base font-semibold text-neutral-800 mb-4">
              Recent Activity
            </h2>
            <ul className="divide-y divide-neutral-100">
              {documents.slice(0, 5).map((doc: ExtractedDocument) => (
                <li
                  key={doc.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-700 truncate">
                      {doc.fileName}
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-xs text-neutral-400">
                    {formatDate(doc.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
            {documents.length > 5 && (
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="mt-3 text-sm text-brand-600 hover:text-brand-700 transition-colors font-medium"
              >
                View all {documents.length} documents →
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="mt-6 card p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-neutral-800 mb-1">
              No documents yet
            </h3>
            <p className="text-sm text-neutral-500 mb-5 max-w-xs">
              Upload your first PDF, DOCX, or TXT file to get started with text
              extraction.
            </p>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="btn-primary flex items-center gap-2"
            >
              <UploadIcon />
              Upload your first document
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;