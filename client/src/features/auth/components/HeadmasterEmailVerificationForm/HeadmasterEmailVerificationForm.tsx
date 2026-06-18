import React, { useState } from 'react';
import { toast } from '@/libs/configs/Toast.ts';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { OTPInput } from '@/components/auth/OTPInput/OTPInput.tsx'
import { Links } from '@/components/auth/Links/Links.tsx';
import styles from './HeadmasterEmailVerificationForm.module.css';
import { schoolService } from "@/api/school.service.ts";

export const HeadmasterEmailVerificationForm = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email') || '';
    const sessionId = queryParams.get('sessionId') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length < 6) {
            return toast.error('Будь ласка, введіть повний 6-значний код');
        }

        setIsLoading(true);

        try {
            const data = await schoolService.verifyCode({ sessionId, code });

            toast.success(data.message || 'Код успішно підтверджено!');

            const activeSessionId = data.sessionId || sessionId;

            setTimeout(() => {
                window.location.href = `/school/register/submit?sessionId=${activeSessionId}`;
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
            const data = await schoolService.resendCode({ sessionId });
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