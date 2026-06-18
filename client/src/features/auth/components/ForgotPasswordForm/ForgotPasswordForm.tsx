import React from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Links } from '@/components/auth/Links/Links';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';

export const ForgotPasswordForm = () => {
    const {
        email,
        setEmail,
        handleSubmit,
        isLoading
    } = useForgotPassword();

    return (
        <FormLayout
            title="ВІДНОВЛЕННЯ ПАРОЛЯ"
            error={null}
            isLoading={isLoading}
            submitButtonText="НАДІСЛАТИ КОД ПІДТВЕРДЖЕННЯ"
            loadingButtonText="НАДІСЛАННЯ..."
            onSubmit={handleSubmit}
            showSocial={false}
            links={
                <Links
                    leftText="Пам'ятаєте свій пароль?"
                    leftLinkText="Увійти"
                    onLeftLinkClick={() => (window.location.href = '/login')}
                />
            }
        >
            <Input
                label="Email"
                type="email"
                placeholder="Введіть ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
            />
        </FormLayout>
    );
};