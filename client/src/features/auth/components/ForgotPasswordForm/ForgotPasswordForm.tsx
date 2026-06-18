import React, { useState } from 'react';
import { toast } from '@/libs/configs/Toast.ts';
import { Input } from '@/components/ui/Input/Input';
import { Links } from '@/components/auth/Links/Links';
import { authService } from '@/api/auth.service.ts';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await authService.forgotPassword({ email });
            toast.success(data.message || 'Код успішно відправлено!');

            setTimeout(() => {
                window.location.href = `/verify-email?email=${encodeURIComponent(email)}&sessionId=${data.sessionId}`;
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || 'Помилка відновлення доступу');
        } finally {
            setIsLoading(false);
        }
    };

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
                    onLeftLinkClick={() => window.location.href = '/login'}
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