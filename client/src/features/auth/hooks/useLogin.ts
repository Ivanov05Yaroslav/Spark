import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';
import { useStore } from '@/stores/useStore';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const setAuth = useStore((state) => state.setAuth);

    const loginMutation = useMutation({
        mutationFn: () => authService.login({ email, password }),
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken, data.refreshToken);
            toast.success('Успішний вхід!');
            setTimeout(() => {
                window.location.href = '/courses';
            }, 1000);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Щось пішло не так');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate();
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        handleSubmit,
        isLoading: loginMutation.isPending
    };
};