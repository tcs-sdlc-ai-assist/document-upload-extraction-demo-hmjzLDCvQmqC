import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store, getHistory, removeDocument, clearHistory } from './documentStorage';
import { ExtractionStatus } from '../types';
import type { ExtractedDocument } from '../types';

// Mock storageUtils
vi.mock('../utils/storageUtils', () => {
  let storage: Record<string, unknown> = {};

  return {
    getItem: vi.fn(<T>(key: string): T | null => {
      const value = storage[key];
      return value !== undefined ? (value as T) : null;
    }),
    setItem: vi.fn(<T>(key: string, value: T): void => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string): void => {
      delete storage[key];
    }),
    clearAll: vi.fn((): void => {
      storage = {};
    }),
    __resetStorage: () => {
      storage = {};
    },
  };
});

import * as storageUtils from '../utils/storageUtils';

function makeDocument(overrides: Partial<ExtractedDocument> = {}): ExtractedDocument {
  return {
    id: 'test-id-1',
    fileName: 'test.pdf',
    fileType: 'application/pdf',
    fileSize: 1024,
    timestamp: new Date().toISOString(),
    extractedText: 'Hello world',
    extractionStatus: ExtractionStatus.COMPLETED,
    ...overrides,
  };
}

describe('documentStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the in-memory storage by calling the mock's reset helper
    const mod = storageUtils as unknown as { __resetStorage?: () => void };
    if (typeof mod.__resetStorage === 'function') {
      mod.__resetStorage();
    }
  });

  describe('getHistory()', () => {
    it('returns an empty array when no documents are stored', () => {
      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);

      const result = getHistory();

      expect(result).toEqual([]);
    });

    it('returns stored documents from localStorage', () => {
      const doc = makeDocument();
      vi.mocked(storageUtils.getItem).mockReturnValueOnce([doc]);

      const result = getHistory();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(doc);
    });

    it('returns all stored documents when multiple exist', () => {
      const doc1 = makeDocument({ id: 'id-1', fileName: 'file1.pdf' });
      const doc2 = makeDocument({ id: 'id-2', fileName: 'file2.txt' });
      vi.mocked(storageUtils.getItem).mockReturnValueOnce([doc1, doc2]);

      const result = getHistory();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('id-1');
      expect(result[1].id).toBe('id-2');
    });

    it('returns empty array when localStorage returns null (corrupted/missing data)', () => {
      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);

      const result = getHistory();

      expect(result).toEqual([]);
    });
  });

  describe('store()', () => {
    it('saves a document to localStorage', () => {
      const doc = makeDocument();
      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);

      store(doc);

      expect(storageUtils.setItem).toHaveBeenCalledOnce();
      const [, savedDocs] = vi.mocked(storageUtils.setItem).mock.calls[0];
      expect(savedDocs).toEqual([doc]);
    });

    it('prepends new document to existing history', () => {
      const existingDoc = makeDocument({ id: 'existing-id', fileName: 'existing.pdf' });
      const newDoc = makeDocument({ id: 'new-id', fileName: 'new.pdf' });

      vi.mocked(storageUtils.getItem).mockReturnValueOnce([existingDoc]);

      store(newDoc);

      const [, savedDocs] = vi.mocked(storageUtils.setItem).mock.calls[0];
      const docs = savedDocs as ExtractedDocument[];
      expect(docs).toHaveLength(2);
      expect(docs[0].id).toBe('new-id');
      expect(docs[1].id).toBe('existing-id');
    });

    it('accumulates multiple stored documents correctly', () => {
      const doc1 = makeDocument({ id: 'id-1', fileName: 'file1.pdf' });
      const doc2 = makeDocument({ id: 'id-2', fileName: 'file2.pdf' });
      const doc3 = makeDocument({ id: 'id-3', fileName: 'file3.pdf' });

      // First store: no existing docs
      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);
      store(doc1);

      // Second store: doc1 exists
      vi.mocked(storageUtils.getItem).mockReturnValueOnce([doc1]);
      store(doc2);

      // Third store: doc2, doc1 exist
      vi.mocked(storageUtils.getItem).mockReturnValueOnce([doc2, doc1]);
      store(doc3);

      const calls = vi.mocked(storageUtils.setItem).mock.calls;
      expect(calls).toHaveLength(3);

      const finalDocs = calls[2][1] as ExtractedDocument[];
      expect(finalDocs).toHaveLength(3);
      expect(finalDocs[0].id).toBe('id-3');
      expect(finalDocs[1].id).toBe('id-2');
      expect(finalDocs[2].id).toBe('id-1');
    });

    it('stores a document with FAILED status and errorMessage', () => {
      const failedDoc = makeDocument({
        id: 'failed-id',
        extractionStatus: ExtractionStatus.FAILED,
        errorMessage: 'Extraction failed due to corrupt file',
        extractedText: '',
      });

      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);

      store(failedDoc);

      const [, savedDocs] = vi.mocked(storageUtils.setItem).mock.calls[0];
      const docs = savedDocs as ExtractedDocument[];
      expect(docs[0].extractionStatus).toBe(ExtractionStatus.FAILED);
      expect(docs[0].errorMessage).toBe('Extraction failed due to corrupt file');
    });

    it('handles QuotaExceededError gracefully without throwing', () => {
      const doc = makeDocument();
      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);

      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      vi.mocked(storageUtils.setItem).mockImplementationOnce(() => {
        throw quotaError;
      });

      expect(() => store(doc)).not.toThrow();
    });

    it('handles generic errors gracefully without throwing', () => {
      const doc = makeDocument();
      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);

      vi.mocked(storageUtils.setItem).mockImplementationOnce(() => {
        throw new Error('Unexpected storage error');
      });

      expect(() => store(doc)).not.toThrow();
    });
  });

  describe('removeDocument()', () => {
    it('removes a document by id from localStorage', () => {
      const doc1 = makeDocument({ id: 'id-1' });
      const doc2 = makeDocument({ id: 'id-2' });

      vi.mocked(storageUtils.getItem).mockReturnValueOnce([doc1, doc2]);

      removeDocument('id-1');

      const [, savedDocs] = vi.mocked(storageUtils.setItem).mock.calls[0];
      const docs = savedDocs as ExtractedDocument[];
      expect(docs).toHaveLength(1);
      expect(docs[0].id).toBe('id-2');
    });

    it('does nothing when removing a non-existent id', () => {
      const doc = makeDocument({ id: 'id-1' });
      vi.mocked(storageUtils.getItem).mockReturnValueOnce([doc]);

      removeDocument('non-existent-id');

      const [, savedDocs] = vi.mocked(storageUtils.setItem).mock.calls[0];
      const docs = savedDocs as ExtractedDocument[];
      expect(docs).toHaveLength(1);
    });

    it('handles errors gracefully without throwing', () => {
      vi.mocked(storageUtils.getItem).mockReturnValueOnce(null);
      vi.mocked(storageUtils.setItem).mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => removeDocument('any-id')).not.toThrow();
    });
  });

  describe('clearHistory()', () => {
    it('clears all documents from localStorage', () => {
      clearHistory();

      expect(storageUtils.setItem).toHaveBeenCalledOnce();
      const [, savedDocs] = vi.mocked(storageUtils.setItem).mock.calls[0];
      expect(savedDocs).toEqual([]);
    });

    it('handles errors gracefully without throwing', () => {
      vi.mocked(storageUtils.setItem).mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => clearHistory()).not.toThrow();
    });
  });
});