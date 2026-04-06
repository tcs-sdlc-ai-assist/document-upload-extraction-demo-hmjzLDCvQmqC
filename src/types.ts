export enum ExtractionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SupportedFileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TXT = 'text/plain',
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface ExtractedDocument {
  id: string;
  fileName: string;
  fileType: SupportedFileType | string;
  fileSize: number;
  timestamp: string;
  extractedText: string;
  extractionStatus: ExtractionStatus;
  errorMessage?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface UploadState {
  isUploading: boolean;
  isExtracting: boolean;
  progress: number;
  status: ExtractionStatus | null;
  error: string | null;
  result: ExtractedDocument | null;
}