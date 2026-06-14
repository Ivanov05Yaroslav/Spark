import {
    ParentDetailsRequest,
    ParentDetailsResponse,
    ParentInitRequest,
    ParentInitResponse, ResendCodeRequest, ResendCodeResponse,
    VerifyCodeRequest,
    VerifyCodeResponse
} from '@/features/registration/types/registration.types.ts';

const API_URL = import.meta.env.VITE_API_URL;

export const registrationService = {

    async registerParentInit(data: ParentInitRequest): Promise<ParentInitResponse> {
        const response = await fetch(`${API_URL}/auth/parent/register/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = Array.isArray(errorData.message)
                ? errorData.message[0]
                : errorData.message;

            throw new Error(errorMessage || 'Помилка при ініціалізації реєстрації');
        }

        return response.json();
    },

    async registerParentDetails(data: ParentDetailsRequest): Promise<ParentDetailsResponse> {
        const response = await fetch(`${API_URL}/auth/parent/register/details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = Array.isArray(errorData.message)
                ? errorData.message[0]
                : errorData.message;
            throw new Error(errorMessage || 'Помилка при збереженні даних батьків');
        }

        return response.json();
    },

    async verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
        const response = await fetch(`${API_URL}/auth/parent/register/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Невірний код підтвердження');
            } catch (parseError: any) {
                throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
            }
        }

        return response.json();
    },

    async resendCode(data: ResendCodeRequest): Promise<ResendCodeResponse> {
        const response = await fetch(`${API_URL}/auth/parent/register/resend-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Помилка при повторній відправці коду');
            } catch (parseError: any) {
                throw new Error(parseError.message || 'Помилка сервера. Спробуйте пізніше');
            }
        }

        return response.json();
    },

};