import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout';
import { ResetPasswordForm } from '@/features/auth/components/forms/ResetPasswordForm/ResetPasswordForm';

export const ResetPasswordPage = () => {
    return (
        <PageLayout>
            <ResetPasswordForm />
        </PageLayout>
    );
};