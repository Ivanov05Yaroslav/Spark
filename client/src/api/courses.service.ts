import { apiClient } from '@/api/apiClient';
import {
    SubjectDto,
    ClassDto,
    TeacherDto,
    StudentDto,
    CourseResponseDto,
    CourseItemDto,
    CourseDetailDto
} from '@/types/courses.types';

export const courseService = {
    getMySubjects: () => apiClient.get<SubjectDto[]>('/subjects/my').then(res => res.data),

    getClasses: () => apiClient.get<ClassDto[]>('/classes').then(res => res.data),

    getCoTeachers: (subjectId: string) =>
        apiClient.get<TeacherDto[]>(`/users/teachers/by-subject/${subjectId}`).then(res => res.data),

    getStudents: (classId: string) =>
        apiClient.get<StudentDto[]>(`/classes/${classId}/students`).then(res => res.data),

    createCourse: (data: FormData | any) =>
        apiClient.post<CourseResponseDto>('/courses', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data),

    getTeacherCourses: () =>
        apiClient.get<CourseItemDto[]>('/courses/teacher').then(res => res.data),

    getStudentCourses: () =>
        apiClient.get<CourseItemDto[]>('/courses/student').then(res => res.data),

    getAllCourses: () =>
        apiClient.get<CourseItemDto[]>('/courses/all').then(res => res.data),

    getCourseById: (courseId: string) =>
        apiClient.get<CourseDetailDto>(`/courses/${courseId}`).then(res => res.data),

    updateCourse: (courseId: string, data: FormData | any) =>
        apiClient.put<CourseResponseDto>(`/courses/${courseId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data),
};