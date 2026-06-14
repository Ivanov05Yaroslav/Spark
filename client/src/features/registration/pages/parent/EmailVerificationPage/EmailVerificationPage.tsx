import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {EmailVerificationForm} from "@/features/registration/components/forms/parent/EmailVerificationForm/EmailVerificationForm";

export const EmailVerificationPage = () => {
    return (
        <PageLayout>
            <EmailVerificationForm />
        </PageLayout>
    );
};