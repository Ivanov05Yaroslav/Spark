import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import {
  QuestionNavCard,
  QuestionStatus,
} from '@/components/tests/QuestionNavCard/QuestionNavCard';
import styles from './QuestionNavPanel.module.css';

export type QuestionNavItem = {
  id: string | number;
  number: number | string;
  status: QuestionStatus;
};

export interface QuestionNavPanelProps {
  questions: QuestionNavItem[];
  onQuestionClick: (id: string | number) => void;
  className?: string;
}

export const QuestionNavPanel: React.FC<QuestionNavPanelProps> = ({
  questions,
  onQuestionClick,
  className = '',
}) => {
  return (
    <ContentCard title="Questions" className={`${styles.panel} ${className}`}>
      <div className={styles.gridContainer}>
        {questions.map((question) => (
          <QuestionNavCard
            key={question.id}
            number={question.number}
            status={question.status}
            onClick={() => onQuestionClick(question.id)}
          />
        ))}
      </div>
    </ContentCard>
  );
};
