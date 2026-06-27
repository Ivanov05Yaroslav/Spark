import { apiClient } from './apiClient';
import { ApiTestAttemptsResponse } from '@/types/tests.types';

export const submissionsService = {
  getAttempts: async (testId: string, studentId: string): Promise<ApiTestAttemptsResponse> => {
    const response = await apiClient.get(
      `/submissions/test/${testId}/student/${studentId}/attempts`,
    );
    return response.data;
  },

  getStudentAttempts: async (testId: string): Promise<any[]> => {
    const response = await apiClient.get(`/submissions/test/${testId}/student-attempts`);
    return response.data;
  },

  submitTask: async (formData: FormData): Promise<any> => {
    const response = await apiClient.post('/submissions/task', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyTaskSubmission: async (taskId: string): Promise<any> => {
    const response = await apiClient.get(`/submissions/task/${taskId}/my`);
    return response.data;
  },

  patchTaskSubmission: async (taskId: string, formData: FormData): Promise<any> => {
    const response = await apiClient.patch(`/submissions/task/${taskId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStudentSubmissionsList: async (taskId: string): Promise<any[]> => {
    const response = await apiClient.get(`/submissions/task/${taskId}/student-submissions`);
    return response.data;
  },

  getStudentSubmissionDetail: async (taskId: string, studentId: string): Promise<any> => {
    const response = await apiClient.get(`/submissions/task/${taskId}/student/${studentId}`);
    return response.data;
  },

  gradeSubmission: async (submissionId: string, score: string | number): Promise<any> => {
    const response = await apiClient.patch(`/submissions/${submissionId}/grade`, {
      score: score.toString(),
    });
    return response.data;
  },
};
