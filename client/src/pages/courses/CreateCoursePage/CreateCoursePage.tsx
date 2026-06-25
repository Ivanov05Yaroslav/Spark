import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateCoursePage.module.css';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { CourseInfoSection } from '@/features/courses/components/CourseInfoSection/CourseInfoSection';
import { CourseAppearanceSection } from '@/features/courses/components/CourseAppearanceSection/CourseAppearanceSection';
import { useCreateCourse } from '@/features/courses/hooks/useCreateCourse';

export const CreateCoursePage = () => {
  const navigate = useNavigate();

  const { values, handlers, data, isFormValid } = useCreateCourse();

  return (
    <CenteredFormLayout
      title="СТВОРЕННЯ КУРСУ"
      onBack={() => navigate(-1)}
      showButton={true}
      buttonText="Створити"
      onButtonClick={handlers.handleCreate}
      isButtonDisabled={!isFormValid}
      maxWidth="1050px"
    >
      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <CourseInfoSection values={values} handlers={handlers} data={data} />
        </div>

        <div className={styles.rightColumn}>
          <CourseAppearanceSection values={values} handlers={handlers} />
        </div>
      </div>
    </CenteredFormLayout>
  );
};
