import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';

export const useForgotPassword = () => {
    const [email, setEmail] = useState('');

    const mutation = useMutation({
        mutationFn: () => authService.forgotPassword({ email }),
        onSuccess: (data) => {
            toast.success(data.message || 'Код успішно відправлено!');
            setTimeout(() => {
                window.location.href = `/password/verify-email?email=${encodeURIComponent(email)}&sessionId=${data.sessionId}`;
            }, 1000);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Помилка відновлення доступу');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return {
        email,
        setEmail,
        handleSubmit,
        isLoading: mutation.isPending
    };
};