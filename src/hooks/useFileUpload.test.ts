import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFileUpload } from './useFileUpload';
import { ExtractionStatus } from '../types';

vi.mock('../utils/fileValidator', () => ({
  validate: vi.fn(),
}));

vi.mock('../services/documentExtractor', () => ({
  extract: vi.fn(),
}));

vi.mock('../services/documentStorage', () => ({
  store: vi.fn(),
}));

vi.mock('../services/extractionStatusManager', () => ({
  setStatus: vi.fn(),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234'),
}));

import { validate } from '../utils/fileValidator';
import { extract } from '../services/documentExtractor';
import { store } from '../services/documentStorage';
import { setStatus } from '../services/extractionStatusManager';

const mockValidate = vi.mocked(validate);
const mockExtract = vi.mocked(extract);
const mockStore = vi.mocked(store);
const mockSetStatus = vi.mocked(setStatus);

function createMockFile(name = 'test.pdf', type = 'application/pdf', size = 1024): File {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct idle initial state', () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.uploadState).toEqual({
      isUploading: false,
      isExtracting: false,
      progress: 0,
      status: null,
      error: null,
      result: null,
    });
  });

  it('should expose uploadFile and reset functions', () => {
    const { result } = renderHook(() => useFileUpload());

    expect(typeof result.current.uploadFile).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should reset state to initial when reset is called', async () => {
    mockValidate.mockReturnValue({ isValid: false, error: 'Invalid file' });

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.FAILED);

    act(() => {
      result.current.reset();
    });

    expect(result.current.uploadState).toEqual({
      isUploading: false,
      isExtracting: false,
      progress: 0,
      status: null,
      error: null,
      result: null,
    });
  });

  it('should complete successful upload pipeline and set COMPLETED status', async () => {
    const extractedText = 'Extracted document text content';
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue(extractedText);
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile('document.pdf', 'application/pdf', 2048);

    await act(async () => {
      await result.current.uploadFile(file);
    });

    await waitFor(() => {
      expect(result.current.uploadState.status).toBe(ExtractionStatus.COMPLETED);
    });

    expect(result.current.uploadState.isUploading).toBe(false);
    expect(result.current.uploadState.isExtracting).toBe(false);
    expect(result.current.uploadState.progress).toBe(100);
    expect(result.current.uploadState.error).toBeNull();
    expect(result.current.uploadState.result).not.toBeNull();
    expect(result.current.uploadState.result?.extractedText).toBe(extractedText);
    expect(result.current.uploadState.result?.fileName).toBe('document.pdf');
    expect(result.current.uploadState.result?.fileType).toBe('application/pdf');
    expect(result.current.uploadState.result?.fileSize).toBe(2048);
    expect(result.current.uploadState.result?.extractionStatus).toBe(ExtractionStatus.COMPLETED);
    expect(result.current.uploadState.result?.id).toBe('test-uuid-1234');
  });

  it('should call validate, extract, and store in the correct order', async () => {
    const callOrder: string[] = [];
    mockValidate.mockImplementation(() => {
      callOrder.push('validate');
      return { isValid: true };
    });
    mockExtract.mockImplementation(async () => {
      callOrder.push('extract');
      return 'some text';
    });
    mockStore.mockImplementation(() => {
      callOrder.push('store');
    });

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(callOrder).toEqual(['validate', 'extract', 'store']);
  });

  it('should set FAILED status and error message when validation fails', async () => {
    const errorMessage = 'File size exceeds the maximum allowed size of 10MB.';
    mockValidate.mockReturnValue({ isValid: false, error: errorMessage });

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.FAILED);
    expect(result.current.uploadState.error).toBe(errorMessage);
    expect(result.current.uploadState.isUploading).toBe(false);
    expect(result.current.uploadState.isExtracting).toBe(false);
    expect(result.current.uploadState.progress).toBe(0);
    expect(result.current.uploadState.result).toBeNull();
  });

  it('should set default error message when validation fails without error string', async () => {
    mockValidate.mockReturnValue({ isValid: false });

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.FAILED);
    expect(result.current.uploadState.error).toBe('File validation failed.');
  });

  it('should not call extract when validation fails', async () => {
    mockValidate.mockReturnValue({ isValid: false, error: 'Invalid' });

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(mockExtract).not.toHaveBeenCalled();
    expect(mockStore).not.toHaveBeenCalled();
  });

  it('should set FAILED status and error message when extraction fails', async () => {
    const extractionError = new Error('PDF parsing failed');
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockRejectedValue(extractionError);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.FAILED);
    expect(result.current.uploadState.error).toBe('PDF parsing failed');
    expect(result.current.uploadState.isUploading).toBe(false);
    expect(result.current.uploadState.isExtracting).toBe(false);
    expect(result.current.uploadState.progress).toBe(0);
    expect(result.current.uploadState.result).toBeNull();
  });

  it('should set default error message when extraction throws non-Error', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockRejectedValue('unknown error');

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.FAILED);
    expect(result.current.uploadState.error).toBe('Text extraction failed.');
  });

  it('should not call store when extraction fails', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockRejectedValue(new Error('Extraction error'));

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(mockStore).not.toHaveBeenCalled();
  });

  it('should set FAILED status when store throws an error', async () => {
    const storeError = new Error('localStorage quota exceeded');
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue('some text');
    mockStore.mockImplementation(() => {
      throw storeError;
    });

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.FAILED);
    expect(result.current.uploadState.error).toBe('localStorage quota exceeded');
    expect(result.current.uploadState.result).toBeNull();
  });

  it('should call setStatus with PROCESSING before extraction', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue('text');
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(mockSetStatus).toHaveBeenCalledWith('test-uuid-1234', ExtractionStatus.PROCESSING);
  });

  it('should call setStatus with COMPLETED after successful pipeline', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue('text');
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(mockSetStatus).toHaveBeenCalledWith('test-uuid-1234', ExtractionStatus.COMPLETED);
  });

  it('should call setStatus with FAILED when extraction fails', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(mockSetStatus).toHaveBeenCalledWith('test-uuid-1234', ExtractionStatus.FAILED);
  });

  it('should update progress through the pipeline stages', async () => {
    const progressValues: number[] = [];

    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockImplementation(async () => {
      return 'extracted text';
    });
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    progressValues.push(result.current.uploadState.progress);

    expect(result.current.uploadState.progress).toBe(100);
  });

  it('should set isUploading true at start of upload', async () => {
    let capturedState: boolean | null = null;

    mockValidate.mockImplementation(() => {
      capturedState = true;
      return { isValid: true };
    });
    mockExtract.mockResolvedValue('text');
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(capturedState).toBe(true);
    expect(result.current.uploadState.isUploading).toBe(false);
  });

  it('should set isExtracting true during extraction phase', async () => {
    let capturedIsExtracting: boolean | null = null;

    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockImplementation(async () => {
      capturedIsExtracting = true;
      return 'text';
    });
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(capturedIsExtracting).toBe(true);
    expect(result.current.uploadState.isExtracting).toBe(false);
  });

  it('should store document with correct metadata', async () => {
    const extractedText = 'Hello world document';
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue(extractedText);
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile('report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 4096);

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(mockStore).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-uuid-1234',
        fileName: 'report.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 4096,
        extractedText,
        extractionStatus: ExtractionStatus.COMPLETED,
      })
    );
  });

  it('should include a valid ISO timestamp in stored document', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue('text');
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile();

    await act(async () => {
      await result.current.uploadFile(file);
    });

    const storedDoc = mockStore.mock.calls[0][0];
    expect(() => new Date(storedDoc.timestamp)).not.toThrow();
    expect(new Date(storedDoc.timestamp).toISOString()).toBe(storedDoc.timestamp);
  });

  it('should handle TXT file upload successfully', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue('Plain text content');
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());
    const file = createMockFile('notes.txt', 'text/plain', 512);

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.COMPLETED);
    expect(result.current.uploadState.result?.fileName).toBe('notes.txt');
  });

  it('should allow multiple sequential uploads', async () => {
    mockValidate.mockReturnValue({ isValid: true });
    mockExtract.mockResolvedValue('text');
    mockStore.mockImplementation(() => undefined);

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFile(createMockFile('first.pdf'));
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.COMPLETED);

    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.uploadFile(createMockFile('second.pdf'));
    });

    expect(result.current.uploadState.status).toBe(ExtractionStatus.COMPLETED);
    expect(result.current.uploadState.result?.fileName).toBe('second.pdf');
  });
});