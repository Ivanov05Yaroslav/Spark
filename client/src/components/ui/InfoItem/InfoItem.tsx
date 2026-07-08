import React from 'react';
import { MoreButton } from '@/components/ui/MoreButton/MoreButton';
import styles from './InfoItem.module.css';

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  variant?: 'info' | 'task';
  className?: string;
  linkUrl?: string;

  showMoreMenu?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const InfoItem: React.FC<InfoItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  variant = 'info',
  className = '',
  linkUrl,
  showMoreMenu = false,
  onEdit,
  onDelete,
}) => {
  const textContent = (
    <>
      <span className={styles.topText}>{title}</span>
      {subtitle && <span className={styles.bottomText}>{subtitle}</span>}
    </>
  );

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <div className={styles.iconWrapper}>
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', color: 'inherit', textDecoration: 'none' }}
          >
            <Icon className={styles.icon} />
          </a>
        ) : (
          <Icon className={styles.icon} />
        )}
      </div>

      {linkUrl ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.textContainer} ${styles[variant]}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {textContent}
        </a>
      ) : (
        <div className={`${styles.textContainer} ${styles[variant]}`}>{textContent}</div>
      )}

      {showMoreMenu && (
        <div className={styles.moreMenuWrapper}>
          <MoreButton onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
};
