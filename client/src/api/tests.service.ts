import { apiClient } from './apiClient';
import { CreateTestPayload } from '@/types/tests.types';

export const testsService = {
  createTest: async (payload: CreateTestPayload): Promise<{ id: string }> => {
    const response = await apiClient.post('/tests', payload);
    return response.data;
  },
};
