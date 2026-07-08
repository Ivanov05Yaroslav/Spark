import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { LinkUploadForm } from '@/features/materials/components/LinkUploadForm/LinkUploadForm';
import { useLinkMaterialForm } from '@/features/materials/hooks/useLinkMaterialForm.ts';

export const UploadLinkPage = () => {
  const navigate = useNavigate();

  const { values, handlers, data, isFormValid, isLoading, isSubmitting, isEditMode } =
    useLinkMaterialForm();

  return (
    <CenteredFormLayout
      title={isEditMode ? 'РЕДАГУВАТИ ПОСИЛАННЯ' : 'СТВОРИТИ ПОСИЛАННЯ'}
      onBack={() => navigate(-1)}
      showButton={true}
      buttonText={isEditMode ? 'Зберегти' : 'Створити'}
      onButtonClick={handlers.handleSubmit}
      isButtonDisabled={!isFormValid || isSubmitting}
    >
      <LinkUploadForm
        values={values}
        handlers={handlers}
        data={data}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
      />
    </CenteredFormLayout>
  );
};
