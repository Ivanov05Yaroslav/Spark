import { apiClient } from './apiClient';
import { LessonResponse } from '@/types/lessons.types.ts';

export const lessonsService = {
  getLessonById: async (lessonId: string): Promise<LessonResponse> => {
    const response = await apiClient.get<LessonResponse>(`/lessons/${lessonId}`);
    return response.data;
  },

  createLesson: async (formData: FormData) => {
    const response = await apiClient.post(`/lessons`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateLesson: async (lessonId: string, formData: FormData) => {
    const response = await apiClient.patch(`/lessons/${lessonId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteLesson: async (lessonId: string): Promise<void> => {
    await apiClient.delete(`/lessons/${lessonId}`);
  },
};
