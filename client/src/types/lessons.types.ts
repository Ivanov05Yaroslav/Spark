import { TaskCourseModule, TaskCreator, TaskNusGroup } from '@/types/tasks.types.ts';

export interface LessonResponse {
  id: string;
  courseId: string;
  creatorId: string;
  nusGroupId: string | null;
  courseModuleId: string | null;
  title: string;
  description: string | null;
  date: string | null;
  createdAt: string;
  isHidden: boolean;
  attachments: string[];
  creator: TaskCreator;
  nusGroup: TaskNusGroup | null;
  courseModule: TaskCourseModule | null;
  classId?: string;
}
