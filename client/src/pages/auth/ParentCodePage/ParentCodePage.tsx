import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {ParentCodeForm} from "@/features/auth/components/ParentCodeForm/ParentCodeForm.tsx";

export const ParentCodePage = () => {
    return (
        <PageLayout>
            <ParentCodeForm />
        </PageLayout>
    );
};