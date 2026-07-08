import React from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard.tsx';
import { TestAnswerItem } from '@/components/tests/TestAnswerItem/TestAnswerItem.tsx';
import { TestButtons } from '@/components/tests/TestButtons/TestButtons';
import styles from './TestPassingQuestionCard.module.css';

export type AnswerOption = {
  id: string;
  label: string;
};

export interface TestPassingQuestionCardProps {
  questionNumber: number;
  questionText: string;
  options: AnswerOption[];
  selectedOptionIds: string[];
  onOptionToggle: (optionId: string) => void;
  type?: 'radio' | 'checkbox';
  points?: number;
  className?: string;
  onPrev: () => void;
  onNext: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isSubmitting?: boolean;
}

export const TestPassingQuestionCard: React.FC<TestPassingQuestionCardProps> = ({
  questionNumber,
  questionText,
  options,
  selectedOptionIds,
  onOptionToggle,
  type = 'radio',
  points,
  className = '',
  onPrev,
  onNext,
  isFirstQuestion,
  isLastQuestion,
  isSubmitting = false,
}) => {
  const pointsText = points
    ? `${points} бал${points > 1 && points < 5 ? 'и' : points >= 5 ? 'ів' : ''}`
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <ContentCard
        title={`Питання ${questionNumber}`}
        headerRightText={pointsText}
        className={`${styles.questionCard} ${className}`}
      >
        <div className={styles.content}>
          <h4 className={styles.questionText}>{questionText}</h4>

          <div className={styles.optionsList}>
            {options.map((option) => (
              <TestAnswerItem
                key={option.id}
                label={option.label}
                type={type}
                name={`question-${questionNumber}`}
                checked={selectedOptionIds.includes(option.id)}
                onChange={() => onOptionToggle(option.id)}
              />
            ))}
          </div>
        </div>
      </ContentCard>

      <TestButtons
        onPrev={onPrev}
        onNext={onNext}
        isFirstQuestion={isFirstQuestion}
        isLastQuestion={isLastQuestion}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
