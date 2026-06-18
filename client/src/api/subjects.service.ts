import { MySubjectsResponseDTO } from '@/types/subjects.types.ts';
import { apiClient } from '@/api/apiClient.ts';

export const subjectsService = {

    async getMySubjects(): Promise<MySubjectsResponseDTO> {
        try {
            const response = await apiClient.get<MySubjectsResponseDTO>('/subjects/my');

            return response.data;

        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Щось пішло не так');
            }

            throw new Error('Помилка сервера. Спробуйте пізніше');
        }
    },
};