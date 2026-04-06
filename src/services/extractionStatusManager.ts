import { ExtractionStatus } from '../types';

const statusMap = new Map<string, ExtractionStatus>();

export function setStatus(id: string, status: ExtractionStatus): void {
  statusMap.set(id, status);
}

export function getStatus(id: string): ExtractionStatus {
  return statusMap.get(id) ?? ExtractionStatus.PENDING;
}