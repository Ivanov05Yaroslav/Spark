import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout';
import { LoginForm } from '@/features/auth/components/forms/LoginForm/LoginForm';

export const LoginPage = () => {
    return (
        <PageLayout>
            <LoginForm />
        </PageLayout>
    );
};