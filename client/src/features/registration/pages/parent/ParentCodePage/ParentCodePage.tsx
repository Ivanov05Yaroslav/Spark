import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {ParentCodeForm} from "@/features/registration/components/forms/parent/ParentCodeForm/ParentCodeForm.tsx";

export const ParentCodePage = () => {
    return (
        <PageLayout>
            <ParentCodeForm />
        </PageLayout>
    );
};