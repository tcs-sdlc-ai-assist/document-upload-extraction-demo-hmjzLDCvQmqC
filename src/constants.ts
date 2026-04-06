export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Doc Upload Extraction';

export const MAX_FILE_SIZE_BYTES = (Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;

export const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export const LOCAL_STORAGE_KEYS = {
  AUTH_USERS: 'doc_upload_auth_users',
  AUTH_SESSION: 'doc_upload_auth_session',
  EXTRACTED_DOCUMENTS: 'doc_upload_extracted_documents',
} as const;