import { apiClient } from './apiClient';
import { LessonResponse } from '@/types/lessons.types.ts';

export const lessonsService = {
  getLessonById: async (lessonId: string): Promise<LessonResponse> => {
    const response = await apiClient.get<LessonResponse>(`/lessons/${lessonId}`);
    return response.data;
  },

  createLesson: async (payload: any) => {
    const response = await apiClient.post(`/lessons`, payload);
    return response.data;
  },

  updateLesson: async (lessonId: string, payload: any) => {
    const response = await apiClient.patch(`/lessons/${lessonId}`, payload);
    return response.data;
  },

  deleteLesson: async (lessonId: string): Promise<void> => {
    await apiClient.delete(`/lessons/${lessonId}`);
  },
};
