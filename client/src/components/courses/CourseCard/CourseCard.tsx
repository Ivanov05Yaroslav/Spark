import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../ui/Badge/Badge.tsx';
import { MoreButton } from '../../ui/MoreButton/MoreButton.tsx';
import { DEFAULT_THEME_COLORS } from '@/libs/constants/courses.constants.ts';
import styles from './CourseCard.module.css';
import { Avatar } from '@/components/ui/Avatar/Avatar.tsx';

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl?: string | null;
  year: string;
  group?: string;
  teacherName: string;
  teacherAvatar?: string;
  themeColor?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUnArchive?: () => void;
  onHide?: () => void;
  onShow?: () => void;
  showMoreButton?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  imageUrl,
  year,
  group,
  teacherName,
  teacherAvatar,
  themeColor = 'purple',
  onEdit,
  onDelete,
  onArchive,
  onUnArchive,
  onHide,
  onShow,
  showMoreButton = true,
}) => {
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/courses/${id}`);
  };

  return (
    <div
      className={`${styles.card} ${styles[themeColor] || ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
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
              <Avatar src={teacherAvatar} size={40} />
            ) : (
              <div className={styles.avatarPlaceholder}>{initials}</div>
            )}
            <span className={styles.teacherName}>{teacherName}</span>
          </div>

          {showMoreButton && (
            <div onClick={(e) => e.stopPropagation()}>
              <MoreButton
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onUnArchive={onUnArchive}
                onHide={onHide}
                onShow={onShow}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
