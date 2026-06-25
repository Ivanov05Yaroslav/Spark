import React from 'react';
import { FormLayout } from '@/components/auth/FormLayout/FormLayout.tsx';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload.tsx';
import { SelectField } from '@/components/ui/SelectField/SelectField.tsx';
import { useSchoolDocuments } from '../../hooks/useSchoolDocuments';
import { DOCUMENT_OPTIONS } from '@/libs/constants/auth.constants';
import styles from './SchoolDocumentsForm.module.css';

export const SchoolDocumentsForm = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = queryParams.get('sessionId') || '';

  const {
    passportFiles,
    setPassportFiles,
    secondaryDocType,
    handleDocTypeChange,
    secondaryFiles,
    setSecondaryFiles,
    handleSubmit,
    isLoading,
  } = useSchoolDocuments(sessionId);

  return (
    <FormLayout
      title="ЗАЯВКА НА РЕЄСТРАЦІЮ ШКОЛИ"
      error={null}
      isLoading={isLoading}
      submitButtonText="ПІДТВЕРДИТИ"
      loadingButtonText="ВІДПРАВКА..."
      onSubmit={handleSubmit}
      showSocial={false}
    >
      <p className={styles.subtitle}>
        Будь ласка, завантажте документи, що підтверджують особу директора.
      </p>

      <div className={styles.formGrid}>
        <div className={styles.leftLabel}>Паспорт громадянина України (Обов'язково)</div>

        <div className={styles.rightSelect}>
          <SelectField
            placeholder="Оберіть документ"
            value={secondaryDocType}
            options={DOCUMENT_OPTIONS}
            onChange={handleDocTypeChange}
            disabled={isLoading}
          />
        </div>

        <div className={styles.leftDropzone}>
          <FileUpload onFilesChange={setPassportFiles} values={passportFiles} maxFiles={5} />
        </div>

        <div className={styles.rightDropzone}>
          <FileUpload onFilesChange={setSecondaryFiles} values={secondaryFiles} maxFiles={5} />
        </div>
      </div>
    </FormLayout>
  );
};
