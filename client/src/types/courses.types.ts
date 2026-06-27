export interface ThemeColor {
  value: string;
  base: string;
}

export interface SubjectDto {
  id: string;
  name: string;
}

export interface ClassDto {
  id: string;
  name: string;
}

export interface TeacherDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface StudentDto {
  id: string;
  firstName: string;
  lastName: string;
  groupName?: string;
}

export interface CourseResponseDto {
  subjectId: string;
  message: string;
}

export interface HomeroomTeacherDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface CourseClassDto {
  id: string;
  schoolId: string;
  homeroomTeacherId: string;
  name: string;
  homeroomTeacher: HomeroomTeacherDto;
}

export interface CourseItemDto {
  id: string;
  schoolId: string;
  subjectId: string;
  classId: string;
  creatorId: string;
  startDate: string;
  endDate: string;
  groupName: string | null;
  isArchived: boolean;
  isHidden: boolean;
  backgroundUrl: string;
  themeColor: string;
  subject: SubjectDto;
  class: CourseClassDto;
  _count: {
    students: number;
  };
}

export interface UserBasicDto {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  avatarUrl?: string | null;
  email?: string;
}

export interface CourseDetailDto extends Omit<CourseItemDto, 'class' | 'creator' | 'subject'> {
  subject: SubjectDto;
  class: {
    id: string;
    name: string;
  };
  creator: UserBasicDto;
  coTeachers: UserBasicDto[];
  students: UserBasicDto[];
}

export interface CourseUserDto {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  avatarUrl?: string;
  email?: string;
}

export interface CourseDetailResponseDto {
  id: string;
  subject: { id: string; name: string };
  class: { id: string; name: string };
  startDate: string;
  endDate: string;
  groupName: string | null;
  videoLinks: any[];
  themeColor: string;
  backgroundUrl: string | null;
  participants: {
    creator: CourseUserDto;
    coTeachers: CourseUserDto[];
    homeroomTeacher: CourseUserDto;
    students: CourseUserDto[];
    totalStudentsCount: number;
  };
  modules: {
    id: string;
    title: string;
    createdAt: string;
    materials: { id: string; title: string; fileUrl: string | null; linkUrl: string | null }[];
    tasks: { id: string; title: string; deadline: string }[];
    tests: { id: string; title: string; deadline: string }[];
  }[];
  upcomingDeadlines: any[];
  announcements: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    isNew: boolean;
    creator: CourseUserDto;
  }[];
  unreadAnnouncementsCount: number;
}
