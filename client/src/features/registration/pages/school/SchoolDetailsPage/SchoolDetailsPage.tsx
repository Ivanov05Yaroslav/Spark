import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout';
import {
    SchoolDetailsForm
} from "@/features/registration/components/forms/school/SchoolDetailsForm/SchoolDetailsForm";

export const SchoolDetailsPage = () => {
    return (
        <PageLayout>
            <SchoolDetailsForm />
        </PageLayout>
    );
};