import { UserProfileResponseDTO } from '@/types/profile.types.ts';
import { apiClient } from '@/api/apiClient.ts';

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const userService = {
  getProfile: () =>
    apiClient.get<UserProfileResponseDTO>('/users/profile/me').then((res) => res.data),

  updateProfile: (data: FormData) =>
    apiClient
      .patch('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  changePassword: (data: ChangePasswordPayload) =>
    apiClient.post('/auth/password/change', data).then((res) => res.data),
};
