import { apiClient } from './apiClient';
import { TaskResponse } from '@/types/tasks.types.ts';

export const tasksService = {
  getTaskById: async (taskId: string): Promise<TaskResponse> => {
    const response = await apiClient.get<TaskResponse>(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (formData: FormData) => {
    const response = await apiClient.post(`/tasks`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateTask: async (taskId: string, formData: FormData) => {
    const response = await apiClient.patch(`/tasks/${taskId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
