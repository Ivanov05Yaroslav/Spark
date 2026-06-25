import React from 'react';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { OTPInput } from '@/components/auth/OTPInput/OTPInput.tsx';
import { Links } from '@/components/auth/Links/Links.tsx';
import { useParentEmailVerification } from '@/features/auth/hooks/useParentEmailVerification';
import styles from './ParentEmailVerificationForm.module.css';

export const ParentEmailVerificationForm = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get('email') || '';
  const sessionId = queryParams.get('sessionId') || '';

  const { code, setCode, handleSubmit, handleResendCode, isLoading } =
    useParentEmailVerification(sessionId);

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
        Код підтвердження надіслано на {email ? <strong>{email}</strong> : 'вашу пошту'}. Будь
        ласка, введіть його нижче.
      </p>

      <OTPInput length={6} value={code} onChange={setCode} />
    </FormLayout>
  );
};
