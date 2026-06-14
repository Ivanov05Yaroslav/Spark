import React, { useState } from 'react';
import { toast } from '@/components/utils/Toast';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';
import { OTPInput } from '@/components/auth/OTPInput/OTPInput';
import { Links } from '@/components/auth/Links/Links';
import styles from './EmailVerificationForm.module.css';
import { authService } from "@/features/auth/auth.service";

export const EmailVerificationForm = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email') || '';
    const sessionId = queryParams.get('sessionId') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const data = await authService.verifyCode({ sessionId, code });

            toast.success(data.message || 'Код успішно підтверджено!');

            setTimeout(() => {
                window.location.href = `/reset-password?sessionId=${sessionId}`;
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || 'Невірний код підтвердження');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);

        try {
            const data = await authService.resendCode({ sessionId });
            toast.success(data.message || 'Код успішно відправлено!');

        } catch (err: any) {
            toast.error(err.message || 'Помилка відновлення доступу');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormLayout
            title="ПІДТВЕРДЖЕННЯ ПОШТИ"
            error={null}
            isLoading={isLoading}
            submitButtonText="ПІДТВЕРДИТИ"
            loadingButtonText="ПІДТВЕРДЖЕННЯ..."
            onSubmit={handleSubmit}
            showSocial={false}
            links={
                <Links
                    leftText="Не отримали код підтвердження?"
                    leftLinkText="Надіслати знову"
                    onLeftLinkClick={handleResendCode}
                />
            }
        >
            <p className={styles.subtitle}>
                Код підтвердження надіслано на {email ? <strong>{email}</strong> : 'вашу пошту'}. Будь ласка, введіть його нижче.
            </p>

            <OTPInput
                length={6}
                value={code}
                onChange={setCode}
            />
        </FormLayout>
    );
};