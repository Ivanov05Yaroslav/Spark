export type NotificationType =
  | 'WELCOME'
  | 'PARENT_LINKED'
  | 'SECURITY_ALERT'
  | 'SCHOOL_APPROVED'
  | 'COURSE'
  | 'COURSE_ENROLLED'
  | 'CO_TEACHER_ASSIGNED'
  | 'ANNOUNCEMENT'
  | 'MATERIAL'
  | 'MATERIAL_ADDED'
  | 'TASK'
  | 'TEST'
  | 'TEST_CREATED'
  | 'DEADLINE_CHANGED'
  | 'SUBMISSION_CREATED'
  | 'SUBMISSION'
  | 'GRADE'
  | 'DEADLINE'
  | 'OVERDUE'
  | 'OVERDUE_PARENT'
  | 'COMMENT'
  | 'NEW_COMPLAINT'
  | 'WARNING'
  | 'COMPLAINT';

export interface NotificationMetadata {
  parentId?: string | null;
  schoolId?: string | null;
  courseId?: string | null;
  announcementId?: string | null;
  materialId?: string | null;
  taskId?: string | null;
  testId?: string | null;
  submissionId?: string | null;
  studentId?: string | null;
  complaintId?: string | null;
  commentId?: string | null;
}

export interface NotificationSender {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface ApiNotification {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  metadata: NotificationMetadata;
  createdAt: string;
  sender: NotificationSender;
}

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiNotificationsResponse {
  data: ApiNotification[];
  meta: ApiMeta;
}
