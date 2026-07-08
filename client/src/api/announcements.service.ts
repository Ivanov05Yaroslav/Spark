import { apiClient } from '@/api/apiClient';
import { AnnouncementResponseDto, CreateAnnouncementDto } from '@/types/announcements.types';

export const announcementService = {
  createAnnouncement: (data: CreateAnnouncementDto) =>
    apiClient.post<AnnouncementResponseDto>('/announcements', data).then((res) => res.data),

  getAnnouncementById: (id: string) =>
    apiClient.get<AnnouncementResponseDto>(`/announcements/${id}`).then((res) => res.data),

  updateAnnouncement: (id: string, data: CreateAnnouncementDto) =>
    apiClient.patch<AnnouncementResponseDto>(`/announcements/${id}`, data).then((res) => res.data),

  deleteAnnouncement: (id: string) =>
    apiClient.delete(`/announcements/${id}`).then((res) => res.data),

  readAnnouncement: (id: string) =>
    apiClient.patch(`/announcements/${id}/read`).then((res) => res.data),
};
