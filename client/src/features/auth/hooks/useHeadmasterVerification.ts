import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';

export const useHeadmasterVerification = (sessionId: string) => {
  const [code, setCode] = useState('');

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authService.headmasterVerifyCode({ sessionId, code }),
    onSuccess: (data) => {
      toast.success(data.message || 'Код успішно підтверджено!');
      const activeSessionId = data.sessionId || sessionId;
      setTimeout(() => {
        window.location.href = `/school/register/submit?sessionId=${activeSessionId}`;
      }, 1000);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Невірний код підтвердження');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.headmasterResendCode({ sessionId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Код успішно відправлено!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Помилка відновлення доступу');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      return toast.error('Будь ласка, введіть повний 6-значний код');
    }
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
