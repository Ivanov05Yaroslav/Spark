import React from 'react';
import { PageLayout } from '@/components/auth/PageLayout/PageLayout.tsx';
import { SchoolDetailsForm } from '@/features/auth/components/SchoolDetailsForm/SchoolDetailsForm.tsx';

export const SchoolDetailsPage = () => {
  return (
    <PageLayout>
      <SchoolDetailsForm />
    </PageLayout>
  );
};
