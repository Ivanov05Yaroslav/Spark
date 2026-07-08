import React, { useState } from 'react';
import EditIcon from '@/assets/edit.svg?react';
import { DEFAULT_THEME_COLORS } from '@/libs/constants/courses.constants';
import styles from './CourseBanner.module.css';

export interface CourseBannerProps {
  title: string;
  classNumber?: string | number;
  themeColor?: string;
  backgroundImage?: string | null;
  onEdit?: () => void;
  showEditButton: boolean;
}

export const CourseBanner: React.FC<CourseBannerProps> = ({
  title,
  classNumber,
  themeColor = 'purple',
  backgroundImage,
  onEdit,
  showEditButton,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const resolvedColor = DEFAULT_THEME_COLORS.find((c) => c.value === themeColor)?.base || '#702DFF';

  const containerStyle = { backgroundColor: resolvedColor };

  return (
    <div className={styles.bannerContainer} style={containerStyle}>
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt={title}
          className={`${styles.backgroundImage} ${imageLoaded ? styles.loaded : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
      )}

      {backgroundImage && <div className={styles.overlay} />}

      <div className={styles.content}>
        <div className={styles.textBlock}>
          <h1 className={styles.title}>{title}</h1>
          {classNumber && <div className={styles.classNumber}>{classNumber} клас</div>}
        </div>
      </div>

      {showEditButton && (
        <button className={styles.editButton} onClick={onEdit} aria-label="Редагувати курс">
          <EditIcon className={styles.editIcon} />
        </button>
      )}
    </div>
  );
};
