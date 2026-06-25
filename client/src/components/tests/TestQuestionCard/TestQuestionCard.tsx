import React, { useRef, useState, useEffect } from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import { Input } from '@/components/ui/Input/Input';
import { SelectField } from '@/components/ui/SelectField/SelectField';
import { TestAnswerInput } from '../TestAnswerInput/TestAnswerInput';
import { QuestionType, UIQuestion } from '@/types/tests.types';
import styles from './TestQuestionCard.module.css';

import PlusIcon from '@/assets/plus.svg?react';
import DeleteIcon from '@/assets/delete.svg?react';

interface TestQuestionCardProps {
  index: number;
  question: UIQuestion;
  onUpdate: (updatedFields: Partial<UIQuestion>) => void;
  onDelete?: () => void;
}

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({
  index,
  question,
  onUpdate,
  onDelete,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTypeChange = (value: string) => {
    const newType = value as QuestionType;
    let updatedAnswers = [...question.answers];

    if (newType === 'ONE_CHOICE') {
      let foundCorrect = false;
      updatedAnswers = updatedAnswers.map((a) => {
        if (a.isCorrect && !foundCorrect) {
          foundCorrect = true;
          return a;
        }
        return { ...a, isCorrect: false };
      });
      if (!foundCorrect && updatedAnswers.length > 0) {
        updatedAnswers[0].isCorrect = true;
      }
    }

    onUpdate({ type: newType, answers: updatedAnswers });
  };

  const handleAnswerTextChange = (answerId: string, text: string) => {
    const updatedAnswers = question.answers.map((a) =>
      a.id === answerId ? { ...a, content: text } : a,
    );
    onUpdate({ answers: updatedAnswers });
  };

  const handleToggleCorrect = (answerId: string) => {
    const updatedAnswers = question.answers.map((a) => {
      if (question.type === 'ONE_CHOICE') {
        return { ...a, isCorrect: a.id === answerId };
      } else {
        return a.id === answerId ? { ...a, isCorrect: !a.isCorrect } : a;
      }
    });
    onUpdate({ answers: updatedAnswers });
  };

  const handleDeleteAnswer = (answerId: string) => {
    const updatedAnswers = question.answers.filter((a) => a.id !== answerId);
    onUpdate({ answers: updatedAnswers });
  };

  const handleAddAnswer = () => {
    const newAnswerId = Math.random().toString(36).substr(2, 9);
    const updatedAnswers = [
      ...question.answers,
      { id: newAnswerId, content: '', isCorrect: false },
    ];
    onUpdate({ answers: updatedAnswers });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`${styles.questionWrapper} ${isActive ? styles.activeCard : ''}`}
      ref={cardRef}
      onClick={() => setIsActive(true)}
      onFocus={() => setIsActive(true)}
    >
      <div className={styles.cardContainer}>
        <ContentCard title={`Запитання ${index + 1}`}>
          <div className={styles.cardContent}>
            <div className={styles.topRow}>
              <Input
                label="Текст запитання"
                value={question.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Введіть запитання"
                className={styles.questionInput}
              />
              <Input
                label="Бали"
                type="number"
                min="0"
                value={question.points || ''}
                onChange={(e) => onUpdate({ points: Number(e.target.value) || 0 })}
                placeholder="1"
                className={styles.typeSelect}
              />
              <SelectField
                label="Тип запитання"
                options={[
                  { value: 'ONE_CHOICE', label: 'Одинарний вибір' },
                  { value: 'MULTIPLE_CHOICE', label: 'Множинний вибір' },
                ]}
                value={question.type}
                onChange={handleTypeChange}
                className={styles.typeSelect}
              />
            </div>

            <div className={styles.answersGrid}>
              {question.answers.map((answer, idx) => (
                <TestAnswerInput
                  key={answer.id}
                  placeholder={`Варіант ${idx + 1}`}
                  value={answer.content}
                  onChange={(e) => handleAnswerTextChange(answer.id, e.target.value)}
                  isCorrect={answer.isCorrect}
                  onToggleCorrect={() => handleToggleCorrect(answer.id)}
                  onDelete={
                    question.answers.length > 2 ? () => handleDeleteAnswer(answer.id) : undefined
                  }
                />
              ))}
            </div>

            {isActive && (
              <button
                type="button"
                className={styles.addOptionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddAnswer();
                }}
              >
                <PlusIcon className={styles.plusIcon} />
                <span>Додати варіант</span>
              </button>
            )}
          </div>
        </ContentCard>
      </div>

      {onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Видалити запитання"
        >
          <DeleteIcon className={styles.deleteIcon} />
        </button>
      )}
    </div>
  );
};
