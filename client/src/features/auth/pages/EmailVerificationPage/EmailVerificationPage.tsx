import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout';
import {EmailVerificationForm} from "@/features/auth/components/forms/EmailVerificationForm/EmailVerificationForm";

export const EmailVerificationPage = () => {
    return (
        <PageLayout>
            <EmailVerificationForm />
        </PageLayout>
    );
};