import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {
    SchoolSelectionForm
} from "@/features/registration/components/forms/school/SchoolSelectionForm/SchoolSelectionForm.tsx";

export const SchoolSelectionPage = () => {
    return (
        <PageLayout>
            <SchoolSelectionForm />
        </PageLayout>
    );
};