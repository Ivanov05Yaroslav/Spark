import { apiClient } from './apiClient';
import { ApiTestDetailResponse, CreateTestPayload, SubmitTestPayload } from '@/types/tests.types';

export const testsService = {
  createTest: async (payload: CreateTestPayload): Promise<{ id: string }> => {
    const response = await apiClient.post('/tests', payload);
    return response.data;
  },

  getTestById: async (id: string): Promise<ApiTestDetailResponse> => {
    const response = await apiClient.get(`/tests/${id}`);
    return response.data;
  },

  updateTest: async (
    id: string,
    payload: Partial<CreateTestPayload>,
  ): Promise<{ message?: string }> => {
    const response = await apiClient.patch(`/tests/${id}`, payload);
    return response.data;
  },

  submitTest: async (id: string, payload: SubmitTestPayload): Promise<any> => {
    const response = await apiClient.post(`/tests/${id}/submit`, payload);
    return response.data;
  },

  deleteTest: async (id: string): Promise<void> => {
    await apiClient.delete(`/tests/${id}`);
  },
};
