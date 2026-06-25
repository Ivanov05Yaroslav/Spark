import { apiClient } from '@/api/apiClient';
import { NushGradingGroupDto, SubjectDTO } from '@/types/subjects.types';

export const subjectsService = {
  getMySubjects: () => apiClient.get<SubjectDTO[]>('/subjects/my').then((res) => res.data),

  getSubjects: () => apiClient.get<SubjectDTO[]>(`/subjects`).then((res) => res.data),

  getGradingGroupsBySubject: (subjectId: string) =>
    apiClient
      .get<NushGradingGroupDto[]>(`/subjects/${subjectId}/nus-groups`)
      .then((res) => res.data),
};
