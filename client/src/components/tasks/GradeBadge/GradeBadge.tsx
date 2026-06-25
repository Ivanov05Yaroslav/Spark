import React from 'react';
import styles from './GradeBadge.module.css';

export type TaskStatus = 'assigned' | 'submitted' | 'graded' | 'late';

interface GradeBadgeProps {
  grade?: string | number | null;
  maxGrade?: number;
  status: TaskStatus;
  className?: string;
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({
  grade,
  maxGrade,
  status,
  className = '',
}) => {
  const getStatusConfig = (currentStatus: TaskStatus) => {
    switch (currentStatus) {
      case 'assigned':
        return { text: 'Призначено', statusClass: styles.statusAssigned };
      case 'submitted':
        return { text: 'Здано' };
      case 'graded':
        return { text: 'Оцінено' };
      case 'late':
        return { text: 'Прострочено', statusClass: styles.statusLate };
      default:
        return { text: '', statusClass: '' };
    }
  };

  const config = getStatusConfig(status);

  const isGraded = grade !== undefined && grade !== null && grade !== '';

  return (
    <div className={`${styles.container} ${className}`}>
      {isGraded ? (
        <div className={styles.badge}>
          <span className={styles.grade}>{grade}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.maxGrade}>{maxGrade}</span>
        </div>
      ) : (
        <span className={`${styles.statusText} ${config.statusClass}`}>{config.text}</span>
      )}
    </div>
  );
};
