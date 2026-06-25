import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';
import { useStore } from '@/stores/useStore.ts';

export const useParentEmailVerification = (sessionId: string) => {
  const [code, setCode] = useState('');
  const setAuth = useStore((state) => state.setAuth);

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authService.parentVerifyCode({ sessionId, code }),
    onSuccess: (data) => {
      toast.success(data.message || 'Код успішно підтверджено!');

      if (data.user && data.accessToken && data.refreshToken) {
        setAuth(data.user, data.accessToken, data.refreshToken);

        setTimeout(() => {
          window.location.href = `/courses`;
        }, 1000);
      } else {
        toast.error('Помилка авторизації: дані користувача відсутні');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Невірний код підтвердження');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.parentResendCode({ sessionId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Код успішно відправлено!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Помилка відновлення доступу');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMutation.mutate(code);
  };

  return {
    code,
    setCode,
    handleSubmit,
    handleResendCode: () => resendMutation.mutate(),
    isLoading: verifyMutation.isPending || resendMutation.isPending,
  };
};
