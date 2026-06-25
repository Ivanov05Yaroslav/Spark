import { UserProfileResponseDTO } from '@/types/profile.types.ts';
import { apiClient } from '@/api/apiClient.ts';

export const userService = {
  async getProfile(): Promise<UserProfileResponseDTO> {
    try {
      const response = await apiClient.get<UserProfileResponseDTO>('/users/profile/me');

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Щось пішло не так');
      }

      throw new Error('Помилка сервера. Спробуйте пізніше');
    }
  },
};
