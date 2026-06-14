import {
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
    ResendCodeRequest,
    ResendCodeResponse
} from '@/features/auth/auth.types';

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
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
    },

    async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        const response = await fetch(`${API_URL}/auth/password/forgot/send-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
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
    },

    async verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
        const response = await fetch(`${API_URL}/auth/password/forgot/verify-code`, {
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

    async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        const response = await fetch(`${API_URL}/auth/password/forgot/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();

                const errorMessage = Array.isArray(errorData.message)
                    ? errorData.message[0]
                    : errorData.message || 'Не вдалося оновити пароль';

                throw new Error(errorMessage);
            } catch (parseError: any) {
                throw new Error(parseError.message || 'Помилка сервера');
            }
        }

        return response.json();
    },

    async resendCode(data: ResendCodeRequest): Promise<ResendCodeResponse> {
        const response = await fetch(`${API_URL}/auth/password/forgot/resend-code`, {
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