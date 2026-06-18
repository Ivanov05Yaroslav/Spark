import React from 'react';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout';
import { OTPInput } from '@/components/auth/OTPInput/OTPInput';
import { Links } from '@/components/auth/Links/Links';
import { useEmailVerification } from '@/features/auth/hooks/useEmailVerification';
import styles from './EmailVerificationForm.module.css';

export const EmailVerificationForm = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email') || '';
    const sessionId = queryParams.get('sessionId') || '';

    const {
        code,
        setCode,
        handleSubmit,
        handleResendCode,
        isLoading
    } = useEmailVerification(sessionId);

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
                Код підтвердження надіслано на {email ? <strong>{email}</strong> : 'вашу пошту'}.
                Будь ласка, введіть його нижче.
            </p>

            <OTPInput
                length={6}
                value={code}
                onChange={setCode}
            />
        </FormLayout>
    );
};