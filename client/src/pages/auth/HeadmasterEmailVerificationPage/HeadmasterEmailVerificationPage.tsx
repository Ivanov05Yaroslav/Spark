import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {EmailVerificationForm} from "@/features/auth/components/HeadmasterEmailVerificationForm/HeadmasterEmailVerificationForm.tsx";

export const HeadmasterEmailVerificationPage = () => {
    return (
        <PageLayout>
            <EmailVerificationForm />
        </PageLayout>
    );
};