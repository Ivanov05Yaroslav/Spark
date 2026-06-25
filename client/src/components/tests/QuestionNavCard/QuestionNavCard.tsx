import React from 'react';
import styles from './QuestionNavCard.module.css';

export type QuestionStatus = 'answered' | 'unanswered' | 'active';

export interface QuestionNavCardProps {
  number: number | string;
  status: QuestionStatus;
  onClick: () => void;
  className?: string;
}

export const QuestionNavCard: React.FC<QuestionNavCardProps> = ({
  number,
  status,
  onClick,
  className = '',
}) => {
  return (
    <button className={`${styles.card} ${styles[status]} ${className}`} onClick={onClick}>
      {number}
    </button>
  );
};
