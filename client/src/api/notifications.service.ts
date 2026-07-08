import { apiClient } from '@/api/apiClient';
import { ApiNotificationsResponse } from '@/types/notifications.types';

export const notificationsService = {
  getNotifications: async (page: number, limit: number = 10): Promise<ApiNotificationsResponse> => {
    const response = await apiClient.get<ApiNotificationsResponse>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};
