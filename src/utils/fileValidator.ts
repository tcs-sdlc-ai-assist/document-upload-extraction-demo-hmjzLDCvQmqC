import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES } from '../constants';
import type { FileValidationResult } from '../types';

export function validate(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds the maximum allowed size of ${maxMb}MB.`,
    };
  }

  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
    };
  }

  return { isValid: true };
}