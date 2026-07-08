import { apiClient } from '@/api/apiClient';
import {
  CreateLinkMaterialDto,
  UpdateLinkMaterialDto,
  LinkMaterialResponseDto,
} from '@/types/materials.types';

export const materialsService = {
  createLink: (data: CreateLinkMaterialDto) =>
    apiClient.post<LinkMaterialResponseDto>('/materials/link', data).then((res) => res.data),

  updateLink: (id: string, data: UpdateLinkMaterialDto) =>
    apiClient.patch<LinkMaterialResponseDto>(`/materials/${id}`, data).then((res) => res.data),

  getMaterialById: (id: string) =>
    apiClient.get<LinkMaterialResponseDto>(`/materials/${id}`).then((res) => res.data),

  createFile: (data: FormData) =>
    apiClient
      .post('/materials/file', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  updateMaterial: (id: string, data: FormData) =>
    apiClient
      .patch(`/materials/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),

  deleteMaterial: (id: string) => apiClient.delete(`/materials/${id}`).then((res) => res.data),
};
