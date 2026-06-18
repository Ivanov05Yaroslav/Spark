import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {EmailVerificationForm} from "@/features/auth/components/EmailVerificationForm/EmailVerificationForm";

export const EmailVerificationPage = () => {
    return (
        <PageLayout>
            <EmailVerificationForm />
        </PageLayout>
    );
};