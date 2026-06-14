import { UserProfileResponseDTO } from '@/features/profile/profile.types';

const API_URL = import.meta.env.VITE_API_URL;

export const userService = {
    async getProfile(): Promise<UserProfileResponseDTO> {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();

                throw new Error(errorData.message || 'Щось пішло не так');
            } catch (parseError: any) {
                throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
            }
        }

        return response.json();
    }
};