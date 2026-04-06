import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { UploadState, ExtractedDocument } from '../types';
import { ExtractionStatus } from '../types';
import { validate } from '../utils/fileValidator';
import { extract } from '../services/documentExtractor';
import { store } from '../services/documentStorage';
import { setStatus } from '../services/extractionStatusManager';

const INITIAL_STATE: UploadState = {
  isUploading: false,
  isExtracting: false,
  progress: 0,
  status: null,
  error: null,
  result: null,
};

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>(INITIAL_STATE);

  const reset = useCallback(() => {
    setUploadState(INITIAL_STATE);
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<void> => {
    setUploadState({
      isUploading: true,
      isExtracting: false,
      progress: 0,
      status: ExtractionStatus.PENDING,
      error: null,
      result: null,
    });

    // Step 1: Validate
    const validationResult = validate(file);
    if (!validationResult.isValid) {
      setUploadState({
        isUploading: false,
        isExtracting: false,
        progress: 0,
        status: ExtractionStatus.FAILED,
        error: validationResult.error ?? 'File validation failed.',
        result: null,
      });
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      progress: 20,
    }));

    const docId = uuidv4();
    setStatus(docId, ExtractionStatus.PROCESSING);

    // Step 2: Extract
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      isExtracting: true,
      progress: 40,
      status: ExtractionStatus.PROCESSING,
    }));

    let extractedText = '';
    try {
      extractedText = await extract(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Text extraction failed.';
      setStatus(docId, ExtractionStatus.FAILED);
      setUploadState({
        isUploading: false,
        isExtracting: false,
        progress: 0,
        status: ExtractionStatus.FAILED,
        error: errorMessage,
        result: null,
      });
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      progress: 80,
    }));

    // Step 3: Store
    const doc: ExtractedDocument = {
      id: docId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      timestamp: new Date().toISOString(),
      extractedText,
      extractionStatus: ExtractionStatus.COMPLETED,
    };

    try {
      store(doc);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store document.';
      setStatus(docId, ExtractionStatus.FAILED);
      setUploadState({
        isUploading: false,
        isExtracting: false,
        progress: 0,
        status: ExtractionStatus.FAILED,
        error: errorMessage,
        result: null,
      });
      return;
    }

    setStatus(docId, ExtractionStatus.COMPLETED);

    setUploadState({
      isUploading: false,
      isExtracting: false,
      progress: 100,
      status: ExtractionStatus.COMPLETED,
      error: null,
      result: doc,
    });
  }, []);

  return {
    uploadState,
    uploadFile,
    reset,
  };
}