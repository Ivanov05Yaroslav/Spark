import { apiClient } from '@/api/apiClient';
import { ClassDTO } from '@/types/classes.types';

export const classesService = {
    getClasses: () =>
        apiClient.get<ClassDTO[]>(`/classes`).then(res => res.data),
};