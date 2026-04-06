import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <span className="text-8xl font-bold text-brand-600">404</span>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-neutral-500 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back to {APP_NAME}.
        </p>
        <Link
          to="/dashboard"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;