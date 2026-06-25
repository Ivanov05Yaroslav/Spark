import { apiClient } from '@/api/apiClient';
import { CreateManualUserPayload, GetUsersResponse } from '@/types/administration.types';

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
};
