import { apiClient } from './apiClient';

export const journalService = {
  getJournalLessons: async (courseId: string) => {
    const response = await apiClient.get(`/courses/${courseId}/journal/lessons`);
    return response.data;
  },

  getJournalLessonDetails: async (courseId: string, lessonId: string) => {
    const response = await apiClient.get(`/courses/${courseId}/journal/lessons/${lessonId}`);
    return response.data;
  },

  updateJournalLesson: async (courseId: string, lessonId: string, payload: any) => {
    const response = await apiClient.put(
      `/courses/${courseId}/journal/lessons/${lessonId}`,
      payload,
    );
    return response.data;
  },
};
