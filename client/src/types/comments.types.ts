export interface CreateCommentPayload {
  content: string;
  taskId?: string;
  testId?: string;
  targetStudentId?: string;
}

export interface ApiCommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  avatarUrl: string | null;
  roles: string[];
}

export interface ApiComment {
  id: string;
  authorId: string;
  targetStudentId: string | null;
  content: string;
  createdAt: string;
  taskId: string | null;
  testId: string | null;
  author: ApiCommentAuthor;
}
