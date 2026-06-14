import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import {ParentDetailsForm} from "@/features/registration/components/forms/parent/ParentDetailsForm/ParentDetailsForm.tsx";

export const ParentDetailsPage = () => {
    return (
        <PageLayout>
            <ParentDetailsForm />
        </PageLayout>
    );
};