import React, { useState } from 'react';
import { toast } from '@/libs/configs/Toast.ts';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { OTPInput } from '@/components/auth/OTPInput/OTPInput.tsx'
import { Links } from '@/components/auth/Links/Links.tsx';
import styles from './ParentEmailVerificationForm.module.css';
import { registrationService } from "@/api/registration.service.ts";
import { useStore } from '@/stores/useStore.ts';

export const ParentEmailVerificationForm = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const setAuth = useStore((state) => state.setAuth);

    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email') || '';
    const sessionId = queryParams.get('sessionId') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const data = await registrationService.verifyCode({ sessionId, code });

            toast.success(data.message || 'Код успішно підтверджено!');

            setAuth(data.user, data.accessToken, data.refreshToken);

            setTimeout(() => {
                window.location.href = `/courses`;
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
            const data = await registrationService.resendCode({ sessionId });
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