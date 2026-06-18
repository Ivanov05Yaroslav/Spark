import React from 'react';
import { Input } from '@/components/ui/Input/Input';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';

export const ResetPasswordForm = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get('sessionId') || '';

    const {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleSubmit,
        isLoading
    } = useResetPassword(sessionId);

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