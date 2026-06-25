import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/libs/configs/Toast.ts';
import { authService } from '@/api/auth.service.ts';

export const useResetPassword = (sessionId: string) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      authService.resetPassword({
        sessionId,
        newPassword: password,
      }),
    onSuccess: (data) => {
      toast.success(data.message || 'Пароль успішно змінено!');

      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Помилка при зміні пароля');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Паролі не збігаються');
      return;
    }

    mutation.mutate();
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    isLoading: mutation.isPending,
  };
};
