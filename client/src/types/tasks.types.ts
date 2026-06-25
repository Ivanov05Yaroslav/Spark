export type UploadedLink = {
  url: string;
  name: string;
};

export interface TaskCreator {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
}

export interface TaskNusGroup {
  id: string;
  name: string;
}

export interface TaskCourseModule {
  id: string;
  title: string;
}

export interface TaskResponse {
  id: string;
  courseId: string;
  creatorId: string;
  nusGroupId: string | null;
  courseModuleId: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  createdAt: string;
  isHidden: boolean;
  attachments: string[];
  creator: TaskCreator;
  nusGroup: TaskNusGroup | null;
  courseModule: TaskCourseModule | null;
  classId?: string;
}
