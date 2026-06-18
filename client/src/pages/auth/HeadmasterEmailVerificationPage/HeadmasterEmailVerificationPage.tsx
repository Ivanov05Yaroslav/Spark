import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {HeadmasterEmailVerificationForm} from "@/features/auth/components/HeadmasterEmailVerificationForm/HeadmasterEmailVerificationForm.tsx";

export const HeadmasterEmailVerificationPage = () => {
    return (
        <PageLayout>
            <HeadmasterEmailVerificationForm />
        </PageLayout>
    );
};