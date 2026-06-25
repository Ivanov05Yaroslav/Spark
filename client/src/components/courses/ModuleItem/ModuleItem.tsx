import React from 'react';
import styles from './ModuleItem.module.css';

interface ModuleItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}

export const ModuleItem: React.FC<ModuleItemProps> = ({ icon: Icon, title, subtitle, onClick }) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <Icon className={styles.icon} />
      <div className={styles.textContainer}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
};
