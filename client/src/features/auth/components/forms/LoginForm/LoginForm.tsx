import React, { useState } from 'react';
import { toast } from '@/components/utils/Toast';
import { Input } from '@/components/ui/Input/Input';
import { Links } from '@/components/auth/Links/Links';
import { authService } from '@/features/auth/auth.service';
import { useStore } from '@/stores/useStore';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const setAuth = useStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await authService.login({ email, password });
            setAuth(data.user, data.accessToken, data.refreshToken);
            toast.success('Успішний вхід!');

            setTimeout(() => {
                window.location.href = '/courses';
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || 'Щось пішло не так');
        } finally {
            setIsLoading(false);
        }
    };

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