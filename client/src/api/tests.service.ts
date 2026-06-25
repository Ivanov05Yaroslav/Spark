import { apiClient } from './apiClient';
import { ApiTestDetailResponse, CreateTestPayload } from '@/types/tests.types';

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
};
