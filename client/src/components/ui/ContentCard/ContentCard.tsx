import React from 'react';
import styles from './ContentCard.module.css';

interface ContentCardProps {
  title?: string;
  headerRightText?: string;
  headerRightComponent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  headerRightText,
  headerRightComponent,
  children,
  className = '',
  noPadding = false,
}) => {
  const hasHeader = Boolean(title || headerRightText || headerRightComponent);

  return (
    <div className={`${styles.card} ${className} ${noPadding ? styles.noPadding : ''}`}>
      {hasHeader && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}

          {(headerRightText || headerRightComponent) && (
            <div className={styles.headerRight}>
              {headerRightText && <span className={styles.headerRightText}>{headerRightText}</span>}
              {headerRightComponent && (
                <div className={styles.headerRightComponent}>{headerRightComponent}</div>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className={`
                ${styles.body} 
                ${!hasHeader ? styles.bodyWithoutHeader : ''}
            `}
      >
        {children}
      </div>
    </div>
  );
};
