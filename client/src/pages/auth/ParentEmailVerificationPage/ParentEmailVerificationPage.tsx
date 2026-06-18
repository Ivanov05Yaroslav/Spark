import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {
    ParentEmailVerificationForm,
} from "@/features/auth/components/ParentEmailVerificationForm/ParentEmailVerificationForm.tsx";

export const ParentEmailVerificationPage = () => {
    return (
        <PageLayout>
            <ParentEmailVerificationForm />
        </PageLayout>
    );
};