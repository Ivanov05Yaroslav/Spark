import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { useEditAnnouncement } from '@/features/announcements/hooks/useEditAnnouncement';
import { EditAnnouncementForm } from '@/features/announcements/components/EditAnnouncementForm/EditAnnouncementForm';

import styles from './EditAnnouncementPage.module.css';

export const EditAnnouncementPage = () => {
  const navigate = useNavigate();
  const { values, handlers, data, isFormValid, isLoadingData, isSubmitting } =
    useEditAnnouncement();

  if (isLoadingData) {
    return (
      <div className={styles.loaderContainer} style={{ textAlign: 'center', padding: '40px' }}>
        Завантаження даних...
      </div>
    );
  }

  return (
    <CenteredFormLayout
      title="РЕДАГУВАННЯ ОГОЛОШЕННЯ"
      onBack={() => navigate(-1)}
      showButton={true}
      buttonText={isSubmitting ? 'Збереження...' : 'Зберегти'}
      onButtonClick={() => handlers.handleUpdate()}
      isButtonDisabled={!isFormValid || isSubmitting}
    >
      <EditAnnouncementForm
        values={values}
        handlers={handlers}
        data={data}
        isSubmitting={isSubmitting}
      />
    </CenteredFormLayout>
  );
};
