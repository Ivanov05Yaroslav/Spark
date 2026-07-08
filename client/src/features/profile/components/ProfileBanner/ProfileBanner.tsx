import React from 'react';
import { Avatar } from '../../../../components/ui/Avatar/Avatar';
import EditIcon from '../../../../assets/edit.svg?react';
import styles from './ProfileBanner.module.css';

interface BannerProps {
  name: string;
  group: string;
  avatarUrl: string;
  onEditClick?: () => void;
  showEditButton?: boolean;
}

export const ProfileBanner: React.FC<BannerProps> = ({ name, group, avatarUrl, onEditClick }) => {
  return (
    <div className={styles.banner}>
      <div className={styles.userInfo}>
        <Avatar src={avatarUrl} size={120} />
        <div className={styles.textContainer}>
          <h2 className={styles.name}>{name}</h2>
          <span className={styles.group}>{group}</span>
        </div>
      </div>

      <button className={styles.editButton} onClick={onEditClick} aria-label="Редагувати курс">
        <EditIcon className={styles.editIcon} />
      </button>
    </div>
  );
};
