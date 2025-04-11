
export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  category: string;
  visibleTo: string[]; // userIds
  companyId?: string | null; // Added company ID
  comments?: DocumentComment[];
  reviewed?: boolean;
  version?: number;
  versionHistory?: DocumentVersion[];
  tags?: string[];
  metadata?: Record<string, any> | null | string | number | boolean;
  annotations?: DocumentAnnotation[];
  lastViewedAt?: Date;
}

export interface DocumentComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  changes: string;
  size: number;
}

export interface DocumentAnnotation {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  content: string;
  position: {
    x: number;
    y: number;
    page?: number;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  activity: 'upload' | 'download' | 'view' | 'update' | 'delete' | 'comment' | 'annotate' | 'version';
  details?: string;
  timestamp: Date;
}

export const FILE_PREVIEW_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'text/plain',
  'text/markdown',
  'text/csv',
];
