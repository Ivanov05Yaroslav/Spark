import React from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Links } from '@/components/auth/Links/Links';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';
import { useLogin } from '@/features/auth/hooks/useLogin';

export const LoginForm = () => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        handleSubmit,
        isLoading
    } = useLogin();

    return (
        <FormLayout
            title="ВХІД"
            error={null}
            isLoading={isLoading}
            submitButtonText="УВІЙТИ"
            loadingButtonText="ВХІД..."
            onSubmit={handleSubmit}
            links={
                <Links
                    leftText="Немає акаунта?"
                    leftLinkText="Зареєструватися"
                    onLeftLinkClick={() => window.location.href = '/parent/register/init'}
                    rightLinkText="Забули пароль?"
                    onRightLinkClick={() => window.location.href = '/password/forgot-password'}
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

            <Input
                label="Пароль"
                type="password"
                placeholder="Введіть ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
            />
        </FormLayout>
    );
};