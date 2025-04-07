
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
  comments?: DocumentComment[];
  reviewed?: boolean;
}

export interface DocumentComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}
