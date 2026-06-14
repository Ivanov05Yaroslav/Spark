import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout';
import {ForgotPasswordForm} from "@/features/auth/components/forms/ForgotPasswordForm/ForgotPasswordForm";

export const ForgotPasswordPage = () => {
    return (
        <PageLayout>
            <ForgotPasswordForm />
        </PageLayout>
    );
};