import React from 'react';
import { CreateCourseButton } from '@/components/courses/CreateCourseButton/CreateCourseButton.tsx';
import StarsIcon from '../../../../assets/stars.svg?react';
import styles from './CoursesBanner.module.css';

interface CoursesBannerProps {
  onCreateClick: () => void;
  showCreateButton?: boolean;
}

export const CoursesBanner: React.FC<CoursesBannerProps> = ({
  onCreateClick,
  showCreateButton,
}) => {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Керуйте всім навчальним процесом в одному місці зі
          <br />
          Spark
        </h1>
        {showCreateButton && <CreateCourseButton onClick={onCreateClick} />}
      </div>

      <StarsIcon className={styles.starsDecoration} />
    </div>
  );
};
