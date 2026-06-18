import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {
    SchoolSelectionForm
} from "@/features/auth/components/SchoolSelectionForm/SchoolSelectionForm.tsx";

export const SchoolSelectionPage = () => {
    return (
        <PageLayout>
            <SchoolSelectionForm />
        </PageLayout>
    );
};