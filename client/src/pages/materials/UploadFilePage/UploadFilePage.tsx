import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { FileUploadForm } from '@/features/materials/components/FileUploadForm/FileUploadForm';
import { useFileMaterialForm } from '@/features/materials/hooks/useFileMaterialForm.ts';

export const UploadFilePage = () => {
  const navigate = useNavigate();

  const { values, handlers, data, isFormValid, isLoading, isSubmitting, isEditMode } =
    useFileMaterialForm();

  return (
    <CenteredFormLayout
      title={isEditMode ? 'РЕДАГУВАТИ ФАЙЛ' : 'ЗАВАНТАЖИТИ ФАЙЛ'}
      onBack={() => navigate(-1)}
      showButton={true}
      buttonText={isEditMode ? 'Зберегти' : 'Створити'}
      onButtonClick={handlers.handleSubmit}
      isButtonDisabled={!isFormValid || isSubmitting}
    >
      <FileUploadForm
        values={values}
        handlers={handlers}
        data={data}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
      />
    </CenteredFormLayout>
  );
};
