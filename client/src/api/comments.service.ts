import { apiClient } from './apiClient';
import { ApiComment, CreateCommentPayload } from '@/types/comments.types.ts';

export const commentsService = {
  createComment: async (payload: CreateCommentPayload): Promise<any> => {
    const response = await apiClient.post('/comments', payload);
    return response.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/comments/${id}`);
    return response.data;
  },

  getTestComments: async (testId: string, params?: { targetStudentId?: string }) => {
    const response = await apiClient.get(`/comments/test/${testId}`, { params });
    return response.data;
  },

  getTaskComments: async (testId: string, params?: { targetStudentId?: string }) => {
    const response = await apiClient.get(`/comments/task/${testId}`, { params });
    return response.data;
  },

  updateComment: async (id: string, content: string): Promise<any> => {
    const response = await apiClient.patch(`/comments/${id}`, { content });
    return response.data;
  },
};
