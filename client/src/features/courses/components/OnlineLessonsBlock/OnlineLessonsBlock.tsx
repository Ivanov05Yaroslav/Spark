import React from 'react';
import PlusIcon from '@/assets/plus.svg?react';
import { InfoItem } from '@/components/ui/InfoItem/InfoItem';
import styles from './OnlineLessonsBlock.module.css';

export interface OnlineLessonLink {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface OnlineLessonsBlockProps {
  links: OnlineLessonLink[];
  onAdd?: () => void;
  onEditLink?: (id: string) => void;
  onDeleteLink?: (id: string) => void;
}

export const OnlineLessonsBlock: React.FC<OnlineLessonsBlockProps> = ({
  links,
  onAdd,
  onEditLink,
  onDeleteLink,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Посилання на онлайн-уроки</h3>

        {onAdd && (
          <button className={styles.addButton} onClick={onAdd} aria-label="Додати онлайн-урок">
            <PlusIcon className={styles.plusIcon} />
          </button>
        )}
      </div>

      <div className={styles.linksList}>
        {links.length > 0 ? (
          links.map((link) => (
            <div key={link.id} className={styles.linkItem}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkAnchor}
              >
                <InfoItem
                  icon={link.icon}
                  title={link.title}
                  showMoreMenu={!!onEditLink || !!onDeleteLink}
                  onEdit={() => onEditLink?.(link.id)}
                  onDelete={() => onDeleteLink?.(link.id)}
                />
              </a>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>Немає доданих посилань</div>
        )}
      </div>
    </div>
  );
};
