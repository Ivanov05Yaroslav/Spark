import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import { LoginForm } from '@/features/auth/components/LoginForm/LoginForm.tsx';

export const LoginPage = () => {
    return (
        <PageLayout>
            <LoginForm />
        </PageLayout>
    );
};