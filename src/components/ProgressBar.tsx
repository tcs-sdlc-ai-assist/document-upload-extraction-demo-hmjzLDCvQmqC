import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          <span className="text-sm font-medium text-neutral-500">{clampedProgress}%</span>
        </div>
      )}
      {!label && (
        <div className="flex justify-end mb-1">
          <span className="text-sm font-medium text-neutral-500">{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 rounded-full bg-brand-600 transition-all duration-300 ease-in-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;