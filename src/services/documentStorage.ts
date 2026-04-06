import { LOCAL_STORAGE_KEYS } from '../constants';
import { getItem, setItem } from '../utils/storageUtils';
import type { ExtractedDocument } from '../types';

export function getHistory(): ExtractedDocument[] {
  const documents = getItem<ExtractedDocument[]>(LOCAL_STORAGE_KEYS.EXTRACTED_DOCUMENTS);
  return documents ?? [];
}

export function getAllDocuments(): ExtractedDocument[] {
  return getHistory();
}

export function store(doc: ExtractedDocument): void {
  try {
    const existing = getHistory();
    const updated = [doc, ...existing];
    setItem<ExtractedDocument[]>(LOCAL_STORAGE_KEYS.EXTRACTED_DOCUMENTS, updated);
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.error(
        '[DocumentStorage] localStorage quota exceeded. Could not store document:',
        doc.fileName,
      );
    } else {
      console.error('[DocumentStorage] Failed to store document:', error);
    }
  }
}

export function removeDocument(id: string): void {
  try {
    const existing = getHistory();
    const updated = existing.filter((doc) => doc.id !== id);
    setItem<ExtractedDocument[]>(LOCAL_STORAGE_KEYS.EXTRACTED_DOCUMENTS, updated);
  } catch (error) {
    console.error('[DocumentStorage] Failed to remove document:', error);
  }
}

export function clearHistory(): void {
  try {
    setItem<ExtractedDocument[]>(LOCAL_STORAGE_KEYS.EXTRACTED_DOCUMENTS, []);
  } catch (error) {
    console.error('[DocumentStorage] Failed to clear history:', error);
  }
}

export function deleteAllDocuments(): void {
  clearHistory();
}