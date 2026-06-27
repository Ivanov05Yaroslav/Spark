import React from 'react';
import EditIcon from '@/assets/edit.svg?react';
import { DEFAULT_THEME_COLORS } from '@/libs/constants/courses.constants';
import styles from './CourseBanner.module.css';

export interface CourseBannerProps {
  title: string;
  classNumber?: string | number;
  themeColor?: string;
  backgroundImage?: string | null;
  onEdit?: () => void;
}

export const CourseBanner: React.FC<CourseBannerProps> = ({
  title,
  classNumber,
  themeColor = 'purple',
  backgroundImage,
  onEdit,
}) => {
  const resolvedColor = DEFAULT_THEME_COLORS.find((c) => c.value === themeColor)?.base || '#702DFF';

  const backgroundStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : { backgroundColor: resolvedColor };

  return (
    <div className={styles.bannerContainer} style={backgroundStyle}>
      {backgroundImage && <div className={styles.overlay} />}

      <div className={styles.content}>
        <div className={styles.textBlock}>
          <h1 className={styles.title}>{title}</h1>
          {classNumber && <div className={styles.classNumber}>{classNumber} клас</div>}
        </div>
      </div>

      {onEdit && (
        <button className={styles.editButton} onClick={onEdit} aria-label="Редагувати курс">
          <EditIcon className={styles.editIcon} />
        </button>
      )}
    </div>
  );
};
