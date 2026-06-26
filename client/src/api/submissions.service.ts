import { apiClient } from './apiClient';
import { ApiTestAttemptsResponse } from '@/types/tests.types';

export const submissionsService = {
  getMyAttempts: async (testId: string): Promise<ApiTestAttemptsResponse> => {
    const response = await apiClient.get(`/submissions/test/${testId}/my-attempts`);
    return response.data;
  },

  getStudentAttempts: async (testId: string): Promise<any[]> => {
    const response = await apiClient.get(`/submissions/test/${testId}/student-attempts`);
    return response.data;
  },
};
