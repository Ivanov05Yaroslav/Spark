import { apiClient } from '@/api/apiClient';
import {
  CommentReportsQueryParams,
  CommentReportsResponseDto,
  CreateManualUserPayload,
  GetUsersResponse,
  ResolveReportPayload,
  SchoolDetailsDto,
  SchoolRequestDto,
} from '@/types/administration.types';

export const administrationService = {
  createManualUser: (payload: CreateManualUserPayload) =>
    apiClient.post('/users/admin/create', payload).then((res) => res.data),

  getUsers: (params: { search?: string; page?: number; limit?: number }) =>
    apiClient
      .get<GetUsersResponse>('/users/admin/school-users', { params })
      .then((res) => res.data),

  updateUserRoles: (id: string, roles: string[]) =>
    apiClient.put(`/users/admin/${id}/roles`, { roles }).then((res) => res.data),

  deleteUser: (id: string) => apiClient.delete(`/users/admin/${id}`).then((res) => res.data),

  bulkRegisterUsers: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient
      .post('/users/admin/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data);
  },

  downloadBulkTemplate: () => apiClient.get('/users/admin/bulk/template').then((res) => res.data),

  downloadBulkInstructions: () =>
    apiClient.get('/users/admin/bulk/instruction').then((res) => res.data),

  getCommentReports: (params?: CommentReportsQueryParams) =>
    apiClient
      .get<CommentReportsResponseDto>('/comments/reports/list', { params })
      .then((res) => res.data),

  resolveReport: (reportId: string, payload: ResolveReportPayload) =>
    apiClient.patch(`/comments/reports/${reportId}/resolve`, payload).then((res) => res.data),

  getPendingRequests: async (): Promise<SchoolRequestDto[]> => {
    const response = await apiClient.get('/schools/requests/pending');
    return response.data;
  },

  approveRequest: async (id: string) => {
    const response = await apiClient.post(`/schools/requests/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: string, reason: string) => {
    const response = await apiClient.post(`/schools/requests/${id}/reject`, { reason });
    return response.data;
  },

  getSchoolById: async (edeboId: string): Promise<SchoolDetailsDto> => {
    const response = await apiClient.get('/schools/search', {
      params: { edeboId },
    });
    return response.data;
  },
};
