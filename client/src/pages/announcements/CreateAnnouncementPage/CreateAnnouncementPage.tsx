import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { useCreateAnnouncement } from '@/features/announcements/hooks/useCreateAnnouncement'
import { CreateAnnouncementForm } from '@/features/announcements/components/CreateAnnouncementForm/CreateAnnouncementForm';

import styles from './CreateAnnouncementPage.module.css';

export const CreateAnnouncementPage = () => {
    const navigate = useNavigate();
    const {
        values,
        handlers,
        data,
        isFormValid,
        isLoadingData,
        isSubmitting
    } = useCreateAnnouncement();

    if (isLoadingData) {
        return (
            <div className={styles.loaderContainer} style={{ textAlign: 'center', padding: '40px' }}>
                Завантаження даних курсу...
            </div>
        );
    }

    return (
        <CenteredFormLayout
            title="СТВОРЕННЯ ОГОЛОШЕННЯ"
            onBack={() => navigate(-1)}
            showButton={true}
            buttonText={isSubmitting ? "Створення..." : "Створити"}
            onButtonClick={() => handlers.handleCreate()}
            isButtonDisabled={!isFormValid || isSubmitting}
        >
            <CreateAnnouncementForm
                values={values}
                handlers={handlers}
                data={data}
                isSubmitting={isSubmitting}
            />
        </CenteredFormLayout>
    );
};