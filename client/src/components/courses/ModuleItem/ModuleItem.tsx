import React from 'react';
import { MoreButton } from '@/components/ui/MoreButton/MoreButton';
import styles from './ModuleItem.module.css';
import { useStore } from '@/stores/useStore.ts';

interface ModuleItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  showMoreMenu?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ModuleItem: React.FC<ModuleItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
  showMoreMenu = false,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <Icon className={styles.icon} />
      <div className={styles.textContainer}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>

      {showMoreMenu && (
        <div
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreButton onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
};
