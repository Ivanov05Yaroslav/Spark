import React, { useRef, useState, useEffect } from 'react';
import { ContentCard } from '@/components/ui/ContentCard/ContentCard';
import { Input } from '@/components/ui/Input/Input';
import { SelectField } from '@/components/ui/SelectField/SelectField';
import { TestAnswerInput } from '../TestAnswerInput/TestAnswerInput';
import { QuestionType, UIQuestion } from '@/types/tests.types';
import styles from './TestQuestionCard.module.css';
import PlusIcon from '@/assets/plus.svg?react';
import DeleteIcon from '@/assets/delete.svg?react';

interface SelectOption {
  value: string;
  label: string;
}

interface TestQuestionCardProps {
  index: number;
  question: any;
  onUpdate?: (updatedFields: Partial<UIQuestion> & { nusGroupId?: string }) => void;
  onDelete?: () => void;
  isReviewMode?: boolean;
  isTeacherPreviewMode?: boolean;
  nusGroupsOptions?: SelectOption[];
}

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({
  index,
  question,
  onUpdate,
  onDelete,
  isReviewMode = false,
  isTeacherPreviewMode = false,
  nusGroupsOptions = [],
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isReadOnly = isReviewMode || isTeacherPreviewMode;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTypeChange = (value: string) => {
    if (!onUpdate) return;
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
    }
    onUpdate({ type: newType, answers: updatedAnswers });
  };

  const handleAnswerTextChange = (answerId: string, text: string) => {
    if (!onUpdate) return;
    const updatedAnswers = question.answers.map((a: any) =>
      a.id === answerId ? { ...a, content: text } : a,
    );
    onUpdate({ answers: updatedAnswers });
  };

  const handleToggleCorrect = (answerId: string) => {
    if (!onUpdate) return;
    let updatedAnswers = [];
    if (question.type === 'ONE_CHOICE') {
      updatedAnswers = question.answers.map((a: any) => ({
        ...a,
        isCorrect: a.id === answerId,
      }));
    } else {
      updatedAnswers = question.answers.map((a: any) =>
        a.id === answerId ? { ...a, isCorrect: !a.isCorrect } : a,
      );
    }
    onUpdate({ answers: updatedAnswers });
  };

  const handleDeleteAnswer = (answerId: string) => {
    if (!onUpdate) return;
    const updatedAnswers = question.answers.filter((a: any) => a.id !== answerId);
    onUpdate({ answers: updatedAnswers });
  };

  const handleAddAnswer = () => {
    if (!onUpdate) return;
    const newAnswer = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      content: '',
      isCorrect: false,
    };
    onUpdate({ answers: [...question.answers, newAnswer] });
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.questionWrapper} ${isActive && !isReadOnly ? styles.activeCard : ''}`}
      onClick={() => !isReadOnly && setIsActive(true)}
    >
      <div className={styles.cardContainer}>
        <ContentCard
          title={`Запитання ${index + 1}`}
          headerRightComponent={
            isReviewMode && (
              <span className={styles.reviewPoints}>
                Бал за запитання: {question.earnedPoints ?? 0} / {question.maxPoints ?? 0}
              </span>
            )
          }
          headerRightText={isTeacherPreviewMode ? `Балів: ${question.maxPoints}` : undefined}
        >
          <div className={styles.cardContent}>
            {isReadOnly ? (
              <div className={styles.reviewHeader}>
                <div className={styles.reviewQuestionText}>{question.content}</div>
              </div>
            ) : (
              <div className={styles.topRow}>
                <Input
                  label="Бали"
                  type="number"
                  min="0"
                  value={question.points || ''}
                  onChange={(e) => onUpdate && onUpdate({ points: Number(e.target.value) || 0 })}
                  placeholder="1"
                  className={styles.typeInput}
                />

                {nusGroupsOptions.length > 0 && (
                  <SelectField
                    label="Група оцінювання НУШ"
                    value={question.nusGroupId || ''}
                    onChange={(value) => onUpdate && onUpdate({ nusGroupId: value })}
                    options={nusGroupsOptions}
                    placeholder="Оберіть групу"
                    className={styles.typeInput}
                  />
                )}

                <SelectField
                  label="Тип запитання"
                  value={question.type}
                  onChange={handleTypeChange}
                  options={[
                    { value: 'ONE_CHOICE', label: 'Одна правильна відповідь' },
                    { value: 'MULTIPLE_CHOICE', label: 'Кілька правильних відповідей' },
                  ]}
                  className={styles.typeInput}
                />
              </div>
            )}

            {!isReadOnly && (
              <Input
                label={`Запитання`}
                placeholder={'Введіть запитання'}
                value={question.content}
                onChange={(e) => onUpdate && onUpdate({ content: e.target.value })}
                className={styles.questionInput}
              />
            )}

            <div className={styles.answersGrid}>
              {question.answers.map((answer: any, idx: number) => {
                let reviewClass = '';

                if (isReviewMode) {
                  if (answer.isCorrect) {
                    reviewClass = styles.answerCorrect;
                  } else if (answer.isSelectedByStudent && !answer.isCorrect) {
                    reviewClass = styles.answerIncorrect;
                  }
                }

                return (
                  <div
                    key={answer.id}
                    className={`${styles.answerWrapper} ${reviewClass} ${
                      isReadOnly ? styles.reviewReadOnly : ''
                    }`}
                    style={isReadOnly ? { pointerEvents: 'none' } : undefined}
                  >
                    <TestAnswerInput
                      placeholder={`Варіант ${idx + 1}`}
                      value={answer.content}
                      onChange={(e) =>
                        !isReadOnly && handleAnswerTextChange(answer.id, e.target.value)
                      }
                      isCorrect={answer.isCorrect}
                      onToggleCorrect={() => !isReadOnly && handleToggleCorrect(answer.id)}
                      onDelete={
                        question.answers.length > 2 && !isReadOnly
                          ? () => handleDeleteAnswer(answer.id)
                          : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>

            {isActive && !isReadOnly && (
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

      {onDelete && !isReadOnly && (
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
