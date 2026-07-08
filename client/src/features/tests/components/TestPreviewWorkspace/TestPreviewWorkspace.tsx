import React from 'react';
import { useParams } from 'react-router-dom';
import { TestOverviewCard } from '@/features/tests/components/TestOverviewCard/TestOverviewCard';
import { TestQuestionCard } from '@/components/tests/TestQuestionCard/TestQuestionCard';
import { useTestPreview } from '@/features/tests/hooks/useTestPreview';
import styles from './TestPreviewWorkspace.module.css';

export const TestPreviewWorkspace: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();

  const { test, overviewData, isLoading } = useTestPreview(testId);

  if (isLoading) {
    return (
      <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        Завантаження прев’ю тесту...
      </div>
    );
  }

  if (!test || !overviewData) {
    return (
      <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        Тест не знайдено або виникла помилка.
      </div>
    );
  }

  return (
    <div className={styles.contentGrid}>
      <div className={styles.leftColumn}>
        {test.questions && test.questions.length > 0 ? (
          test.questions.map((question: any, index: number) => (
            <TestQuestionCard
              key={question.id || index}
              index={index}
              question={{
                ...question,
                maxPoints: question.points ?? question.maxPoints ?? 0,
              }}
              isTeacherPreviewMode={true}
            />
          ))
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '200px',
              color: '#9CA3AF',
              fontSize: '14px',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            У цьому тесті ще немає запитань.
          </div>
        )}
      </div>

      <div className={styles.rightColumn}>
        <TestOverviewCard
          duration={overviewData.duration}
          attemptsAllowed={overviewData.attemptsAllowed}
          questionsCount={overviewData.questionsCount}
          dueDate={overviewData.dueDate}
          hasAvailableAttempts={false}
          onStart={() => {}}
        />
      </div>
    </div>
  );
};
