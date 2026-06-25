import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditCoursePage.module.css';

import { CenteredFormLayout } from '@/components/layout/CenteredFormLayout/CenteredFormLayout.tsx';
import { CourseInfoSection } from '@/features/courses/components/CourseInfoSection/CourseInfoSection';
import { CourseAppearanceSection } from '@/features/courses/components/CourseAppearanceSection/CourseAppearanceSection';
import { useEditCourse } from '@/features/courses/hooks/useEditCourse';

export const EditCoursePage = () => {
  const navigate = useNavigate();
  const { values, handlers, data, isFormValid, isCourseLoading, isSubmitting } = useEditCourse();

  return (
    <CenteredFormLayout
      title="РЕДАГУВАННЯ КУРСУ"
      onBack={() => navigate(-1)}
      showButton={!isCourseLoading}
      buttonText={isSubmitting ? 'Збереження...' : 'Зберегти'}
      onButtonClick={handlers.handleUpdate}
      isButtonDisabled={!isFormValid || isSubmitting}
      maxWidth="1050px"
    >
      {isCourseLoading ? (
        <div className={styles.loaderContainer}>Завантаження даних курсу...</div>
      ) : (
        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <CourseInfoSection values={values} handlers={handlers} data={data} />
          </div>

          <div className={styles.rightColumn}>
            <CourseAppearanceSection values={values} handlers={handlers} />
          </div>
        </div>
      )}
    </CenteredFormLayout>
  );
};
