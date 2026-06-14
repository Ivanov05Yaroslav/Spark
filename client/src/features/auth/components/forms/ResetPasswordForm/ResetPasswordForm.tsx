import React, { useState } from 'react';
import { toast } from '@/components/utils/Toast';
import { Input } from '@/components/ui/Input/Input';
import { authService } from '@/features/auth/auth.service';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';

export const ResetPasswordForm = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get('sessionId') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Паролі не збігаються');
            return;
        }

        setIsLoading(true);

        try {
            const data = await authService.resetPassword({
                sessionId,
                newPassword: password
            });

            toast.success(data.message);

            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } catch (err: any) {
            toast.error(err.message || 'Помилка при зміні пароля');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormLayout
            title="ВСТАНОВЛЕННЯ НОВОГО ПАРОЛЯ"
            error={null}
            isLoading={isLoading}
            submitButtonText="ПІДТВЕРДИТИ"
            loadingButtonText="ПІДТВЕРДЖЕННЯ..."
            onSubmit={handleSubmit}
            showSocial={false}
        >
            <Input
                label="Новий пароль"
                type="password"
                placeholder="Введіть новий пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
            />
            <Input
                label="Повторіть новий пароль"
                type="password"
                placeholder="Повторіть ваш новий пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
            />
        </FormLayout>
    );
};