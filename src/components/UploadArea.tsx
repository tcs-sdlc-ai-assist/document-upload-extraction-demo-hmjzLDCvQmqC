import React, { useState, useRef, useCallback } from 'react';

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelected, disabled = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
  }, [disabled, onFileSelected]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
    // Reset input so the same file can be re-selected
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFileSelected]);

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      if (inputRef.current) {
        inputRef.current.click();
      }
    }
  }, [disabled]);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload area. Click or drag and drop a file here."
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'relative flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer select-none',
        'px-6 py-12 text-center',
        isDragActive
          ? 'border-brand-500 bg-brand-50'
          : 'border-neutral-300 bg-white hover:border-brand-400 hover:bg-neutral-50',
        disabled
          ? 'opacity-50 cursor-not-allowed pointer-events-none'
          : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Upload icon */}
      <div
        className={[
          'mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors',
          isDragActive ? 'bg-brand-100' : 'bg-neutral-100',
        ].join(' ')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={[
            'h-7 w-7 transition-colors',
            isDragActive ? 'text-brand-600' : 'text-neutral-400',
          ].join(' ')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>

      {/* Text content */}
      <div className="space-y-1">
        {isDragActive ? (
          <p className="text-base font-semibold text-brand-600">Drop your file here</p>
        ) : (
          <>
            <p className="text-base font-semibold text-neutral-700">
              Drag &amp; drop your file here
            </p>
            <p className="text-sm text-neutral-500">
              or{' '}
              <span className="font-medium text-brand-600 hover:text-brand-700 transition-colors">
                browse to upload
              </span>
            </p>
          </>
        )}
      </div>

      {/* Supported formats */}
      <p className="mt-4 text-xs text-neutral-400">
        Supported formats: PDF, DOCX, TXT &mdash; Max size: 10MB
      </p>
    </div>
  );
};

export default UploadArea;