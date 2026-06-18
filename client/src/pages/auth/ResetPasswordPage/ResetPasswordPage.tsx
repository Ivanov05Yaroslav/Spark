import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm/ResetPasswordForm.tsx';

export const ResetPasswordPage = () => {
    return (
        <PageLayout>
            <ResetPasswordForm />
        </PageLayout>
    );
};