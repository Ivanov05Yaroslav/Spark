import axios, { InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _isRetry?: boolean;
}

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshTokenPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
            originalRequest._isRetry = true;

            if (!refreshTokenPromise) {
                refreshTokenPromise = (async () => {
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (!refreshToken) return null;

                    try {
                        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                            refreshToken: refreshToken
                        });

                        localStorage.setItem('accessToken', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);

                        return data.accessToken;
                    } catch (refreshError) {
                        console.error('Сесія застаріла, вихід з аккаунту...');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');

                        window.location.href = '/login';
                        return null;
                    } finally {
                        refreshTokenPromise = null;
                    }
                })();
            }

            const newAccessToken = await refreshTokenPromise;

            if (newAccessToken) {
                originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
                return apiClient(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);