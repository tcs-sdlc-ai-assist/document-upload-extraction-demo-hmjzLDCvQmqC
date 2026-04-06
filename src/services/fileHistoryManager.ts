import type { ExtractedDocument } from '../types';
import { getDocuments, clearDocuments } from './documentStorage';

export function getHistory(): ExtractedDocument[] {
  return getDocuments();
}

export function clearHistory(): void {
  clearDocuments();
}