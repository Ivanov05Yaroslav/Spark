import { apiClient } from '@/api/apiClient';
import {
  ClassDto,
  CourseDetailDto,
  CourseDetailResponseDto,
  CourseItemDto,
  CourseResponseDto,
  StudentDto,
  SubjectDto,
  TeacherDto,
} from '@/types/courses.types';
import { ModuleDto } from '@/types/modules.types.ts';

export const courseService = {
  getMySubjects: () => apiClient.get<SubjectDto[]>('/subjects/my').then((res) => res.data),

  getClasses: () => apiClient.get<ClassDto[]>('/classes').then((res) => res.data),

  getCoTeachers: (subjectId: string) =>
    apiClient.get<TeacherDto[]>(`/users/teachers/by-subject/${subjectId}`).then((res) => res.data),

  getStudents: (classId: string) =>
    apiClient.get<StudentDto[]>(`/classes/${classId}/students`).then((res) => res.data),

  createCourse: (data: FormData | any) =>
    apiClient
      .post<CourseResponseDto>('/courses', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  getCourses: (params?: any) =>
    apiClient.get<CourseItemDto[]>('/courses', { params }).then((res) => res.data),

  getCourseById: (courseId: string) =>
    apiClient.get<CourseDetailResponseDto>(`/courses/${courseId}`).then((res) => res.data),

  updateCourse: (courseId: string, data: FormData | any) =>
    apiClient
      .put<CourseResponseDto>(`/courses/${courseId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  deleteCourse: (id: string) => apiClient.delete(`/courses/${id}`).then((res) => res.data),

  getModulesByCourseId: (courseId: string) =>
    apiClient.get<ModuleDto[]>(`/courses/${courseId}/modules`).then((res) => res.data),

  updateVideoLinks: (courseId: string, videoLinks: string[]) =>
    apiClient.patch(`/courses/${courseId}/video-links`, { videoLinks }).then((res) => res.data),

  updateModule: (moduleId: string, title: string) =>
    apiClient.put(`/courses/modules/${moduleId}`, { title }).then((res) => res.data),

  deleteModule: (moduleId: string) =>
    apiClient.delete(`/courses/modules/${moduleId}`).then((res) => res.data),
};
