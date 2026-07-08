import React from 'react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import styles from './ParticipantCard.module.css';

export type ParticipantRole = 'Студент' | 'Вчитель' | 'Класний керівник' | 'Співвчитель';

export interface ParticipantData {
  id: string;
  name: string;
  classGroup?: string;
  role: ParticipantRole;
  avatarUrl?: string;
}

interface ParticipantCardProps {
  participant: ParticipantData;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant }) => {
  const { name, classGroup, avatarUrl, role } = participant;

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.avatarWrapper}>
        {avatarUrl ? (
          <Avatar src={avatarUrl} size={64} />
        ) : (
          <div className={styles.avatarPlaceholder}>{getInitials(name)}</div>
        )}
      </div>

      <div className={styles.infoContainer}>
        <h4 className={styles.name}>{name}</h4>
        <p className={styles.metaText}>
          {classGroup && (
            <>
              <span>{classGroup}</span>
              <span className={styles.divider}>|</span>
            </>
          )}
          <span>{role}</span>
        </p>
      </div>
    </div>
  );
};
