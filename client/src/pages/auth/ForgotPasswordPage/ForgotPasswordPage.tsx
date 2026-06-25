import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm/ForgotPasswordForm';

export const ForgotPasswordPage = () => {
  return (
    <PageLayout>
      <ForgotPasswordForm />
    </PageLayout>
  );
};
