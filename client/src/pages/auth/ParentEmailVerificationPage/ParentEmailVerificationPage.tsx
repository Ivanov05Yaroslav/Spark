import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {EmailVerificationForm} from "@/features/auth/components/ParentEmailVerificationForm/ParentEmailVerificationForm.tsx";

export const ParentEmailVerificationPage = () => {
    return (
        <PageLayout>
            <EmailVerificationForm />
        </PageLayout>
    );
};