import type { ExtractedDocument } from '../types';
import { getAllDocuments, deleteAllDocuments } from './documentStorage';

export function getHistory(): ExtractedDocument[] {
  return getAllDocuments();
}

export function clearHistory(): void {
  deleteAllDocuments();
}