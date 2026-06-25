import React from 'react';
import { Badge } from '../../ui/Badge/Badge.tsx';
import { MoreButton } from '../../ui/MoreButton/MoreButton.tsx';
import { DEFAULT_THEME_COLORS } from '@/libs/constants/courses.constants.ts';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  title: string;
  imageUrl?: string | null;
  year: string;
  group?: string;
  studentsCount: number;
  teacherName: string;
  teacherAvatar?: string;
  themeColor?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showMoreButton?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  imageUrl,
  year,
  group,
  studentsCount,
  teacherName,
  teacherAvatar,
  themeColor = 'purple',
  onEdit,
  onDelete,
  showMoreButton = true,
}) => {
  const initials = teacherName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const foundColor = DEFAULT_THEME_COLORS.find((color) => color.value === themeColor);

  const finalHexColor = foundColor
    ? foundColor.base
    : themeColor.startsWith('#')
      ? themeColor
      : '#B88BFF';

  const placeholderStyle = { backgroundColor: finalHexColor };

  return (
    <div className={`${styles.card} ${styles[themeColor] || ''}`}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={styles.image}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.imagePlaceholder} style={placeholderStyle} />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.badges}>
          {year && <Badge themeColor={themeColor}>{year}</Badge>}
          {group && <Badge themeColor={themeColor}>{group}</Badge>}
        </div>

        <h3 className={styles.title}>{title}</h3>

        <div className={styles.footer}>
          <div className={styles.teacherInfo}>
            {teacherAvatar ? (
              <img src={teacherAvatar} alt={teacherName} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>{initials}</div>
            )}
            <span className={styles.teacherName}>{teacherName}</span>
          </div>

          {showMoreButton && <MoreButton onEdit={onEdit} onDelete={onDelete} />}
        </div>
      </div>
    </div>
  );
};
