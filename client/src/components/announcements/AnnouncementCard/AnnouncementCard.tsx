import React from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar'; // Перевір шлях до Avatar
import { MoreButton } from '@/components/ui/MoreButton/MoreButton'; // Перевір шлях до MoreButton
import styles from './AnnouncementCard.module.css';

interface AnnouncementCardProps {
  authorName: string;
  announcementTitle: string;
  time: string;
  content: string | React.ReactNode;
  avatarUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  // Додаємо onComplaint, якщо в тебе є такий функціонал для студентів
  onComplaint?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  authorName,
  announcementTitle,
  time,
  content,
  avatarUrl,
  onEdit,
  onDelete,
  onComplaint,
}) => {
  // Генерація ініціалів, якщо немає аватарки
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <div className={styles.authorSection}>
          {avatarUrl ? (
            <Avatar src={avatarUrl} size={40} />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitials(authorName)}</div>
          )}
          <div className={styles.authorText}>
            <h3 className={styles.authorName}>{authorName}</h3>
            <span className={styles.announcementTitle}>{announcementTitle}</span>
          </div>
        </div>

        <div className={styles.metaSection}>
          <span className={styles.time}>{time}</span>

          {(onEdit || onDelete || onComplaint) && (
            <MoreButton onEdit={onEdit} onDelete={onDelete} onComplaint={onComplaint} />
          )}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.content}>{content}</div>
    </div>
  );
};
