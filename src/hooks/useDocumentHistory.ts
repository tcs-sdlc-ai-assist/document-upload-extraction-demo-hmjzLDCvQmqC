import { useState, useEffect, useCallback } from 'react';
import type { ExtractedDocument } from '../types';
import { getHistory, clearHistory as clearHistoryFromStorage } from '../services/documentStorage';
import { store } from '../services/documentStorage';

export function useDocumentHistory() {
  const [history, setHistory] = useState<ExtractedDocument[]>([]);

  const refreshHistory = useCallback(() => {
    const docs = getHistory();
    setHistory(docs);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const addDocument = useCallback((doc: ExtractedDocument) => {
    store(doc);
    setHistory(getHistory());
  }, []);

  const clearHistory = useCallback(() => {
    clearHistoryFromStorage();
    setHistory([]);
  }, []);

  return {
    history,
    addDocument,
    clearHistory,
    refreshHistory,
  };
}