import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from "@/api/auth.service.ts";

export const useEmailVerification = (sessionId: string) => {
    const [code, setCode] = useState('');

    const verifyMutation = useMutation({
        mutationFn: (code: string) => authService.verifyCode({ sessionId, code }),
        onSuccess: (data) => {
            toast.success(data.message || 'Код успішно підтверджено!');
            setTimeout(() => {
                window.location.href = `/password/reset-password?sessionId=${sessionId}`;
            }, 1000);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Невірний код підтвердження');
        }
    });

    const resendMutation = useMutation({
        mutationFn: () => authService.resendCode({ sessionId }),
        onSuccess: (data) => {
            toast.success(data.message || 'Код успішно відправлено!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Помилка відновлення доступу');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        verifyMutation.mutate(code);
    };

    return {
        code,
        setCode,
        handleSubmit,
        handleResendCode: resendMutation.mutate,
        isLoading: verifyMutation.isPending || resendMutation.isPending,
    };
};