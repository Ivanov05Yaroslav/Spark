import React from 'react';
import { Dot } from '@/components/notifications/Dot/Dot';
import styles from './AnnouncementItem.module.css';
import { Avatar } from '@/components/ui/Avatar/Avatar.tsx';

interface AnnouncementItemProps {
  authorName: string;
  announcementTitle: string;
  time: string;
  avatarUrl?: string;
  isUnread?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const AnnouncementItem: React.FC<AnnouncementItemProps> = ({
  authorName,
  announcementTitle,
  time,
  avatarUrl,
  isUnread = false,
  isActive = false,
  onClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${styles.container} ${isActive ? styles.active : ''}`} onClick={onClick}>
      <div className={styles.leftSection}>
        {avatarUrl ? (
          <Avatar src={avatarUrl} />
        ) : (
          <div className={styles.avatarPlaceholder}>{getInitials(authorName)}</div>
        )}

        <div className={styles.textContent}>
          <span className={styles.authorName}>{authorName}</span>
          <span className={styles.announcementTitle}>{announcementTitle}</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <span className={styles.time}>{time}</span>
        <div className={styles.dotContainer}>{isUnread && <Dot />}</div>
      </div>
    </div>
  );
};
